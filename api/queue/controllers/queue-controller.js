import * as cookie from 'cookie';
import { STATUSES, NO_PATIENT_MSG, MESSAGES } from '../../../constants.js';
import ApiError from '../../../error_handling/ApiError.js';
import checkJwtToken from '../../../helpers/decode-token.js';

export default class QueueController {
  constructor(queueService, userService, doctorService) {
    this.queueService = queueService;
    this.userService = userService;
    this.doctorService = doctorService;
  }

  async addToQueue(req, res, next) {
    try {
      const cookies = cookie.parse(req.headers.cookie);
      const { token } = cookies;
      const { docID } = req.body;
      const { userId } = checkJwtToken(token);
      const patient = await this.userService.getByUserId(userId);
      const result = await this.queueService.add(patient.id, docID);
      if (result instanceof ApiError) {
        next(result);
      } else {
        res.status(STATUSES.Created).json(result);
      }
    } catch (err) {
      next(err);
    }
  }

  async getNext(req, res, next) {
    try {
      const cookies = cookie.parse(req.headers.cookie);
      const { doctorToken } = cookies;
      const { userId } = checkJwtToken(doctorToken);
      const { id } = await this.doctorService.getByUserId(userId);
      const result = await this.queueService.get(id);
      res.set('Content-Type', 'application/json;charset=utf-8');
      if (result instanceof ApiError) {
        next(result);
      } else {
        res.status(STATUSES.OK).json(result);
      }
    } catch (err) {
      next(err);
    }
  }

  async getAllQueues(req, res, next) {
    try {
      const result = await this.queueService.getAll();
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
