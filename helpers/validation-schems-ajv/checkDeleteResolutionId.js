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
