import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    // 1. bank_statements table
    await sql`
      CREATE TABLE IF NOT EXISTS bank_statements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_name TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'Processing'
      );
    `;
    console.log("Created table 'bank_statements'");

    // 2. transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        statement_id UUID REFERENCES bank_statements(id) ON DELETE SET NULL,
        date DATE NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        category TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("Created table 'transactions'");

    console.log("Bank database migration successful!");
  } catch (e) {
    console.error("Migration Error:", e);
  }
}

main();
