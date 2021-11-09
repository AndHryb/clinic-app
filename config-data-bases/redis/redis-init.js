import redis from 'redis';

function redisInit(port, host) {
  console.log('>>>>>>>>>>>>>>>.');
  console.log(port, host);
  const client = redis.createClient(port, host || 'localhost');
  client.on('connect', () => {
    console.log('redis storage connected!');
  });
  client.on('error', (err) => {
    console.error(err);
  });
  client.select(0);
  client.flushdb();
  return client;
}

export default redisInit;
