import ApiError from '../../../error_handling/ApiError.js';
import { MESSAGES } from '../../../constants.js';

export default class QueueService {
  constructor(patientRepository, queueRepository, doctorRepository) {
    this.patientRepository = patientRepository;
    this.queueRepository = queueRepository;
    this.doctorRepository = doctorRepository;
  }

  async get(docId) {
    try {
      const result = await this.queueRepository.get(docId);
      if (!result) {
        return ApiError.notFound(MESSAGES.QUEUE_EMPTY);
      }
      const patient = await this.patientRepository.getById(result);

      return patient.name;
    } catch (err) {
      console.log(`Queue Service get error : ${err.name} : ${err.message}`);
      return err;
    }
  }

  async add(patientId, docId) {
    try {
      const result = await this.queueRepository.add(patientId, docId);

      return result;
    } catch (err) {
      console.log(`QueueService add error : ${err.name} : ${err.message}`);
      return err;
    }
  }

  async delete() {
    try {
      return await this.queueRepository.delete();
    } catch (err) {
      console.log(`QueueService delete error : ${err.name} : ${err.message}`);
      return err;
    }
  }

  async getLength() {
    try {
      return await this.queueRepository.getLength();
    } catch (err) {
      console.log(`QueueService getLength error : ${err.name} : ${err.message}`);
      return err;
    }
  }

  async getAll() {
    try {
      const data = await this.queueRepository.getAll();
      const keys = Object.keys(data);
      const queues = [];
      for (const elem of keys) {
        const docdata = await this.doctorRepository.getById(elem);
        const patientData = await this.patientRepository.getById(data[elem].next);
        queues.push({
          doctor: docdata.name,
          length: data[elem].length,
          next: patientData.name,
        });
      }

      if (queues.length === 0) {
        return ApiError.notFound(MESSAGES.ALL_QUEUES_EMPTY);
      }

      return queues;
    } catch (err) {
      console.log(`QueueService getAll error : ${err.name} : ${err.message}`);
    }
  }
}
