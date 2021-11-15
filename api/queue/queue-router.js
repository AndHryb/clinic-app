import express from 'express';
import injector from '../../injector.js';
import checkQueueData from '../../helpers/validation-schems-ajv/checkAddToQueueData.js';
import validate from '../../middleware/validate.js';

const queueRouter = express.Router();
const queueController = injector.getQueueController();

queueRouter.get('/next',
  queueController.getNext.bind(queueController));

queueRouter.post('/',
  validate(checkQueueData, 'body'),
  queueController.addToQueue.bind(queueController));

queueRouter.get('/all',
  queueController.getAllQueues.bind(queueController));

export default queueRouter;
