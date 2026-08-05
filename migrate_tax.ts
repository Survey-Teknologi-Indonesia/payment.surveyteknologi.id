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
    console.log("Creating tax tables...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tax_ppn_masukan (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        description TEXT NOT NULL,
        vendor_name TEXT NOT NULL,
        faktur_pajak_no TEXT NOT NULL,
        dpp NUMERIC NOT NULL,
        ppn_amount NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tax_pph21 (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        employee_name TEXT NOT NULL,
        gross_salary NUMERIC NOT NULL,
        tax_amount NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tax_monthly_status (
        period VARCHAR(50) PRIMARY KEY,
        status VARCHAR(50) NOT NULL DEFAULT 'Belum Disetor',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tax tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    await pool.end();
  }
}

run();
