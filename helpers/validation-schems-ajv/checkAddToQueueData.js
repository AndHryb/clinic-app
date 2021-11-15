export default {
  type: 'object',
  properties: {
    docId: {
      type: 'string',
      minLength: 10,
    },
    specId: {
      type: 'string',
      minLength: 10,
    },
  },
  required: ['docId','specId'],
  additionalProperties: false,
};
