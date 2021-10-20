import express from 'express';
import path from 'path';
import Ajv from 'ajv';
import { injector } from '../injector.js';
import { STATUSES } from '../constants.js';
import { checkDocId } from '../helpers/validation-schems-ajv/checkName.js';

const queueRouter = express.Router();
const queueController = injector.getQueueController();
const ajv = new Ajv();

queueRouter.get('/next', 
queueController.getNext.bind(queueController)
);

queueRouter.post('/', 
  async (req, res, next) => {
  ajv.validate(checkDocId, req.body.docID)
    ? next()
    : res.status(STATUSES.BadRequest).json('You have to choose doctor');
}, queueController.addToQueue.bind(queueController));

queueRouter.get('/all',
  queueController.getAllQueues.bind(queueController)
);

export default queueRouter;
