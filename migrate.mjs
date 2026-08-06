import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    // 1. invoices table
    await sql`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        no_invoice TEXT UNIQUE NOT NULL,
        client_name TEXT NOT NULL,
        date DATE NOT NULL,
        subtotal NUMERIC NOT NULL,
        dpp NUMERIC NOT NULL,
        ppn NUMERIC NOT NULL,
        pph NUMERIC NOT NULL,
        status TEXT NOT NULL DEFAULT 'Draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("Created table 'invoices'");

    // 2. tax_ppn_masukan table
    await sql`
      CREATE TABLE IF NOT EXISTS tax_ppn_masukan (
        id SERIAL PRIMARY KEY,
        vendor_name TEXT NOT NULL,
        date DATE NOT NULL,
        invoice_number TEXT NOT NULL,
        total_amount NUMERIC NOT NULL,
        ppn_amount NUMERIC NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("Created table 'tax_ppn_masukan'");

    // 3. tax_pph21 table
    await sql`
      CREATE TABLE IF NOT EXISTS tax_pph21 (
        id SERIAL PRIMARY KEY,
        employee_name TEXT NOT NULL,
        role TEXT NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        gross_salary NUMERIC NOT NULL,
        pph21_amount NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("Created table 'tax_pph21'");

    console.log("Database migration successful!");
  } catch (e) {
    console.error("Migration Error:", e);
  }
}

main();
