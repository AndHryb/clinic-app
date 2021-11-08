import { migrate } from 'postgres-migrations';
import dotenv from 'dotenv';

dotenv.config();

async function migrations() {
  const dbConfig = {
    database: 'clinic_db',
    user: 'anhryb',
    password: '143234',
    host: '127.0.0.1',
    port: 5432,
    ensureDatabaseExists: true,
    defaultDatabase: 'postgres',
  };
  try {
    await migrate(dbConfig, './helpers/migrations/');
  } catch (err) {
    console.log(err);
  }
}

migrations();
