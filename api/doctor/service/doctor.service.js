import { NO_DOC_MSG } from '../../../constants.js';

export default class DoctorService {
  constructor(repository) {
    this.repository = repository;
  }

  async getDoctors() {
    const res = await this.repository.getDoctors();
    if (!res) throw new Error(NO_DOC_MSG);

    return res;
  }

  async getByUserId(userId) {
    const res = await this.repository.getByUserId(userId);
    if (!res) throw new Error(NO_DOC_MSG);

    return res;
  }

  async getSpecByUserId(userId) {
    const res = await this.repository.getSpecByUserId(userId);
    if (!res) throw new Error(NO_DOC_MSG);

    return res;
  }

  async getSpec(docId) {
    const res = await this.repository.getSpec(docId);
    if (!res) throw new Error(NO_DOC_MSG);

    return res;
  }

  async getById(id) {
    const res = await this.repository.getById(id);
    if (!res) throw new Error(NO_DOC_MSG);

    return res;
  }
}
