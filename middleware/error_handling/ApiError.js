import { STATUSES } from "../../constants.js";

export default class ApiError {
  constructor(statusCode, message) {
    this.statusCode = statusCode;
    this.message = message;
  }

  static badRequest(msg) {
    return new ApiError(STATUSES.BadRequest, msg);
  }

  static unauthorized(msg) {
    return new ApiError(STATUSES.Unauthorized, msg);
  }

  static forbidden(msg) {
    return new ApiError(STATUSES.Forbidden, msg);
  }

  static notFound(msg) {
    return new ApiError(STATUSES.NotFound, msg);
  }

  static conflict(msg) {
    return new ApiError(STATUSES.Conflict, msg);
  }
}
