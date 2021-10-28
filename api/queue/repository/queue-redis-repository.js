import { promisify } from 'util';

export default class QueueRedisRepository {
  constructor(redisClient) {
    this.client = redisClient;
    this.quesKeys = 'queuesHash';
  }

  async get(docId) {
    const listLength = await this.getLength(docId);
    if (listLength === 0) {
      return false;
    }
    const firstInQueue = promisify(this.client.lindex).bind(this.client);
    const result = await firstInQueue(docId, 0);
    return result;
  }

  async add(patientId, docId) {
    const addResult = promisify(this.client.rpush).bind(this.client);
    const docHash = promisify(this.client.hset).bind(this.client);
    await addResult(docId, patientId);
    await docHash(this.quesKeys, docId);

    return patientId;
  }

  async delete(docId) {
    const listLength = await this.getLength(docId);
    if (listLength === 0) {
      return false;
    }
    const popResult = promisify(this.client.lpop).bind(this.client);
    const result = await popResult(docId);

    return result;
  }

  async getLength(docId) {
    const listLength = promisify(this.client.llen).bind(this.client);
    const result = await listLength(docId);

    return result;
  }

  async getAll() {
    // const data = promisify(this.client.hkeys).bind(this.client);
    // const result = await data(this.quesKeys);
    // console.log('>>>>>>>>>>>>>>>>>>>');
    // console.log(result);
    const data = promisify(this.client.scan).bind(this.client);
    const result = await data(0);
    const queueData = {};
    for (const elem of result[1]) {
      const elemLength = promisify(this.client.llen).bind(this.client);
      const resultLength = await elemLength(elem);

      const firstInQueue = promisify(this.client.lindex).bind(this.client);
      const resulPatient = await firstInQueue(elem, 0);
      queueData[elem] = { length: resultLength, next: resulPatient };
    }

    return queueData;
  }
}
