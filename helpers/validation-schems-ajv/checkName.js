import { MAX_LENGTH, MIN_LENGTH } from '../../constants.js';

export default {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      maxLength: MAX_LENGTH,
      minLength: MIN_LENGTH,
      pattern: '[a-zA-Z]+',
    },
  },
  required: ['name'],
  additionalProperties: false,
};
