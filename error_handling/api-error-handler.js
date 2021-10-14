import ApiError from './ApiError.js';
import { STATUSES } from '../constants.js';

export default function apiErrorHandler(err, req, res, next) {
  console.log(err);
  if (err instanceof ApiError) {
    res.status(err.statusCode).json(err.message);
    return;
  }

  res.status(STATUSES.ServerError).json(err.message);
}
