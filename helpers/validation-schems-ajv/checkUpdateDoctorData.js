import { MAX_LENGTH, MIN_LENGTH, MIN_PASSWORD_LENGTH } from '../../constants.js';

export default {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      minLength: 10,
    },
    email: {
      type: 'string', minLength: MIN_LENGTH, maxLength: MAX_LENGTH, pattern: '[@]',
    },
    oldPassword: { type: 'string', minLength: MIN_PASSWORD_LENGTH },
    newPassword: { type: 'string', minLength: MIN_PASSWORD_LENGTH },
    name: {
      type: 'string', minLength: MIN_LENGTH, maxLength: MAX_LENGTH, pattern: '[a-zA-Z]+',
    },
    specNames: {
      type: 'array',
      uniqueItems: true,
      items: { type: 'string' },
    },
  },
  required: ['id'],
  additionalProperties: false,
};
