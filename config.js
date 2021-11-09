import dotenv from 'dotenv';

dotenv.config();

const app = {
  port: process.env.PORT || 3000,
};
const redis = {
  port: process.env.REDIS_PORT || 6379,
  host: process.env.REDDIS_HOST || '127.0.0.1',
  ttl: process.env.DOC_LIST_TTL || 600,
};
const pg = {
  port: process.env.PG_PORT || 5432,
  host: process.env.PG_HOST || '127.0.0.1',
  database: process.env.PG_DB || 'clinic_db',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '',
};
const envConfig = {
  app,
  redis,
  pg,
};

export { envConfig };
