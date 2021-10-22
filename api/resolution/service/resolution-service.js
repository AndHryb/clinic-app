import { MESSAGES } from '../../../constants.js';
import ApiError from '../../../middleware/error_handling/ApiError.js';

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
      const patient = await this.patientRepository.getByUserId(userId);
      const result = await this.resolutionRepository.getByPatientId(patient.id);
      const filtredList = this.filterTTL(result);
     
      return filtredList;
    } catch (err) {
      console.log(`Resolution service getResolutionByToken error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async addResolution(resolution, docId, spec) {
    try {
      const queueLength = await this.queueRepository.getLength(docId);
      if (queueLength === 0) {
        throw ApiError.conflict(MESSAGES.QUEUE_EMPTY);
      }
      const patientId = await this.queueRepository.delete(docId);

      if (!patientId) {
        throw ApiError.notFound(MESSAGES.NO_PATIENT);
      }
      await this.resolutionRepository.add({
        patientId, resolution, docId, spec,
      });

      return patientId;
    } catch (err) {
      console.log(`Resolution service getByID error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async delete(resolutionId, docId) {
    try {
      const isTheRightDoc = await this.isTheRightDoctor(resolutionId, docId);
      if (!isTheRightDoc) {
        throw ApiError.forbidden(MESSAGES.NO_RIGHT_TO_DELETE);
      }
      const result = await this.resolutionRepository.delete(resolutionId);
      if (!result) {
        throw ApiError.notFound(MESSAGES.RESOLUTIONS_NOT_FOUND);
      }
      return result;
    } catch (err) {
      console.log(`Resolution service delete error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async isTheRightDoctor(resolutionId, docId) {
    try {
      const resolution = await this.resolutionRepository.getById(resolutionId);
      if (!resolution) {
        throw ApiError.notFound(MESSAGES.RESOLUTIONS_NOT_FOUND);
      }
      const { doctorId } = resolution;
      return doctorId === docId;
    } catch (err) {
      console.log(`Resolution service isTheRightDoctor error :${err.name} : ${err.message}`);
      throw err;
    }
  }

  async filterTTL(resolutionList){
    if (!resolutionList || resolutionList.length === 0) {
      throw ApiError.notFound(MESSAGES.RESOLUTIONS_NOT_FOUND);
    }
    const filtredList = resolutionList.filter(
      (elem) => this.TTL > (new Date()).getTime() - (new Date(elem.createdAt)).getTime(),
    );
    if (!filtredList || filtredList.length === 0) {
      throw ApiError.notFound(MESSAGES.RESOLUTION_EXPIRED);
    }

    return filtredList;
  }
}
