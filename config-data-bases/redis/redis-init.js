import redis from 'redis';
import { envConfig } from '../../config.js';

function redisInit() {
  const client = redis.createClient(envConfig.redis.port, envConfig.redis.host);
  client.on('connect', () => {
    console.log('redis storage connected!');
  });
  client.on('error', (err) => {
    console.error(err);
    throw err;
  });
  client.select(0);
  client.flushdb();
  return client;
}

export default redisInit;
