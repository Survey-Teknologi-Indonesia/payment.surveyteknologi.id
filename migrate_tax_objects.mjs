import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    console.log("Creating tax_objects table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tax_objects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_id VARCHAR(255),
        transaction_description VARCHAR(255),
        tax_name VARCHAR(255) NOT NULL,
        tax_type VARCHAR(50) NOT NULL,
        base_amount DECIMAL(15,2) NOT NULL,
        tax_amount DECIMAL(15,2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

runMigration();
