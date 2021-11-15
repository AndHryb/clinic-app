import ApiError from '../../middleware/error-handling/ApiError.js';
import { MESSAGES } from '../../constants.js';

export default class QueueService {
  constructor(patientRepository, queueRepository, doctorRepository) {
    this.patientRepository = patientRepository;
    this.queueRepository = queueRepository;
    this.doctorRepository = doctorRepository;
  }

  async get(docId) {
    try {
      const result = await this.queueRepository.get(docId);
      if (!result) throw ApiError.notFound(MESSAGES.QUEUE_EMPTY);
      const patient = await this.patientRepository.getById(result.patientId);

      return {
        name: patient.name,
        id: patient.id,
        specId: result.specId,
      };
    } catch (err) {
      console.log(`Queue Service get error : ${err.name} : ${err.message}`);
      throw err;
    }
  }

  async add(patientId, docId, specId) {
    try {
      const result = await this.queueRepository.add(patientId, docId, specId);

      return result;
    } catch (err) {
      console.log(`QueueService add error : ${err.name} : ${err.message}`);
      throw err;
    }
  }

  async delete() {
    try {
      return await this.queueRepository.delete();
    } catch (err) {
      console.log(`QueueService delete error : ${err.name} : ${err.message}`);
      throw err;
    }
  }

  async getLength() {
    try {
      return await this.queueRepository.getLength();
    } catch (err) {
      console.log(`QueueService getLength error : ${err.name} : ${err.message}`);
      throw err;
    }
  }

  async getAll(userId) {
    try {
      const data = await this.queueRepository.getAll();
      const keys = Object.keys(data);
      const queues = [];
      for (const elem of keys) {
        const docdata = await this.doctorRepository.getById(elem);
        const nextPatient = await this.patientRepository.getById(data[elem].next);
        const res = {
          doctor: docdata.name,
          length: data[elem].length,
          next: nextPatient.name,
        };
        const { id } = await this.patientRepository.getByUserId(userId);
        const item = data[elem].queue.find((patient) => patient.patientId === id);
        if (item) {
          res.position = (data[elem].queue.indexOf(item, 0)) + 1;
        }
        queues.push(res);
        console.log(res);
      }

      if (queues.length === 0) throw ApiError.notFound(MESSAGES.ALL_QUEUES_EMPTY);

      return queues;
    } catch (err) {
      console.log(`QueueService getAll error : ${err.name} : ${err.message}`);
      throw err;
    }
  }
}
