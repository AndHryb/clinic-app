import { MAX_LENGTH, MIN_LENGTH, MIN_PASSWORD_LENGTH } from '../../constants.js';

export default {
  type: 'object',
  properties: {
    email: {
      type: 'string', minLength: MIN_LENGTH, maxLength: MAX_LENGTH, pattern: '[@]',
    },
    password: { type: 'string', minLength: MIN_PASSWORD_LENGTH },
    name: {
      type: 'string', minLength: MIN_LENGTH, maxLength: MAX_LENGTH, pattern: '[a-zA-Z]+',
    },
    specNames: {
      type: 'array',
      uniqueItems: true,
      items: { type: 'string' },
    },
  },
  required: ['email', 'password', 'name', 'specNames'],
  additionalProperties: false,
};
