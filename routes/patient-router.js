import express from 'express';
import path from 'path';
import events from 'events';
import * as cookie from 'cookie';
import Ajv from 'ajv';
import { injector } from '../injector.js';
import { STATUSES } from '../constants.js';
import { checkDocId } from '../helpers/validation-schems-ajv/checkName.js';
import checkPatientToken from '../helpers/checkJwtPatient.js';
const userController = injector.getUserController();

const __dirname = path.resolve();
const patientRouter = express.Router();
const queueController = injector.getQueueController();
const ajv = new Ajv();

patientRouter.get('/', userController.checkPatientToken.bind(userController), async (req, res) => {
  res.sendFile(path.resolve(__dirname, 'static', 'patient.html'));
});

patientRouter.get('/next-in-queue', 
queueController.getNext.bind(queueController)
);

patientRouter.post('/in-queue', 
  async (req, res, next) => {
  ajv.validate(checkDocId, req.body.docID)
    ? next()
    : res.status(STATUSES.BadRequest).json('You have to choose doctor');
}, queueController.addToQueue.bind(queueController));

patientRouter.get('/all-queues',
  queueController.getAllQueues.bind(queueController)
);

export default patientRouter;
