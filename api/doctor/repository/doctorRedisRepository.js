import { promisify } from 'util';

export default class DoctorRedisRepository {
  constructor(redisClient) {
    this.client = redisClient;
    this.specSetName = 'specSet';
    this.docSet = 'docSet';
  }

  async setTTL(key) {
    try {
      const TTL = promisify(this.client.expire).bind(this.client);
      await TTL(key, process.env.DOC_LIST_TTL);
    } catch (err) {
      console.log(`set TTL doctor redis repository error ${err}`);
    }
  }

  async add(docId, name, specs) {
    try {
      const getHash = promisify(this.client.hgetall).bind(this.client);
      const setAdd = promisify(this.client.sadd).bind(this.client);
      for (const spec of specs) {
        await setAdd(`s${docId}`, spec);
      }
      this.setTTL(`s${docId}`);

      const hashSet = promisify(this.client.hset).bind(this.client);
      await hashSet(docId, 'name', name);
      await hashSet(docId, 'specs', `s${docId}`);
      this.setTTL(docId);

      await setAdd(this.docSet, docId);
      this.setTTL(this.docSet);

      return getHash(docId);
    } catch (err) {
      console.log(`doctor redis repository add error ${err}`);
    }
  }

  async update(options) {
    try {
      const getHash = promisify(this.client.hgetall).bind(this.client);
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

      return await getHash(options.docId);
    } catch (err) {
      console.log(`doctor redis repository update error ${err}`);
    }
  }

  async delete(docId) {
    try {
      const delResult = promisify(this.client.del).bind(this.client);
      const deleted = await delResult(docId, `s${docId}`, `q${docId}`);
      const delSet = promisify(this.client.srem).bind(this.client);
      await delSet(this.docSet, docId);
      return deleted;
    } catch (err) {
      console.log(`doctor redis repository delete error ${err}`);
    }
  }

  async getAll() {
    try {
      const memebers = promisify(this.client.smembers).bind(this.client);
      const set = await memebers(this.docSet);
      const docData = [];
      for (const elem of set) {
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
      console.log(`doctor  getAll redis repository error ${err}`);
    }
  }

  async setData(data) {
    try {
      const members = promisify(this.client.smembers).bind(this.client);
      const setAdd = promisify(this.client.sadd).bind(this.client);
      const hashSet = promisify(this.client.hset).bind(this.client);
      for (const elem of data) {
        await setAdd(this.docSet, elem.id);
        this.setTTL(this.docSet);
        for (const spec of elem.specialties) {
          await setAdd(`s${elem.id}`, spec.name);
        }
        this.setTTL(`s${elem.id}`);
        await hashSet(elem.id, 'name', elem.name);
        await hashSet(elem.id, 'specs', `s${elem.id}`);
        this.setTTL(elem.id);
      }
      return await members(this.docSet);
    } catch (err) {
      console.log(`doctor redis repository setData error ${err}`);
    }
  }
}
