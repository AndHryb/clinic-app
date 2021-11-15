import { STATUSES, MESSAGES } from '../../constants.js';

export default class ResolutionController {
  constructor(resolutionService, doctorService) {
    this.resolutionService = resolutionService;
    this.doctorService = doctorService;
  }

  async getResolutionsByName(req, res, next) {
    try {
      const dataList = await this.resolutionService.getResolutionsByName(req.query.name);
      res.set('Content-Type', 'application/json;charset=utf-8');
      res.status(STATUSES.OK).json({
        resolutions: dataList,
      });
    } catch (err) {
      next(err);
    }
  }

  async getResolutionByToken(req, res, next) {
    try {
      const { userId } = req.payload;
      const result = await this.resolutionService.getResolutionByUserId(userId);
      res.set('Content-Type', 'application/json;charset=utf-8');
      res.status(STATUSES.OK).json({
        resolution: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async addResolution(req, res, next) {
    try {
      const { userId } = req.payload;
      const doc = await this.doctorService.getByUserId(userId);
      const options = {
        resolution: req.body.value,
        docId: doc.id,
        specId: req.body.specId,
        patientId: req.body.patientId,
      };
      const result = await this.resolutionService.addResolution(options);
      res.set('Content-Type', 'application/json;charset=utf-8');
      res.status(STATUSES.Created).json(result);
    } catch (err) {
      next(err);
    }
  }

  async deleteResolution(req, res, next) {
    try {
      const { userId } = req.payload;
      const { id } = await this.doctorService.getByUserId(userId);
      const result = await this.resolutionService.delete(req.query.id, id);
      res.set('Content-Type', 'application/json;charset=utf-8');
      res.status(STATUSES.NoContent).json({
        message: MESSAGES.RESOLUTION_DELETED,
        resolution: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
