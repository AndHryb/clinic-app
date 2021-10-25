import { MESSAGES } from '../../../constants.js';
import ApiError from '../../../middleware/error_handling/ApiError.js';

export default class DoctorService {
  constructor(doctorRepository, userRepository) {
    this.doctorRepository = doctorRepository;
    this.userRepository = userRepository;
  }

  // async createDoctor(options) {
  //   try {
  //     const res = await this.doctorRepository.create(options);
  //     return res;
  //   } catch (err) {
  //     console.log(`Doctor service createDoctor error :${err.name} : ${err.message}`);
  //     throw err;
  //   }
  // }

  async updateById(options) {
    try {
      const res = await this.doctorRepository.updateById(options);
      if (!res) {
        throw ApiError.notFound(MESSAGES.NO_DOC);
      }
      return res;
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
