import * as cookie from 'cookie';
import {injector} from '../injector.js';

const userController = injector.getUserController();

export default async function checkDoctorTocken(req, res, next) {
  let checkToken = { value: false };
  if (req.headers.cookie) {
    const cookies = cookie.parse(req.headers.cookie);
    const { doctorToken } = cookies;
    checkToken = await userController.getByToken(doctorToken);
  }
  if (checkToken.value) {
    next();
  } else {
    res.redirect('/auth/doctor-login');
  }
}


