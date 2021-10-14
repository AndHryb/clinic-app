import * as cookie from 'cookie';
import { STATUSES, MESSAGES } from '../../../constants.js';
import ApiError from '../../../error_handling/ApiError.js';

export default class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async checkDoctorToken(req, res, next) {
    let checkToken;
    if (req.headers.cookie) {
      const cookies = cookie.parse(req.headers.cookie);
      const { doctorToken } = cookies;
      checkToken = await this.userService.getByToken(doctorToken);
    }
    if (checkToken) {
      next();
    } else {
      res.redirect('/auth/doctor-login');
    }
  }

  async checkPatientToken(req, res, next) {
    let checkToken;
    if (req.headers.cookie) {
      const cookies = cookie.parse(req.headers.cookie);
      const { token } = cookies;
      checkToken = await this.userService.getByToken(token);
    }
    if (checkToken) {
      next();
    } else {
      res.redirect('/auth/patient-login');
    }
  }

  async registration(req, res, next) {
    try {
      const result = await this.userService.registration(req.body);
      if (result instanceof ApiError) {
        next(result);
      } else {
        res.status(STATUSES.Created).json({
          message: MESSAGES.REGISTRATION_OK,
          token: result,
        });
      }
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const result = await this.userService.login(req.body);

      if (result instanceof ApiError) {
        next(result);
      } else {
        res.status(STATUSES.OK).json({
          message: MESSAGES.LOGIN_OK,
          token: result,
        });
      }
    } catch (err) {
      next(err);
    }
  }

  async getByToken(req, res, next) {
    try {
      const cookies = cookie.parse(req.headers.cookie);
      const { token } = cookies;
      const result = await this.userService.getByToken(token);
      res.status(STATUSES.OK).json(result);
    } catch (err) {
      next(err);
    }
  }

  async doctorLogin(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await this.userService.doctorLogin(email, password);
      if (result instanceof ApiError) {
        next(result);
      } else {
        res.cookie('doctorToken', `${result}`, {
          httpOnly: true,
        });
        res.status(STATUSES.OK).json(result);
      }
    } catch (err) {
      next(err);
    }
  }
}
