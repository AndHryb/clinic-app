import bcrypt from 'bcryptjs';
import clc from 'cli-color';

import { MESSAGES } from '../../constants.js';
import ApiError from '../../middleware/error-handling/ApiError.js';

export default class DoctorService {
  constructor(doctorRepository, doctorRedisRepository) {
    this.doctorRepository = doctorRepository;
    this.doctorRedisRepository = doctorRedisRepository;
  }

  async updateById(options) {
    try {
      let doctor = await this.doctorRepository.getAllDependencies(options.id);
      const updateCashOptions = {
        docId: options.id,
        name: null,
        specs: null,
      };
      if (!doctor) throw ApiError.notFound(MESSAGES.NO_DOC);

      if (options.name) {
        doctor.name = options.name;
        updateCashOptions.name = options.name;
      }

      if (options.email) {
        doctor.email = options.email;
      }

      if (options.oldPassword && options.newPassword) {
        doctor = await this.constructor.updatePassword(
          doctor, options.oldPassword, options.newPassword,
        );
      }

      if (options.specNames) {
        doctor = await this.updateSpecs(doctor, options.specNames);
        updateCashOptions.specs = options.specNames;
      }

      await this.doctorRepository.update(doctor);

      const cachResult = await this.doctorRedisRepository.update(updateCashOptions);
      if (cachResult) console.log(clc.red('cach updated'));

      return doctor;
    } catch (err) {
      console.log(`Doctor service updateById error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async deleteById(id) {
    try {
      const res = await this.doctorRepository.deleteById(id);
      if (!res) throw ApiError.notFound(MESSAGES.NO_DOC);
      const deletedFromCach = await this.doctorRedisRepository.delete(id);
      if (deletedFromCach) console.log(clc.red('cache cleared'));
      return res;
    } catch (err) {
      console.log(`Doctor service deleteById error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async getDoctors() {
    try {
      const cache = await this.doctorRedisRepository.getAll();
      if (cache && cache.length !== 0) {
        console.log(clc.red('cahed data'));
        return cache;
      }
      const res = await this.doctorRepository.getDoctors();
      if (!res) throw ApiError.notFound(MESSAGES.NO_DOC);
      const dataCached = await this.doctorRedisRepository.setData(res);
      if (dataCached) console.log(clc.red('response cached'));

      return res;
    } catch (err) {
      console.log(`Doctor service getDoctors error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async getByUserId(userId) {
    try {
      const res = await this.doctorRepository.getByUserId(userId);
      if (!res) throw ApiError.notFound(MESSAGES.NO_DOC);

      return res;
    } catch (err) {
      console.log(`Doctor service getByUserId error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async getSpecByUserId(userId) {
    try {
      const res = await this.doctorRepository.getSpecByUserId(userId);
      if (!res) throw ApiError.notFound(MESSAGES.NO_DOC);

      return res;
    } catch (err) {
      console.log(`Doctor service getSpecByUserId error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async updateSpecs(doc, newSpecList) {
    const doctor = doc;
    const oldSpecs = doctor.specializations.map((elem) => elem.name);

    const handledOldSpecs = oldSpecs.filter((elem) => !(newSpecList.includes(elem)));
    const handledNewSpecs = newSpecList.filter((elem) => !(oldSpecs.includes(elem)));
    if (handledNewSpecs.length === 0) {
      throw ApiError.badRequest(MESSAGES.SPECS_NOT_CHANGED);
    } else {
      const result = await this.doctorRepository.setSpecsByName(
        doctor.id, handledNewSpecs, handledOldSpecs,
      );
      if (result) doctor.specializations = newSpecList.map((elem) => ({ name: elem }));
    }

    return doctor;
  }

  static async updatePassword(doc, oldPassword, newPassword) {
    const doctor = doc;
    const resultPassword = bcrypt.compareSync(oldPassword, doctor.password);
    if (resultPassword) {
      const salt = bcrypt.genSaltSync(10);
      doctor.password = bcrypt.hashSync(newPassword, salt);
    } else {
      throw ApiError.forbidden(MESSAGES.PASSWORD_NOT_MATCH);
    }

    return doctor;
  }
}
