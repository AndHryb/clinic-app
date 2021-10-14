import * as cookie from 'cookie';
import { STATUSES, MESSAGES } from '../../../constants.js';
import ApiError from '../../../error_handling/ApiError.js';
import checkJwtToken from '../../../helpers/decode-token.js';

export default class ResolutionController {
  constructor(resolutionService, doctorService) {
    this.resolutionService = resolutionService;
    this.doctorService = doctorService;
  }

  async getResolutionsByName(req, res, next) {
    try {
      const dataList = await this.resolutionService.getResolutionsByName(req.query.name);
      res.set('Content-Type', 'application/json;charset=utf-8');
      if (dataList instanceof ApiError) {
        next(dataList);
      } else {
        res.status(STATUSES.OK).json({
          resolutions: dataList,
        });
      }
    } catch (err) {
      next(err);
    }
  }

  async getResolutionByToken(req, res, next) {
    try {
      const cookies = cookie.parse(req.headers.cookie);
      const { token } = cookies;

      const result = await this.resolutionService.getResolutionByToken(token);
      res.set('Content-Type', 'application/json;charset=utf-8');
      if (result instanceof ApiError) {
        next(result);
      } else {
        res.status(STATUSES.OK).json({
          resolution: result,
        });
      }
    } catch (err) {
      next(err);
    }
  }

  async addResolution(req, res, next) {
    try {
      const cookies = cookie.parse(req.headers.cookie);
      const { doctorToken } = cookies;
      const { userId } = checkJwtToken(doctorToken);
      const doc = await this.doctorService.getByUserId(userId);
      if (doc instanceof ApiError) {
        next(doc);
      }
      const result = await this.resolutionService.addResolution(
        req.body.value, doc.id, req.body.spec,
      );
      if (result instanceof ApiError) {
        next(result);
      } else {
        res.set('Content-Type', 'application/json;charset=utf-8');
        res.status(STATUSES.Created).json(result);
      }
    } catch (err) {
      next(err);
    }
  }

  async deleteResolution(req, res, next) {
    try {
      const cookies = cookie.parse(req.headers.cookie);
      const { doctorToken } = cookies;
      const { userId } = checkJwtToken(doctorToken);
      const { id } = await this.doctorService.getByUserId(userId);
      const result = await this.resolutionService.delete(req.body.value, id);
      if (result instanceof ApiError) {
        next(result);
      } else {
        res.set('Content-Type', 'application/json;charset=utf-8');
        res.status(STATUSES.NoContent).json({
          message: MESSAGES.RESOLUTION_DELETED,
        });
      }
    } catch (err) {
      next(err);
    }
  }
}
