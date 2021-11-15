import { MESSAGES } from '../../constants.js';
import ApiError from '../../middleware/error-handling/ApiError.js';

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
      const resolutionListTTL = this.filterTTL(resolutionList);

      return resolutionListTTL;
    } catch (err) {
      console.log(`Resolution service add error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async getResolutionByUserId(userId) {
    try {
      const result = await this.resolutionRepository.getByPatientId(userId);
      const filtredList = this.filterTTL(result);

      return filtredList;
    } catch (err) {
      console.log(`Resolution service getResolutionByUserId error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async addResolution(options) {
    try {
      const {
        resolution, docId, specId, patientId,
      } = options;
      const queueLength = await this.queueRepository.getLength(`q${docId}`);
      if (queueLength === 0) throw ApiError.conflict(MESSAGES.QUEUE_EMPTY);
      const delPatient = await this.queueRepository.delete(docId);
      if (!delPatient || delPatient.patientId !== patientId) {
        throw ApiError.notFound(MESSAGES.NO_PATIENT);
      }
      const res = await this.resolutionRepository.add({
        patientId, resolution, docId, specId,
      });

      return res;
    } catch (err) {
      console.log(`Resolution service addResolution error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async delete(resolutionId, docId) {
    try {
      const isTheRightDoc = await this.isTheRightDoctor(resolutionId, docId);
      if (!isTheRightDoc) throw ApiError.forbidden(MESSAGES.NO_RIGHT_TO_DELETE);
      const result = await this.resolutionRepository.delete(resolutionId);
      if (!result) throw ApiError.notFound(MESSAGES.RESOLUTIONS_NOT_FOUND);

      return result;
    } catch (err) {
      console.log(`Resolution service delete error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async isTheRightDoctor(resolutionId, docId) {
    try {
      const resolution = await this.resolutionRepository.getById(resolutionId);
      if (!resolution) throw ApiError.notFound(MESSAGES.RESOLUTIONS_NOT_FOUND);
      const { doctorId } = resolution;
      return doctorId === docId;
    } catch (err) {
      console.log(`Resolution service isTheRightDoctor error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async filterTTL(resolutionList) {
    if (!resolutionList || resolutionList.length === 0) {
      throw ApiError.notFound(MESSAGES.RESOLUTIONS_NOT_FOUND);
    }
    const filtredList = resolutionList.filter((elem) => {
      const timeOfExistence = (new Date()).getTime() - (new Date(elem.createdAt)).getTime();
      return this.TTL > timeOfExistence;
    });
    if (!filtredList || filtredList.length === 0) {
      throw ApiError.notFound(MESSAGES.RESOLUTION_EXPIRED);
    }

    return filtredList;
  }
}