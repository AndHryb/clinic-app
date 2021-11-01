import jwt from 'jsonwebtoken';
import { MESSAGES } from '../constants.js';
import { injector } from '../injector.js';
import ApiError from './error-handling/ApiError.js';

export default async function checkJWT(req, res, next) {
  try {
    let token;
    if (req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
    } else {
      throw ApiError.unauthorized(MESSAGES.TOKEN_NOT_FOUND);
    }
    const payload = jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          throw ApiError.unauthorized(MESSAGES.TOKEN_EXPIRED);
        }
        throw err;
      } else {
        return decoded;
      }
    });
    const user = await injector.userService.getByUserId(payload);

    if (user) {
      req.payload = payload;
      next();
    } else {
      throw ApiError.notFound(MESSAGES.NO_USER);
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
}
