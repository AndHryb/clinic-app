import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import clc from 'cli-color';
import { USER_TYPE, MESSAGES } from '../../../constants.js';
import ApiError from '../../../middleware/error-handling/ApiError.js';

export default class UserService {
  constructor(
    userRepository, patientRepository, doctorRepository, doctorRedisRepository,
  ) {
    this.userRepository = userRepository;
    this.patientRepository = patientRepository;
    this.doctorRepository = doctorRepository;
    this.doctorRedisRepository = doctorRedisRepository;
  }

  async registration(data) {
    try {
      const candidate = await this.userRepository.getByEmail(data.email);
      if (candidate) throw ApiError.conflict(MESSAGES.EMAIL_EXIST);
      const result = await (data.role === USER_TYPE.PATIENT
        ? this.createPatient(data)
        : this.createDoctor(data));
      const token = this.constructor.createToken(result.user);
      const { entity } = result;

      return { entity, token };
    } catch (err) {
      console.log(`User service registration error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  static async encryptPassword(password) {
    try {
      const salt = bcrypt.genSaltSync(10);

      return bcrypt.hashSync(password, salt);
    } catch (err) {
      console.log(`User service encryptPassword error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async createPatient(data) {
    try {
      const options = {
        ...data,
        password: await this.constructor.encryptPassword(data.password),
        birthday: new Date(data.birthday),
      };
      const result = await this.patientRepository.create(options);

      return result;
    } catch (err) {
      console.log(`User service createPatient error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async createDoctor(data) {
    try {
      const options = {
        ...data,
        password: await this.constructor.encryptPassword(data.password),
      };
      const result = await this.doctorRepository.create(options);
      const updateCache = await this.doctorRedisRepository.add({
        docId: result.entity.id,
        name: result.entity.name,
        specs: data.specNames,
      });
      if (updateCache) console.log(clc.red('cache updated'));

      return result;
    } catch (err) {
      console.log(`User service createDoctor error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async login(data) {
    try {
      const candidate = await this.userRepository.getByEmail(data.email);
      if (!candidate) throw ApiError.unauthorized(MESSAGES.EMAIL_NOT_FOUND);
      const resultPassword = bcrypt.compareSync(data.password, candidate.password);
      if (!resultPassword) throw ApiError.unauthorized(MESSAGES.PASSWORD_NOT_MATCH);
      const token = this.constructor.createToken(candidate);

      return { token, role: candidate.role };
    } catch (err) {
      console.log(`User service login error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async getByUserId(payload) {
    try {
      if (!payload) throw ApiError.unauthorized(MESSAGES.TOKEN_NOT_FOUND);
      const { userId, role } = payload;
      const result = await (role === USER_TYPE.PATIENT
        ? this.patientRepository.getByUserId(userId)
        : await this.doctorRepository.getByUserId(userId));

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
