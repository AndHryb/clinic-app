import * as cookie from 'cookie';
import { STATUSES } from '../../../constants.js';

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

  async registration(req, res) {
    const result = await this.userService.registration(req.body);

    if (result) {
      res.status(STATUSES.Created).json({
        message: 'The user has been successfully registered',
        token: result,
      });
    } else {
      res.status(STATUSES.Conflict).json({
        message: 'Email address is exist',
      });
    }
  }

  async login(req, res) {
    const result = await this.userService.login(req.body);
    if (!result.email) {
      res.status(STATUSES.Unauthorized).json({
        message: `the email ${req.body.email} was not found in the database`,
      });
    }
    if (!result.password) {
      res.status(STATUSES.Unauthorized).json({
        message: `the password for ${req.body.email}  don't match`,
      });
    }
    if (result.token) {
      res.status(STATUSES.OK).json({
        message: 'login successful',
        token: result.token,
      });
    }
  }

  async getByToken(req, res) {
    const cookies = cookie.parse(req.headers.cookie);
    const { token } = cookies;
    const result = await this.userService.getByToken(token);
    if (!result) {
      res.status(STATUSES.ServerError).json({
        message: 'Server Error.Try logging in again',
      });
    }
    res.status(STATUSES.OK).json(result);
  }

  async doctorLogin(req, res) {
    try {
      const { email, password } = req.body;
      const result = await this.userService.doctorLogin(email, password);
      res.cookie('doctorToken', `${result}`, {
        httpOnly: true,
      });
      res.status(STATUSES.OK).json(result);
    } catch (err) {
      res.status(STATUSES.Unauthorized).json(err.message);
    }
  }
}
