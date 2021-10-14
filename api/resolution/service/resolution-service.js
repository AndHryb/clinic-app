import decodeToken from '../../../helpers/decode-token.js';
import { MESSAGES } from '../../../constants.js';
import ApiError from '../../../error_handling/ApiError.js';

export default class ResolutionService {
  constructor(queueRepository, resolutionRepository, patientRepository, TTL) {
    this.queueRepository = queueRepository;
    this.resolutionRepository = resolutionRepository;
    this.patientRepository = patientRepository;
    this.TTL = TTL;
  }

  async getResolutionsByName(name) {
    try {
      const resolutionList = await this.resolutionRepository.getByName(name);
      if (!resolutionList || resolutionList.getLength === 0) {
        return ApiError.notFound(MESSAGES.NO_PATIENT);
      }

      const resolutionListTTL = resolutionList.filter(
        (elem) => this.TTL > (new Date()).getTime() - (new Date(elem.createdAt)).getTime(),
      );
      return resolutionListTTL;
    } catch (err) {
      console.log(`Resolution service add error :${err.name} : ${err.message}`);
      return err;
    }
  }

  async getResolutionByToken(token) {
    try {
      const decoded = decodeToken(token);
      const patient = await this.patientRepository.getByUserId(decoded.userId);
      const result = await this.resolutionRepository.getByPatientId(patient.id);
      if (!result) {
        return ApiError.notFound(MESSAGES.RESOLUTIONS_NOT_FOUND);
      }
      return result;
    } catch (err) {
      console.log(`Resolution service getByID error :${err.name} : ${err.message}`);
      return err;
    }
  }

  async addResolution(resolution, docId, spec) {
    try {
      const queueLength = await this.queueRepository.getLength(docId);
      if (queueLength === 0) {
        return ApiError.conflict(MESSAGES.QUEUE_EMPTY);
      }
      const patientId = await this.queueRepository.delete(docId);

      if (!patientId) {
        return ApiError.notFound(MESSAGES.NO_PATIENT);
      }
      await this.resolutionRepository.add({
        patientId, resolution, docId, spec,
      });

      return patientId;
    } catch (err) {
      console.log(`Resolution service getByID error :${err.name} : ${err.message}`);
      return err;
    }
  }

  async getById(resolutionId) {
    try {
      return await this.resolutionRepository.getById(resolutionId);
    } catch (err) {
      console.log(`Resolution service getByID error :${err.name} : ${err.message}`);
    }
  }

  async getByPatientId(patieniId) {
    try {
      return await this.resolutionRepository.getByPatientId(patieniId);
    } catch (err) {
      console.log(`Resolution service getByPatientId error :${err.name} : ${err.message}`);
    }
  }

  async delete(resolutionId, docId) {
    try {
      const isTheRightDoc = await this.isTheRightDoctor(resolutionId, docId);
      if (!isTheRightDoc) {
        return ApiError.forbidden(MESSAGES.NO_RIGHT_TO_DELETE);
      }
      if (isTheRightDoc instanceof ApiError) return isTheRightDoc;
      const result = await this.resolutionRepository.delete(resolutionId);

      return result;
    } catch (err) {
      console.log(`Resolution service delete error :${err.name} : ${err.message}`);
      return err;
    }
  }

  async isTheRightDoctor(resolutionId, docId) {
    try {
      const resolution = await this.getById(resolutionId);
      if (!resolution) {
        return ApiError.notFound(MESSAGES.RESOLUTIONS_NOT_FOUND);
      }

      const { doctorId } = resolution;
      return doctorId === docId;
    } catch (err) {
      console.log(`Resolution service isTheRightDoctor error :${err.name} : ${err.message}`);
      return err;
    }
  }
}
