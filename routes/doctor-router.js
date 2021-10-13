import express from 'express';
import path from 'path';
import Ajv from 'ajv';
import * as cookie from 'cookie';
import { injector } from '../injector.js';
import { STATUSES } from '../constants.js';
import { checkResolutionSchema } from '../helpers/validation-schems-ajv/checkResolution.js';
import { checkNameSchema } from '../helpers/validation-schems-ajv/checkName.js';
import checkJwtToken from '../helpers/decode-token.js';


const __dirname = path.resolve();
const doctorRouter = express.Router();
const ajv = new Ajv();
const resolutionController = injector.getResolutionController();
const doctorController = injector.getDoctorController();
const userController = injector.getUserController();

doctorRouter.get('/', userController.checkDoctorToken.bind(userController), (req, res) => {
  res.sendFile(path.resolve(__dirname, 'static', 'doctor.html'));
});

doctorRouter.post('/resolution',
  async (req, res, next) => {
    if (ajv.validate(checkResolutionSchema, req.body.value)) {
      next();
    } else {
      res.status(STATUSES.BadRequest).json('The field must not be empty');
    }
  },resolutionController.addResolution.bind(resolutionController)
);

doctorRouter.get('/resolution/me', 
resolutionController.getResolutionByToken.bind(resolutionController));


doctorRouter.get('/resolution-patient',
  async (req, res, next) => {
    if (ajv.validate(checkNameSchema, req.query.name)) {
      next();
    } else {
      res.status(STATUSES.BadRequest).json('Incorrect patient name');
    }
  },
  resolutionController.getResolutionsByName.bind(resolutionController)
);

doctorRouter.delete('/resolution',
  async (req, res, next) => {
    if (req.body.value) {
      next();
    } else {
      res.status(STATUSES.BadRequest).json('Incorrect patient name');
    }
  },
  resolutionController.deleteResolution.bind(resolutionController)
);

doctorRouter.get('/all',
  doctorController.getDoctors.bind(doctorController) 
);

doctorRouter.get('/specialities',
  doctorController.getSpecByUserId.bind(doctorController)
);

export default doctorRouter;
