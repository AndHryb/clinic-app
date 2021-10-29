import { promisify } from 'util';

export default class DoctorRedisRepository {
  constructor(redisClient) {
    this.client = redisClient;
    this.specSetName = 'specSet';
    this.docSet = 'docHash';
  }

  async setTTL(key) {
    try {
      const TTL = promisify(this.client.expire).bind(this.client);
      await TTL(key, process.env.DOC_LIST_TTL);
    } catch (err) {
      console.log('set TTL doctor redis repository error');
    }
  }

  async add(docId, name, specs) {
    try {
      const addResult = promisify(this.client.sadd).bind(this.client);
      for (const spec of specs) {
        await addResult(`s${docId}`, spec);
      }
      this.setTTL(`s${docId}`);

      const doctorHash = promisify(this.client.hset).bind(this.client);
      await doctorHash(docId, 'name', name);
      await doctorHash(docId, 'specs', `s${docId}`);
      this.setTTL(docId);

      const doctorSet = promisify(this.client.sadd).bind(this.client);
      await doctorSet(this.docSet, docId);
      this.setTTL(this.docSet);

      const specSet = promisify(this.client.sadd).bind(this.client);
      await specSet(this.specSetName, `s${docId}`);
      this.setTTL(this.specSetName);


    } catch (err) {
      console.log('add doctor redis repository error');
    }
  }

  async update(options) {
    try {
      if (options.newSpecs) {
        const addResult = promisify(this.client.sadd).bind(this.client);
        for (const spec of options.newSpecs) {
          await addResult(`s${options.docId}`, spec);
        }

        const delResult = promisify(this.client.srem).bind(this.client);
        for (const spec of options.oldSpecs) {
          await delResult(`s${options.docId}`, spec);
        }
        this.setTTL(`s${options.docId}`);
      }

      const doctorHash = promisify(this.client.hset).bind(this.client);
      await doctorHash(options.docId, 'name', options.name);
      this.setTTL(options.docId);
    } catch (err) {
      console.log('doctor redis repository error');
    }
  }

  async delete(docId) {
    try {
      const delResult = promisify(this.client.del).bind(this.client);
      const result = await delResult(docId, `s${docId}`, `q${docId}`);
      const delSet = promisify(this.client.srem).bind(this.client);
      await delSet(this.docSet, docId);
      return result;
    } catch (err) {
      console.log('doctor redis repository error');
    }
  }

  async getAll() {
    try {
      const data = promisify(this.client.smembers).bind(this.client);
      const result = await data(this.docSet);
      const docData = [];
      for (const elem of result) {
        const key = promisify(this.client.hget).bind(this.client);
        const name = await key(elem, 'name');
        const speclist = promisify(this.client.smembers).bind(this.client);
        const specs = await speclist(`s${elem}`);
        if (specs.length === 0) {
          continue;
        }
        specs.forEach((spec, i) => {
          specs[i] = { name: spec };
        });
        docData.push({
          name,
          id: elem,
          specialties: specs,
        });
      }

      return docData;
    } catch (err) {
      console.log('doctor redis repository error');
    }
  }
}
