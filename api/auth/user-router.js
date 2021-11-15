import express from 'express';
import injector from '../../injector.js';
import checkRegistrationFormShema from '../../helpers/validation-schems-ajv/checkRegistratioForm.js';
import checkLoginFormShema from '../../helpers/validation-schems-ajv/checkLoginForm.js';
import { USER_TYPE } from '../../constants.js';
import checkJWT from '../../middleware/checkJwt.js';
import checkDocRegistrationData from '../../helpers/validation-schems-ajv/checkDocRegistrationData.js';
import validator from '../../middleware/validate.js';

const userRouter = express.Router();
const userController = injector.getUserController();

userRouter.get('/username', checkJWT, userController.getByUserId.bind(userController));

userRouter.post('/registration',
  validator(checkRegistrationFormShema, 'body'),
  (req, res, next) => { req.body.role = USER_TYPE.PATIENT; },
  userController.registration.bind(userController));

userRouter.post('/registration-doctor',
  validator(checkDocRegistrationData, 'body'),
  (req, res, next) => { req.body.role = USER_TYPE.DOCTOR; },
  userController.registration.bind(userController));

userRouter.post('/login',
  validator(checkLoginFormShema, 'body'),
  userController.login.bind(userController));

export default userRouter;
