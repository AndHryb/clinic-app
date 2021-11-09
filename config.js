import dotenv from 'dotenv';

dotenv.config();
const app = {
  port: process.env.PORT,
};
const redis = {
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  ttl: process.env.DOC_LIST_TTL,
};
const pg = {
  port: process.env.PG_PORT,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
};
const envConfig = {
  app,
  redis,
  pg,
};

export { envConfig as default};
