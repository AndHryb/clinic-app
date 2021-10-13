import {MAX_LENGTH, MIN_LENGTH, MIN_PASSWORD_LENGTH } from '../../constants.js';

export const checkRegistrationFormShema = {
  type: 'object',
  properties: {
    email: { type: 'string', minLength:MIN_LENGTH, maxLength:MAX_LENGTH, pattern: '[@]'},
    password: { type: 'string', minLength:MIN_PASSWORD_LENGTH },
    name: { type: 'string', minLength:MIN_LENGTH, maxLength:MAX_LENGTH, pattern: '[a-zA-Z]+' },
    birthday: { type: 'integer' },
    gender: { type: 'string' },
  },
  required: ['email', 'password', 'name', 'birthday', 'gender'],
  additionalProperties: false,
};
