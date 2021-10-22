import { STATUSES } from '../../../constants.js';

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
