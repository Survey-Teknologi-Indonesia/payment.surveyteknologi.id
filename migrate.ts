import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });
config({ path: ".env.local" });

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
      console.error("No DATABASE_URL found.");
      return;
  }
  const pool = new Pool({ connectionString });
  try {
    console.log("Adding columns to invoice table...");
    await pool.query(`
      ALTER TABLE invoice 
      ADD COLUMN IF NOT EXISTS customer_address TEXT,
      ADD COLUMN IF NOT EXISTS up TEXT,
      ADD COLUMN IF NOT EXISTS phone TEXT,
      ADD COLUMN IF NOT EXISTS items JSONB
    `);
    console.log("Columns added successfully!");
  } catch (error) {
    console.error("Error altering table:", error);
  } finally {
    await pool.end();
  }
}

run();
