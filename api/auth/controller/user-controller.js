import * as cookie from 'cookie';
import { STATUSES, MESSAGES } from '../../../constants.js';
import ApiError from '../../../middleware/error_handling/ApiError.js';
import extractJWT from '../../../helpers/extract-jwt.js';

export default class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async registration(req, res, next) {
    try {
      const result = await this.userService.registration(req.body);
        res.status(STATUSES.Created).json({
          message: MESSAGES.REGISTRATION_OK,
          token: result,
        });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const result = await this.userService.login(req.body);
        res.status(STATUSES.OK).json({
          message: MESSAGES.LOGIN_OK,
          token: result.token,
          role: result.role,
        });
    } catch (err) {
      next(err);
    }
  }

  async getByUserId(req, res, next) {
    try {
      const result = await this.userService.getByUserId(req.payload);
      res.status(STATUSES.OK).json(result);
    } catch (err) {
      next(err);
    }
  }
  
}
