import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    // 1. Drop existing transactions table to apply new schema
    await sql`DROP TABLE IF EXISTS transactions;`;
    console.log("Dropped table 'transactions'");

    // 2. We keep bank_statements as is (no structural changes needed)
    // We recreate transactions with the new detailed schema
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        statement_id UUID REFERENCES bank_statements(id) ON DELETE SET NULL,
        date DATE NOT NULL,
        description TEXT NOT NULL,
        teller TEXT,
        debit NUMERIC NOT NULL DEFAULT 0,
        credit NUMERIC NOT NULL DEFAULT 0,
        balance NUMERIC,
        category TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("Created table 'transactions' with detailed schema");

    console.log("Bank database migration v2 successful!");
  } catch (e) {
    console.error("Migration Error:", e);
  }
}

main();
