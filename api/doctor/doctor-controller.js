import { STATUSES } from '../../constants.js';

export default class DoctorController {
  constructor(doctorService) {
    this.doctorService = doctorService;
  }

  async updateById(req, res, next) {
    try {
      const options = req.body;
      const result = await this.doctorService.updateById(options);
      res.status(STATUSES.OK).json(result);
    } catch (err) {
      next(err);
    }
  }

  async deleteById(req, res, next) {
    try {
      const { id } = req.body;
      const result = await this.doctorService.deleteById(id);
      res.status(STATUSES.OK).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getDoctors(req, res, next) {
    try {
      const result = await this.doctorService.getDoctors();
      res.status(STATUSES.OK).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getSpecByUserId(req, res, next) {
    try {
      const { userId } = req.payload;
      const result = await this.doctorService.getSpecByUserId(userId);
      res.status(STATUSES.OK).json(result);
    } catch (err) {
      next(err);
    }
  }
}
