import express from 'express';
import Ajv from 'ajv';
import { injector } from '../injector.js';
import checkRegistrationFormShema from '../helpers/validation-schems-ajv/checkRegistratioForm.js';
import checkLoginFormShema from '../helpers/validation-schems-ajv/checkLoginForm.js';
import { STATUSES, USER_TYPE } from '../constants.js';
import checkJWT from '../middleware/checkJwt.js';
import checkDocRegistrationData from '../helpers/validation-schems-ajv/checkDocRegistrationData.js';

const ajv = new Ajv();

const userRouter = express.Router();
const userController = injector.getUserController();

userRouter.get('/username', checkJWT, userController.getByUserId.bind(userController));

userRouter.post('/registration', async (req, res, next) => {
  if (ajv.validate(checkRegistrationFormShema, req.body)) {
    req.body.role = USER_TYPE.PATIENT;
    next();
  } else { res.status(STATUSES.BadRequest).json('Fill out the form with the correct data'); }
}, userController.registration.bind(userController));

userRouter.post('/registration-doctor', async (req, res, next) => {
  if (ajv.validate(checkDocRegistrationData, req.body)) {
    req.body.role = USER_TYPE.DOCTOR;
    next();
  } else { res.status(STATUSES.BadRequest).json('Fill out the form with the correct data'); }
}, userController.registration.bind(userController));

userRouter.post('/login', async (req, res, next) => {
  if (ajv.validate(checkLoginFormShema, req.body)) {
    next();
  } else { res.status(STATUSES.BadRequest).json('Fill out the form with the correct data'); }
}, userController.login.bind(userController));

export default userRouter;
