import dotenv from 'dotenv';

dotenv.config();

const env = process.env.NODE_ENV;
console.log(`process.env = ${process.env.NODE_ENV}`);

const test = {
  app: {
    port: process.env.PORT || 3000,
  },
  storage: {
    name: process.env.TEST_REPOSITORY,
    host: process.env.REPOSITORY_HOST,
    port: 6379,
  },
};
const sql = {
  app: {
    port: process.env.PORT || 3000,
  },
  storage: {
    name: 'SQL',
    host: process.env.REPOSITORY_HOST,
    port: 6379,
    SQLPort: 3306,
    SQLHost: process.env.SQL_HOST,
    SQLDialect: 'mysql',
  },
};
const config = {
  test,
  sql,
};
const envConfig = config[env];

export { envConfig };
