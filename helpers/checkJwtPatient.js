import * as cookie from 'cookie';
import { injector } from '../injector.js';

const userController = injector.getUserController();

export default async function checkPatientToken(req, res, next) {
  let checkToken = { value: false };
  if (req.headers.cookie) {
    const cookies = cookie.parse(req.headers.cookie);
    const { token } = cookies;
    checkToken = await userController.getByToken(token);
  }
  if (checkToken.value) {
    next();
  } else {
    res.redirect('/auth/patient-login');
  }
}
