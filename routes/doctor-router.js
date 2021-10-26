import express from 'express';
import Ajv from 'ajv';
import { injector } from '../injector.js';
import { STATUSES, MESSAGES } from '../constants.js';
import checkUpdateDoctorData from '../helpers/validation-schems-ajv/checkUpdateDoctorData.js';

const ajv = new Ajv();

const doctorRouter = express.Router();
const doctorController = injector.getDoctorController();

doctorRouter.get('/all',
  doctorController.getDoctors.bind(doctorController));

doctorRouter.get('/specialities',
  doctorController.getSpecByUserId.bind(doctorController));

doctorRouter.patch('/', async (req, res, next) => {
  if (ajv.validate(checkUpdateDoctorData, req.body)) {
    next();
  } else { res.status(STATUSES.BadRequest).json(MESSAGES.UNCORECT_DATA); }
},
doctorController.updateById.bind(doctorController));

doctorRouter.delete('/',
  doctorController.deleteById.bind(doctorController));

export default doctorRouter;
