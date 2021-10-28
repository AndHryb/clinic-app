import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { USER_TYPE, MESSAGES } from '../../../constants.js';
import ApiError from '../../../middleware/error_handling/ApiError.js';

export default class UserService {
  constructor(userRepository, patientRepository, doctorRepository) {
    this.userRepository = userRepository;
    this.patientRepository = patientRepository;
    this.doctorRepository = doctorRepository;
  }

  async registration(data) {
    try {
      const candidate = await this.userRepository.getByEmail(data.email);
      if (candidate) {
        throw ApiError.conflict(MESSAGES.EMAIL_EXIST);
      }
      const salt = bcrypt.genSaltSync(10);
      const { password } = data;
      const role = USER_TYPE.PATIENT;
      const options = {
        name: data.name,
        email: data.email,
        password: bcrypt.hashSync(password, salt),
        gender: data.gender,
        birthday: new Date(data.birthday),
        role,
      };
      const result = await this.patientRepository.create(options);
      const token = this.constructor.createToken(result.user);
      return { patient: result.patient, token };
    } catch (err) {
      console.log(`User service registration error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async registrationDoctor(data) {
    try {
      const candidate = await this.userRepository.getByEmail(data.email);
      if (candidate) {
        throw ApiError.conflict(MESSAGES.EMAIL_EXIST);
      }
      const salt = bcrypt.genSaltSync(10);
      const { password } = data;
      const role = USER_TYPE.DOCTOR;
      const options = {
        name: data.name,
        email: data.email,
        password: bcrypt.hashSync(password, salt),
        role,
        specNames: data.specNames,
      };
      const result = await this.doctorRepository.create(options);
      const token = this.constructor.createToken(result.user);
      return { doctor: result.doctor, token };
    } catch (err) {
      console.log(`User service registrationDoctor error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async login(data) {
    try {
      const candidate = await this.userRepository.getByEmail(data.email);
      if (!candidate) {
        throw ApiError.unauthorized(MESSAGES.EMAIL_NOT_FOUND);
      }
      const resultPassword = bcrypt.compareSync(data.password, candidate.password);
      if (!resultPassword) {
        throw ApiError.unauthorized(MESSAGES.PASSWORD_NOT_MATCH);
      }
      const token = this.constructor.createToken(candidate);

      return { token, role: candidate.role };
    } catch (err) {
      console.log(`User service login error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async getByUserId(payload) {
    try {
      if (!payload) {
        throw ApiError.unauthorized(MESSAGES.TOKEN_NOT_FOUND);
      }
      const { userId, role } = payload;
      let result;
      if (role === USER_TYPE.PATIENT) {
        result = await this.patientRepository.getByUserId(userId);
      } else {
        result = await this.doctorRepository.getByUserId(userId);
      }

      return result;
    } catch (err) {
      console.log(`User service getById error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  static createToken(data) {
    try {
      const token = jwt.sign({
        email: data.email,
        userId: data.id,
        role: data.role,
      }, process.env.JWT_KEY,
      {
        expiresIn: Number(process.env.JWT_TTL),
      });

      return token;
    } catch (err) {
      console.log(`User service createToken error :${err.name} : ${err.message}`);
      throw err;
    }
  }
}
