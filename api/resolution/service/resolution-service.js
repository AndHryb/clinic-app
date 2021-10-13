import decodeToken from '../../../helpers/decode-token.js';
import { NO_RIGHT_TO_DELETE_MSG } from '../../../constants.js';

export default class ResolutionService {
  constructor(queueRepository, resolutionRepository, patientRepository, TTL) {
    this.queueRepository = queueRepository;
    this.resolutionRepository = resolutionRepository;
    this.patientRepository = patientRepository;
    this.TTL = TTL;
  }

  async getResolutionsByName(name) {
    const res = false;
    try {
      const resolutionList = await this.resolutionRepository.getByName(name);
      if (!resolutionList) {
        return res;
      }

      const resolutionListTTL = resolutionList.filter((elem) => this.TTL > (new Date()).getTime() - (new Date(elem.createdAt)).getTime());
      return resolutionListTTL;
    } catch (err) {
      console.log(`Resolution service add error :${err.name} : ${err.message}`);
    }
  }

  async getResolutionByToken(token) {
    try {
      const decoded = decodeToken(token);
      const patient = await this.patientRepository.getByUserId(decoded.userId);
      const result = await this.resolutionRepository.getByPatientId(patient.id);
      return result;
    } catch (err) {
      console.log(`Resolution service getByID error :${err.name} : ${err.message}`);
    }
  }

  async addResolution(resolution, docId, spec) {
    try {
      const queueLength = await this.queueRepository.getLength(docId);
      if (queueLength === 0) {
        return false;
      }
      const patientId = await this.queueRepository.delete(docId);

      if (!patientId) {
        return false;
      }
      await this.resolutionRepository.add({
        patientId, resolution, docId, spec,
      });

      return patientId;
    } catch (err) {
      console.log(`Resolution service getByID error :${err.name} : ${err.message}`);
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
      if (!isTheRightDoc) throw new Error(NO_RIGHT_TO_DELETE_MSG);
      const result = await this.resolutionRepository.delete(resolutionId);

      return result;
    } catch (err) {
      console.log(`Resolution service delete error :${err.name} : ${err.message}`);
      return err;
    }
  }

  async isTheRightDoctor(resolutionId, docId) {
    const resolution = await this.getById(resolutionId);
    if (!resolution) throw new Error('not found');

    const { doctorId } = resolution;
    return doctorId === docId;
  }
}
