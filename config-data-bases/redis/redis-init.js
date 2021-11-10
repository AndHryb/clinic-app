import redis from 'redis';

function redisInit(port, host) {
  const client = redis.createClient(port, host);
  client.on('connect', () => {
    console.log('redis storage connected!');
  });
  client.on('error', (err) => {
    console.error(
      `conection on host: ${host}, port: ${port} failed.
       error: ${err}`,
    );
  });
  client.select(0);
  client.flushdb();
  return client;
}

export default redisInit;
