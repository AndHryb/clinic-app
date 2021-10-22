import { STATUSES, MESSAGES } from '../constants.js';
import { injector } from '../injector.js';
import path from 'path';
import jwt from 'jsonwebtoken';
import ApiError from './error_handling/ApiError.js';
//import path from 'path';

export default async function checkJWT(req, res, next) {
  try{
    let token;
    if (req.headers.authorization) {
        console.log(req.headers.authorization);
        token = req.headers.authorization.split(' ')[1];
    }else{
      //res.redirect(STATUSES.Unauthorized, '/login.html');
      throw ApiError.unauthorized(MESSAGES.TOKEN_NOT_FOUND);
    }
    const payload = jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        if(err.name === 'TokenExpiredError'){
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
      //res.redirect(STATUSES.Unauthorized, path.resolve('/login'));
    }
  }catch(err){
    console.log(err);
    next(err);
  }
}
