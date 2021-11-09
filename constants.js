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
  PASSWORD_NOT_MATCH: 'the password don\'t match.',
  QUEUE_EMPTY: 'The queue is empty.',
  ALL_QUEUES_EMPTY: 'The all queues is empty.',
  RESOLUTIONS_NOT_FOUND: 'The resolution not found in the database.',
  RESOLUTION_DELETED: 'The resolution deleted',
  RESOLUTION_EXPIRED: 'The resolution EXPIRED',
  TOKEN_NOT_FOUND: 'log in again and reload the page',
  TOKEN_EXPIRED: 'JWT expired, log in again',
  NO_USER: 'User not found in Database',
  UNCORECT_DATA: 'Fill out the form with the correct data',
  NO_SPECS: 'Specialization(s) not found in the database',
  SPECS_NOT_CHANGED: 'The specializations have not been changed, as they coincide with the old ones',
  EMAL_NOT_CHANGED: 'The email has not been changed because it matches the old one',
  NAME_NOT_CHANGED: 'The name has not been changed, as it matches the old one',
  UPDATE_FAIL: 'fill correct update form',
};

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

export const TTL = 15000000;

export const USER_TYPE = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
};
