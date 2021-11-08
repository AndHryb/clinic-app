import pkg from 'pg';
import { envConfig } from '../../config.js';

const { Pool } = pkg;

const pool = new Pool({
  user: envConfig.pg.user,
  host: envConfig.pg.host,
  database: envConfig.pg.database,
  password: envConfig.pg.password,
  port: envConfig.pg.port,
});

export { pool as default };
