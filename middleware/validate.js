import Ajv from 'ajv';
import ApiError from './error-handling/ApiError.js';
import { MESSAGES } from '../constants.js';

const ajv = new Ajv();

export default (schema, property) => (req, res, next) => {
  if (ajv.validate(schema, req[property])) {
    next();
  } else {
    throw ApiError.badRequest(MESSAGES.UNCORECT_DATA);
  }
};
