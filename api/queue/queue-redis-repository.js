import { promisify } from 'util';

export default class QueueRedisRepository {
  constructor(redisClient) {
    this.client = redisClient;
    this.queueSetName = 'queueSet';
  }

  async get(docId) {
    const listLength = await this.getLength(`q${docId}`);
    if (listLength === 0) {
      return false;
    }
    const firstInQueue = promisify(this.client.lindex).bind(this.client);
    const result = JSON.parse(await firstInQueue(`q${docId}`, 0));
    return result;
  }

  async add(patientId, docId, specId) {
    const addResult = promisify(this.client.rpush).bind(this.client);
    const queueSet = promisify(this.client.sadd).bind(this.client);
    const val = JSON.stringify({ patientId, specId });
    await addResult(`q${docId}`, val);
    await queueSet(this.queueSetName, `q${docId}`);

    return patientId;
  }

  async delete(docId) {
    const popResult = promisify(this.client.lpop).bind(this.client);
    const result = JSON.parse(await popResult(`q${docId}`));
    const listLength = await this.getLength(`q${docId}`);
    if (listLength === 0) {
      const queueSet = promisify(this.client.srem).bind(this.client);
      await queueSet(this.queueSetName, `q${docId}`);
    }

    return result;
  }

  async getLength(key) {
    const listLength = promisify(this.client.llen).bind(this.client);
    const result = await listLength(key);

    return result;
  }

  async getAll() {
    const data = promisify(this.client.smembers).bind(this.client);
    const result = await data(this.queueSetName);
    const queueData = {};
    for (const elem of result) {
      const elemLength = promisify(this.client.llen).bind(this.client);
      const resultLength = await elemLength(elem);
      if (resultLength === 0) {
        continue;
      }
      const getList = promisify(this.client.lrange).bind(this.client);
      const firstInQueue = promisify(this.client.lindex).bind(this.client);
      const patientData = JSON.parse(await firstInQueue(elem, 0));
      const queue = await getList(elem, 0, -1);
      queueData[elem.substring(1)] = {
        length: resultLength,
        next: patientData.patientId,
        spec: patientData.specId,
        queue: queue.map((elem) => JSON.parse(elem)),
      };
    }

    return queueData;
  }
}
