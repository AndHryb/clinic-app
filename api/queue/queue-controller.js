import { STATUSES } from '../../constants.js';

export default class QueueController {
  constructor(queueService, userService, doctorService) {
    this.queueService = queueService;
    this.userService = userService;
    this.doctorService = doctorService;
  }

  async addToQueue(req, res, next) {
    try {
      const { docId, specId } = req.body;
      const patient = await this.userService.getByUserId(req.payload);
      const result = await this.queueService.add(patient.id, docId, specId);
      res.status(STATUSES.Created).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getNext(req, res, next) {
    try {
      const { userId } = req.payload;
      const { id } = await this.doctorService.getByUserId(userId);
      const result = await this.queueService.get(id);
      res.set('Content-Type', 'application/json;charset=utf-8');
      res.status(STATUSES.OK).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getAllQueues(req, res, next) {
    try {
      const { userId } = req.payload;
      const result = await this.queueService.getAll(userId);
      res.status(STATUSES.OK).json(result);
    } catch (err) {
      next(err);
    }
  }
}
