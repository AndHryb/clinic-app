import { MESSAGES } from '../../../constants.js';
import ApiError from '../../../error_handling/ApiError.js';

export default class DoctorService {
  constructor(repository) {
    this.repository = repository;
  }

  async getDoctors() {
    try {
      const res = await this.repository.getDoctors();
      if (!res) {
        return ApiError.notFound(MESSAGES.NO_DOC);
      }

      return res;
    } catch (err) {
      console.log(`Doctor service getDoctors error :${err.name} : ${err.message}`);
      return err;
    }
  }

  async getByUserId(userId) {
    try {
      const res = await this.repository.getByUserId(userId);
      if (!res) {
        return ApiError.notFound(MESSAGES.NO_DOC);
      }

      return res;
    } catch (err) {
      console.log(`Doctor service getByUserId error :${err.name} : ${err.message}`);
      return err;
    }
  }

  async getSpecByUserId(userId) {
    try {
      const res = await this.repository.getSpecByUserId(userId);
      if (!res) {
        return ApiError.notFound(MESSAGES.NO_DOC);
      }

      return res;
    } catch (err) {
      console.log(`Doctor service getSpecByUserId error :${err.name} : ${err.message}`);
      return err;
    }
  }
}
