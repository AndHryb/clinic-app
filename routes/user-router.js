import express from 'express';
import path from 'path';
import Ajv from 'ajv';
import * as cookie from 'cookie';
import { __dirname } from '../main.js';
import { injector } from '../injector.js';
import { checkRegistrationFormShema } from '../helpers/validation-schems-ajv/checkRegistratioForm.js';
import { checkLoginFormShema } from '../helpers/validation-schems-ajv/checkLoginForm.js';
import { STATUSES } from '../constants.js';

const ajv = new Ajv();

const userRouter = express.Router();
const userController = injector.getUserController();

userRouter.get('/registration', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'static', 'registration.html'));
});

userRouter.get('/patient-login', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'static', 'login.html'));
});

userRouter.get('/doctor-login', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'static', 'doctor-login.html'));
});

userRouter.post('/login/doctor', async (req, res, next) => {
  if (ajv.validate(checkLoginFormShema, req.body)) {
    next();
  } else { res.status(STATUSES.BadRequest).json('Fill out the form with the correct data'); }
 }, userController.doctorLogin.bind(userController));

userRouter.get('/username',userController.getByToken.bind(userController)) 

userRouter.post('/registration', async (req, res, next) => {
  if (ajv.validate(checkRegistrationFormShema, req.body)) {
    next();
  } else { res.status(STATUSES.BadRequest).json('Fill out the form with the correct data'); }
},userController.registration.bind(userController));


userRouter.post('/login', async (req, res, next) => {
  if (ajv.validate(checkLoginFormShema, req.body)) {
    next();
  } else { res.status(STATUSES.BadRequest).json('Fill out the form with the correct data'); }
}, userController.login.bind(userController));

export default userRouter;
