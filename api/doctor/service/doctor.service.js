import bcrypt from 'bcryptjs';
import { MESSAGES } from '../../../constants.js';
import ApiError from '../../../middleware/error_handling/ApiError.js';

export default class DoctorService {
  constructor(doctorRepository, userRepository) {
    this.doctorRepository = doctorRepository;
    this.userRepository = userRepository;
  }

  async updateById(options) {
    try {
      const doctor = await this.doctorRepository.getById(options.id);
      if (!doctor) {
        throw ApiError.notFound(MESSAGES.NO_DOC);
      }

      let changeIndicator = false;

      if (doctor.name !== options.name && options.name) {
        doctor.name = options.name;
        changeIndicator = true;
      } else if (doctor.name === options.name) {
        throw ApiError.badRequest(MESSAGES.NAME_NOT_CHANGED);
      }

      let user;

      if ((doctor.email !== options.email && options.email)
          || (options.oldPassword && options.newPassword)) {
        user = await this.userRepository.getById(doctor.userId);
        if (!user) {
          throw ApiError.notFound(MESSAGES.NO_USER);
        }
        if (doctor.email !== options.email && options.email) {
          doctor.email = options.email;
          user.email = options.email;
        } else if (doctor.email === options.email) {
          throw ApiError.badRequest(MESSAGES.EMAL_NOT_CHANGED);
        }

        if (options.oldPassword && options.newPassword) {
          const resultPassword = bcrypt.compareSync(options.oldPassword, user.password);
          if (resultPassword) {
            const salt = bcrypt.genSaltSync(10);
            user.password = bcrypt.hashSync(options.newPassword, salt);
          } else {
            throw ApiError.forbidden(MESSAGES.PASSWORD_NOT_MATCH);
          }
        }
        changeIndicator = true;
      }

      let handledOldSpecs;
      let handledNewSpecs;

      if (options.specNames) {
        const specReq = await this.doctorRepository.getSpec(options.id);
        if (!specReq) {
          throw ApiError.badRequest(MESSAGES.NO_SPECS);
        }
        const oldSpecs = specReq.specialties.map((elem) => elem.name);

        handledOldSpecs = oldSpecs.filter((elem) => !(options.specNames.includes(elem)));
        handledNewSpecs = options.specNames.filter((elem) => !(oldSpecs.includes(elem)));
        if (handledNewSpecs.length === 0) {
          throw ApiError.badRequest(MESSAGES.SPECS_NOT_CHANGED);
        }
        changeIndicator = true;
      }

      const updateOptions = {
        doctor,
        user,
        oldSpecs: handledOldSpecs,
        newSpecs: handledNewSpecs,
      };

      let result;

      if (changeIndicator) {
        result = await this.doctorRepository.updateById(updateOptions);
      }else{
        throw ApiError.badRequest(MESSAGES.UPDATE_FAIL);
      }

      return result;
    } catch (err) {
      console.log(`Doctor service updateById error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async deleteById(id) {
    try {
      const res = await this.doctorRepository.deleteById(id);
      if (!res) {
        throw ApiError.notFound(MESSAGES.NO_DOC);
      }
      return res;
    } catch (err) {
      console.log(`Doctor service deleteById error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async getDoctors() {
    try {
      const res = await this.doctorRepository.getDoctors();
      if (!res) {
        throw ApiError.notFound(MESSAGES.NO_DOC);
      }

      return res;
    } catch (err) {
      console.log(`Doctor service getDoctors error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async getByUserId(userId) {
    try {
      const res = await this.doctorRepository.getByUserId(userId);
      if (!res) {
        throw ApiError.notFound(MESSAGES.NO_DOC);
      }

      return res;
    } catch (err) {
      console.log(`Doctor service getByUserId error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async getSpecByUserId(userId) {
    try {
      const res = await this.doctorRepository.getSpecByUserId(userId);
      if (!res) {
        throw ApiError.notFound(MESSAGES.NO_DOC);
      }

      return res;
    } catch (err) {
      console.log(`Doctor service getSpecByUserId error :${err.name} : ${err.message}`);
      throw err;
    }
  }
}
