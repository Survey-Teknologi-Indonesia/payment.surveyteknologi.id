import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log("Adding last_seen column to account table...");
    await pool.query(`
      ALTER TABLE account 
      ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE;
    `);
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await pool.end();
  }
}

migrate();
