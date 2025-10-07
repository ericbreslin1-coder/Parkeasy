#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import pkg from 'pg';
import 'dotenv/config';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'parkeasy',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
});

async function run() {
  const migrationsDir = path.resolve('migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => /^\d+_.*\.sql$/.test(f))
    .sort((a,b) => a.localeCompare(b));

  console.log('Applying migrations in order:\n', files.join('\n '));

  for (const file of files) {
    const full = path.join(migrationsDir, file);
    const sql = fs.readFileSync(full, 'utf8');
    console.log(`\n>>> Running ${file}`);
    try {
      await pool.query(sql);
      console.log(`✔ Completed ${file}`);
    } catch (e) {
      console.error(`✖ Failed ${file}:`, e.message);
      process.exit(1);
    }
  }
  await pool.end();
  console.log('\nAll migrations applied successfully.');
}

run();
