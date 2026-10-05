import 'dotenv/config';
import pg from 'pg';

const mydb = process.env.DATABASE_URL;

const ssl = process.env.DATABASE_SSL

const { Pool } = pg;
const connectionString = mydb;

// if (!connectionStr) {
//   throw new Error(' failed to connect to Database connection string is required');
// }


if (!connectionString) {
  throw new Error(' failed to connect to Database connection string is required');
}

export const pool = new Pool({
  connectionString,
  ssl: ssl === 'true' ? { rejectUnauthorized: true } : undefined
});

pool.on('error', () => {
  process.stderr.write('Unexpected PostgreSQL error\n');
});