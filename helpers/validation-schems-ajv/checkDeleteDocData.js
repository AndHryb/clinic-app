import { MAX_LENGTH, MIN_LENGTH, MIN_PASSWORD_LENGTH } from '../../constants.js';

export default {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      minLength: 10,
    },
  },
  required: ['id'],
  additionalProperties: false,
};
