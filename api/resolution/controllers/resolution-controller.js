import * as cookie from 'cookie';
import { STATUSES, NO_RIGHT_TO_DELETE_MSG } from '../../../constants.js';
import checkJwtToken from '../../../helpers/decode-token.js';

export default class ResolutionController {
  constructor(resolutionService, doctorService) {
    this.resolutionService = resolutionService;
    this.doctorService = doctorService;
  }

  async getResolutionsByName(req, res) {
    const dataList = await this.resolutionService.getResolutionsByName(req.query.name);
    res.set('Content-Type', 'application/json;charset=utf-8');
    if (!dataList) {
      res.status(STATUSES.NotFound).json({
        message: `The patient ${req.query.name} not found in the database`,
      });
    }else{
      res.status(STATUSES.OK).json({
        message: `${dataList.length} patient(s) were found`,
        resolutions: dataList,
      });
    }
    
  }

  async getResolutionByToken(req, res) {
    const cookies = cookie.parse(req.headers.cookie);
    const { token } = cookies;

    const result = await this.resolutionService.getResolutionByToken(token);
    res.set('Content-Type', 'application/json;charset=utf-8');
    if (!result) {
      res.status(STATUSES.NotFound).json({
        message: 'The resolution not found in the database.Make an appointment with a doctor.',
      });
    }else{
      res.status(STATUSES.OK).json({
        resolution: result,
      })
    }
    
  }

  async addResolution(req, res) {
    const cookies = cookie.parse(req.headers.cookie);
    const { doctorToken } = cookies;
    const { userId } = checkJwtToken(doctorToken);
    const doc = await this.doctorService.getByUserId(userId);

    const result = await this.resolutionService.addResolution(req.body.value, doc.id, req.body.spec);
    res.set('Content-Type', 'application/json;charset=utf-8');
    if (!result) {
      res.status(STATUSES.Conflict).json({
        message: 'Can\'t added resolution. There is no one in the queueRepository',
      });
    }else{
      res.status(STATUSES.Created).json(result);
    }
    
  }

  async deleteResolution(req, res) {
    const cookies = cookie.parse(req.headers.cookie);
    const { doctorToken } = cookies;

    const { userId } = checkJwtToken(doctorToken);
    const { id } = await this.doctorService.getByUserId(userId);
    const result = await this.resolutionService.delete(req.body.value, id);
    res.set('Content-Type', 'application/json;charset=utf-8');
    if (result instanceof Error) {
      if (result.message === 'not found') {
        res.status(STATUSES.NotFound).json({
          message: `The resolution ${req.body.value} not found in the database`,
        });
      } else if (result.message === NO_RIGHT_TO_DELETE_MSG) {
        res.status(STATUSES.Forbidden).json({
          message: NO_RIGHT_TO_DELETE_MSG,
        });
      }
    }else{
      res.status(STATUSES.NoContent).json({
      message: `The resolution  ${req.body.value} deleted`,
      });
    }
    
  }
}
