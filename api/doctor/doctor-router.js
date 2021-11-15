import express from 'express';
import injector from '../../injector.js';
import checkUpdateDoctorData from '../../helpers/validation-schems-ajv/checkUpdateDoctorData.js';
import validator from '../../middleware/validate.js';

const doctorRouter = express.Router();
const doctorController = injector.getDoctorController();

doctorRouter.get('/all',
  doctorController.getDoctors.bind(doctorController));

doctorRouter.get('/specialities',
  doctorController.getSpecByUserId.bind(doctorController));

doctorRouter.patch('/',
  validator(checkUpdateDoctorData, 'body'),
  doctorController.updateById.bind(doctorController));

doctorRouter.delete('/',
  doctorController.deleteById.bind(doctorController));

export default doctorRouter;
