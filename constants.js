export const MAX_LENGTH = 30;

export const MIN_LENGTH = 2;

export const MIN_PASSWORD_LENGTH = 4;

export const MESSAGES = {
  WRONG_PASS: 'Wrong password.',
  WRONG_EMAIL: 'Wrong email.',
  NO_DOC: 'No such doctor.',
  NO_PATIENT: 'So such patient.',
  NO_RIGHT_TO_DELETE: 'No right to delete.',
  EMAIL_EXIST: 'This email is already in use.',
  EMAIL_NOT_FOUND: 'The email  was not found in the database,go to registration.',
  REGISTRATION_OK: 'Successful registration.',
  LOGIN_OK: 'Login successful.',
  PASSWORD_NOT_MATCH: 'the password for this don\'t match.',
  QUEUE_EMPTY: 'The queue is empty.',
  ALL_QUEUES_EMPTY: 'The all queues is empty.',
  RESOLUTIONS_NOT_FOUND: 'The resolution not found in the database.',
  RESOLUTION_DELETED: 'The resolution deleted',
  RESOLUTION_EXPIRED: 'The resolution EXPIRED',
};

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
