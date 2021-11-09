import { promisify } from 'util';
import envConfig from '../../../config.js';

export default class DoctorRedisRepository {
  constructor(redisClient) {
    this.client = redisClient;
    this.doctorHash = 'docHash';
  }

  async setTTL(key) {
    try {
      const TTL = promisify(this.client.expire).bind(this.client);
      await TTL(key, envConfig.redis.ttl);
    } catch (err) {
      console.log(`set TTL doctor redis repository error ${err}`);
    }
  }

  async add(options) {
    try {
      const hashSet = promisify(this.client.hset).bind(this.client);

      const specs = [];

      options.specs.forEach((elem, i) => {
        specs[i] = {
          name: elem,
        };
      });
      const docData = {
        id: options.docId,
        name: options.name,
        specialties: specs,
      };

      await hashSet(this.doctorHash, options.docId, JSON.stringify(docData));
      this.setTTL(this.doctorHash);

      return docData;
    } catch (err) {
      console.log(`doctor redis repository add error ${err}`);
    }
  }

  async update(options) {
    try {
      const hashGet = promisify(this.client.hget).bind(this.client);

      const oldData = JSON.parse(await hashGet(this.doctorHash, options.docId));

      if (oldData) {
        const specs = [];
        if (options.specs) {
          options.specs.forEach((elem, i) => {
            specs[i] = {
              name: elem,
            };
          });
          oldData.specialties = specs;
        }

        if (options.name) {
          oldData.name = options.name;
        }
        const hashSet = promisify(this.client.hset).bind(this.client);
        await hashSet(this.doctorHash, options.docId, JSON.stringify(oldData));
        this.setTTL(this.doctorHash);
      }

      return oldData;
    } catch (err) {
      console.log(`doctor redis repository update error ${err}`);
    }
  }

  async delete(docId) {
    try {
      const delResult = promisify(this.client.hdel).bind(this.client);
      const deleted = await delResult(this.doctorHash, docId);

      return deleted;
    } catch (err) {
      console.log(`doctor redis repository delete error ${err}`);
    }
  }

  async getAll() {
    try {
      const getKeys = promisify(this.client.hkeys).bind(this.client);
      const hGet = promisify(this.client.hget).bind(this.client);
      const keys = await getKeys(this.doctorHash);
      const docData = [];
      for (const key of keys) {
        docData.push(JSON.parse(await hGet(this.doctorHash, key)));
      }
      return docData;
    } catch (err) {
      console.log(`doctor  getAll redis repository error ${err}`);
    }
  }

  async setData(data) {
    try {
      const hashSet = promisify(this.client.hset).bind(this.client);
      console.log(data);
      for (const elem of data) {
        await hashSet(this.doctorHash, elem.id, JSON.stringify(elem));
      }
      this.setTTL(this.doctorHash);
      return data;
    } catch (err) {
      console.log(`doctor redis repository setData error ${err}`);
    }
  }
}
