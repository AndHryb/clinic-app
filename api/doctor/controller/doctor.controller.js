import * as cookie from 'cookie';
import { STATUSES } from '../../../constants.js';
import Request from '../../../helpers/request.js';
import checkJwtToken from '../../../helpers/decode-token.js';

export default class DoctorController {
  constructor(service) {
    this.service = service;
  }

  async getDoctors(req, res) {
    try {
      const result = await this.service.getDoctors();
      console.log(result);
      res.status(STATUSES.OK).json(result)
    } catch (err) {
      console.log(err);
      res.status(STATUSES.NotFound).json(err);
    }
  }

  async getSpecByUserId(req, res) {
    try {
      const cookies = cookie.parse(req.headers.cookie);
      const { doctorToken } = cookies;
      const { userId } = checkJwtToken(doctorToken);
      
      const result = await this.service.getSpecByUserId(userId);
      res.status(STATUSES.OK).json(result);
    } catch (err) {
      console.log(err);
      res.status(STATUSES.NotFound).json(err);
    }
  }

}
