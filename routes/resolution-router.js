import express from 'express';
import Ajv from 'ajv';

import { checkResolutionSchema } from '../helpers/validation-schems-ajv/checkResolution.js';
import { checkNameSchema } from '../helpers/validation-schems-ajv/checkName.js';
import { injector } from '../injector.js';
import { STATUSES } from '../constants.js';

const resolutionRouter = express.Router();
const resolutionController = injector.getResolutionController();
const ajv = new Ajv();

resolutionRouter.post('/',
  async (req, res, next) => {
    if (ajv.validate(checkResolutionSchema, req.body.value)) {
      next();
    } else {
      res.status(STATUSES.BadRequest).json('The field must not be empty');
    }
  }, resolutionController.addResolution.bind(resolutionController));

  resolutionRouter.get('/me',
  resolutionController.getResolutionByToken.bind(resolutionController));

  resolutionRouter.delete('/',
  async (req, res, next) => {
    if (req.body.value) {
      next();
    } else {
      res.status(STATUSES.BadRequest).json('Incorrect patient name');
    }
  },
  resolutionController.deleteResolution.bind(resolutionController));

  resolutionRouter.get('/',
  async (req, res, next) => {
    if (ajv.validate(checkNameSchema, req.query.name)) {
      next();
    } else {
      res.status(STATUSES.BadRequest).json('Incorrect patient name');
    }
  },
  resolutionController.getResolutionsByName.bind(resolutionController));

  export default resolutionRouter;