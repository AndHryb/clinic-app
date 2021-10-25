import express from 'express';
import { injector } from '../injector.js';

const doctorRouter = express.Router();
const doctorController = injector.getDoctorController();

doctorRouter.get('/all',
  doctorController.getDoctors.bind(doctorController));

doctorRouter.get('/specialities',
  doctorController.getSpecByUserId.bind(doctorController));

doctorRouter.patch('/',
  doctorController.updateById.bind(doctorController));

export default doctorRouter;
