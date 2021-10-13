import { MAX_LENGTH, MIN_LENGTH } from '../../constants.js';

export const checkNameSchema = {
  type: 'string',
  maxLength: MAX_LENGTH,
  minLength: MIN_LENGTH,
  pattern: '[a-zA-Z]+',
};

export const checkDocId = {
  type: 'string',
  minLength: 10,
}