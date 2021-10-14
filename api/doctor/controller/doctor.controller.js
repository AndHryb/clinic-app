import * as cookie from 'cookie';
import { STATUSES } from '../../../constants.js';
import ApiError from '../../../error_handling/ApiError.js';
import checkJwtToken from '../../../helpers/decode-token.js';

export default class DoctorController {
  constructor(service) {
    this.service = service;
  }

  async getDoctors(req, res, next) {
    try {
      const result = await this.service.getDoctors();
      if (result instanceof ApiError) {
        next(result);
      } else {
        res.status(STATUSES.OK).json(result);
      }
    } catch (err) {
      next(err);
    }
  }

  async getSpecByUserId(req, res, next) {
    try {
      const cookies = cookie.parse(req.headers.cookie);
      const { doctorToken } = cookies;
      const { userId } = checkJwtToken(doctorToken);

      const result = await this.service.getSpecByUserId(userId);
      if (result instanceof ApiError) {
        next(result);
      } else {
        res.status(STATUSES.OK).json(result);
      }
    } catch (err) {
      next(err);
    }
  }
}
