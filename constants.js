export const MAX_LENGTH = 30;

export const MIN_LENGTH = 2;

export const MIN_PASSWORD_LENGTH = 4;

export const WRONG_PASS_MSG = 'wrong password';

export const WRONG_EMAIL_MSG = 'wrong email';

export const NO_DOC_MSG = 'no such doctor';

export const NO_PATIENT_MSG = 'no such patient';

export const NO_RIGHT_TO_DELETE_MSG = 'no right to delete';

export const STATUSES = {
  OK: 200,
  Created: 201,
  NoContent: 204,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  RequestTimeout: 408,
  Conflict: 409,
  PreconditionFailed: 412,
  ServerError: 500,
  Unavailable: 503,
};

const TTL = 15000000;
export { TTL };

export const USER_TYPE = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
};
