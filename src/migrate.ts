import { readFile } from 'node:fs/promises';
import { pool } from './config/db.js';

try {
  const schema = await readFile(new URL('../schema.sql', import.meta.url), 'utf8');


await pool.query(schema);
  // await pool.query(schema);
  process.stdout.write('Database schema is ready\n');

} finally {
  
  await pool.end();
}