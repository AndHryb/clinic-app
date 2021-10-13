import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
//import decodeToken from '../../../helpers/decode-token.js';
import checkJwtToken from '../../../helpers/decode-token.js';
import { WRONG_EMAIL_MSG, WRONG_PASS_MSG, USER_TYPE } from '../../../constants.js';

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
        return false;
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

      const patient = await this.patientRepository.add(options);
      if (!patient) {
        return false;
      }

      return this.getToken(user);
    } catch (err) {
      console.log(`User service registration error :${err.name} : ${err.message}`);
      throw new Error(err);
    }
  }

  async login(data) {
    try {
      const resData = {
        email: false,
        password: false,
        token: undefined,
      };
      const candidate = await this.userRepository.checkEmail(data.email);
      if (!candidate) {
        return resData;
      }
      resData.email = true;
      const resultPassword = bcrypt.compareSync(data.password, candidate.password);
      if (!resultPassword) {
        return resData;
      }
      resData.password = true;

      resData.token = this.getToken(candidate);

      return resData;
    } catch (err) {
      console.log(`User service login error :${err.name} : ${err.message}`);
    }
  }

  async getByToken(token) {
    try {
      if (!token) {
        return false;
      }
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
    }
  }


  async getByUserId(userId) {
    try {
      const result = await this.patientRepository.getByUserId(userId);
      return result;
    } catch (err) {
      console.log(`User service getByToken error :${err.name} : ${err.message}`);
    }
  }

  getToken(data) {
    const token = jwt.sign({
      email: data.email,
      userId: data.id,
      role: 'patient',
    }, process.env.JWT_KEY);

    return token;
  }

  async doctorLogin(email, currPassword) {
    const { password, id } = await this.userRepository.checkEmail(email);
    if (!password) throw new Error(WRONG_EMAIL_MSG);

    const isPasswordMatches = await bcrypt.compare(currPassword, password);
    if (!isPasswordMatches) throw new Error(WRONG_PASS_MSG);

    const token = await this.createDoctorToken(id);

    return token;
  }

  async createDoctorToken(id) {
    const token = jwt.sign({
      userId: id,
      role: 'doctor',
    }, process.env.JWT_KEY);

    return token;
  }
}
