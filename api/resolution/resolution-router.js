import express from 'express';

import checkResolutionSchema from '../../helpers/validation-schems-ajv/checkResolution.js';
import checkNameSchema from '../../helpers/validation-schems-ajv/checkName.js';
import delResolutionShema from '../../helpers/validation-schems-ajv/checkDeleteResolutionId.js';
import injector from '../../injector.js';
import validator from '../../middleware/validate.js';

const resolutionRouter = express.Router();
const resolutionController = injector.getResolutionController();

resolutionRouter.post('/',
  validator(checkResolutionSchema, 'body'),
  resolutionController.addResolution.bind(resolutionController));

resolutionRouter.get('/me',
  resolutionController.getResolutionByToken.bind(resolutionController));

resolutionRouter.delete('/',
  validator(delResolutionShema, 'query'),
  resolutionController.deleteResolution.bind(resolutionController));

resolutionRouter.get('/',
  validator(checkNameSchema, 'query'),
  resolutionController.getResolutionsByName.bind(resolutionController));

export default resolutionRouter;
