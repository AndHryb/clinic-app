import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import checkJwtToken from '../../../helpers/decode-token.js';
import { USER_TYPE, MESSAGES} from '../../../constants.js';
import ApiError from '../../../error_handling/ApiError.js';

export default class UserService {
  constructor(userRepository, patientRepository, doctorRepository) {
    this.userRepository = userRepository;
    this.patientRepository = patientRepository;
    this.doctorRepository = doctorRepository;
  }

  async registration(data) {
    try {
      const candidate = await this.userRepository.checkEmail(data.email);
      if (candidate) {
        return ApiError.conflict(MESSAGES.EMAIL_EXIST);
      }
      const salt = bcrypt.genSaltSync(10);
      const { password } = data;
      const user = await this.userRepository.add(data.email, bcrypt.hashSync(password, salt));
      const options = {
        name: data.name,
        gender: data.gender,
        birthday: new Date(data.birthday),
        userId: user.id,
      };
      await this.patientRepository.add(options);

      return this.createPatientToken(user);
    } catch (err) {
      console.log(`User service registration error :${err.name} : ${err.message}`);
      return err;
    }
  }

  async login(data) {
    try {
      const candidate = await this.userRepository.checkEmail(data.email);
      if (!candidate) {
        return ApiError.unauthorized(MESSAGES.EMAIL_NOT_FOUND);
      }
      const resultPassword = bcrypt.compareSync(data.password, candidate.password);
      if (!resultPassword) {
        return ApiError.unauthorized(MESSAGES.PASSWORD_NOT_MATCH);
      }

      return this.createPatientToken(candidate);
    } catch (err) {
      console.log(`User service login error :${err.name} : ${err.message}`);
      return err;
    }
  }

  async getByToken(token) {
    try {
      const decoded = await checkJwtToken(token);
      const { userId, role } = decoded;
      let result;
      if (role == USER_TYPE.PATIENT) {
        result = await this.patientRepository.getByUserId(userId);
      } else {
        result = await this.doctorRepository.getByUserId(userId);
      }

      return result;
    } catch (err) {
      console.log(`User service getByPatientToken error :${err.name} : ${err.message}`);
      return err;
    }
  }

  async getByUserId(userId) {
    try {
      const result = await this.patientRepository.getByUserId(userId);
      return result;
    } catch (err) {
      console.log(`User service getByToken error :${err.name} : ${err.message}`);
      return err;
    }
  }

  async doctorLogin(email, currPassword) {
    try {
      const candidate = await this.userRepository.checkEmail(email);
      if (!candidate) {
        return ApiError.unauthorized(MESSAGES.EMAIL_NOT_FOUND);
      }
      const isPasswordMatches = await bcrypt.compare(currPassword, candidate.password);
      if (!isPasswordMatches) {
        return ApiError.unauthorized(MESSAGES.PASSWORD_NOT_MATCH);
      }
      const token = await this.createDoctorToken(candidate);

      return token;
    } catch (err) {
      console.log(`User service doctorLogin error :${err.name} : ${err.message}`);
      return err;
    }
  }

  createPatientToken(data) {
    const token = jwt.sign({
      email: data.email,
      userId: data.id,
      role: 'patient',
    }, process.env.JWT_KEY);

    return token;
  }

  createDoctorToken(data) {
    const token = jwt.sign({
      email: data.email,
      userId: data.id,
      role: 'doctor',
    }, process.env.JWT_KEY);

    return token;
  }
}
