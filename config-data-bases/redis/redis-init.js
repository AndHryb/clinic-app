import redis from 'redis';
import { envConfig } from '../../config.js';

function redisInit() {
  const client = redis.createClient(envConfig.storage.port, envConfig.storage.host);
  client.on('connect', () => {
    console.log('redis storage connected!');
  });
  client.on('error', (error) => {
    console.error(error);
  });
  client.select(0);
  client.flushdb();
  return client;
}

export default redisInit;
