import * as cookie from 'cookie';
import { STATUSES, NO_PATIENT_MSG } from '../../../constants.js';
import checkJwtToken from '../../../helpers/decode-token.js';

export default class QueueController {
  constructor(queueService, userService, doctorService) {
    this.queueService = queueService;
    this.userService = userService;
    this.doctorService = doctorService;
  }

  async addToQueue(req, res) {
    try {
      const cookies = cookie.parse(req.headers.cookie);
      const { token } = cookies;
      const { docID } = req.body;
      const { userId } = checkJwtToken(token);
      const patient = await this.userService.getByUserId(userId);
      if (!patient) throw (new Error(NO_PATIENT_MSG));
      const result = await this.queueService.add(patient.id, docID);
      res.status(STATUSES.Created).json(result);
    } catch (err) {
      res.status(STATUSES.NotFound).json(err);
    }
  }

  async getNext(req, res) {
    const cookies = cookie.parse(req.headers.cookie);
    const { doctorToken } = cookies;
    const { userId } = checkJwtToken(doctorToken);
    const { id } = await this.doctorService.getByUserId(userId);
    const result = await this.queueService.get(id);
    res.set('Content-Type', 'application/json;charset=utf-8');
    
    if (!result) {
      res.status(STATUSES.NotFound).json('The queue is empty');
    }else{
      res.status(STATUSES.OK).json(result);
    }
    
  }

  async getAllQueues(req, res) {
    const result = await this.queueService.getAll();
    if (result.length === 0) {
      res.status(STATUSES.NotFound).json('The all queues is empty');
    }else{
      res.status(STATUSES.OK).json(result);
    }
  }
}
