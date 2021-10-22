import * as cookie from 'cookie';
import { STATUSES} from '../../../constants.js';
import ApiError from '../../../middleware/error_handling/ApiError.js';
import decodeJWT from '../../../helpers/decode-token.js';
import extractJWT from '../../../helpers/extract-jwt.js';

export default class QueueController {
  constructor(queueService, userService, doctorService) {
    this.queueService = queueService;
    this.userService = userService;
    this.doctorService = doctorService;
  }

  async addToQueue(req, res, next) {
    try {
      const { docID } = req.body;
      const patient = await this.userService.getByUserId(req.payload);
      const result = await this.queueService.add(patient.id, docID);
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
      const result = await this.queueService.getAll();
      res.status(STATUSES.OK).json(result);
    } catch (err) {
      next(err);
    }
  }
}
