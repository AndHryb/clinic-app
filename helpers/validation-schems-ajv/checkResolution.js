import { MAX_LENGTH, MIN_LENGTH } from '../../constants.js';

export default {
  type: 'object',
  properties: {
    value: {
      type: 'string', minLength: MIN_LENGTH, maxLength: MAX_LENGTH,
    },
    patientId: {
      type: 'string',
      minLength: 10,
    },
    specId: {
      type: 'string',
      minLength: 10,
    },
  },
  required: ['value', 'patientId', 'specId'],
  additionalProperties: false,
};
