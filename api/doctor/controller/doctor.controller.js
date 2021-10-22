import * as cookie from 'cookie';
import { STATUSES } from '../../../constants.js';
import ApiError from '../../../middleware/error_handling/ApiError.js';
import decodeJWT from '../../../helpers/decode-token.js';
import extractJWT from '../../../helpers/extract-jwt.js';

export default class DoctorController {
  constructor(service) {
    this.service = service;
  }

  async getDoctors(req, res, next) {
    try {
      const result = await this.service.getDoctors();
      res.status(STATUSES.OK).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getSpecByUserId(req, res, next) {
    try {
      const { userId } = req.payload;
      const result = await this.service.getSpecByUserId(userId);
      res.status(STATUSES.OK).json(result);
    } catch (err) {
      next(err);
    }
  }
}
