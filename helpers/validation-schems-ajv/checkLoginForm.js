import {MAX_LENGTH, MIN_LENGTH, MIN_PASSWORD_LENGTH } from '../../constants.js';

export const checkLoginFormShema = {
  type: 'object',
  properties: {
    email: { type: 'string', minLength:MIN_LENGTH, maxLength:MAX_LENGTH, pattern: '[@]'},
    password: { type: 'string', minLength:MIN_PASSWORD_LENGTH },
  },
  required: ['email', 'password'],
  additionalProperties: false,
};
