import dotenv from 'dotenv';

dotenv.config();

const app = {
  port: process.env.PORT || 3000,
};
const sql = {
  port: process.env.SQL_PORT || 3306,
  host: process.env.SQL_HOST || '127.0.0.1',
  database: process.env.SQL_DB || 'clinic_db',
  user: process.env.SQL_USER || 'root',
  password: process.env.SQL_PASSWORD || '',
  dialect: 'mysql',
};
const redis = {
  port: process.env.REDIS_PORT || 6379,
  host: process.env.REDIS_HOST || '127.0.0.1',
  ttl: process.env.DOC_LIST_TTL || 600,
};
const envConfig = {
  app,
  sql,
  redis,
};

export { envConfig };
