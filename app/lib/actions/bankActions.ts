"use server";

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function saveBankStatement(fileName: string, transactions: any[]) {
  try {
    // Insert into bank_statements
    const statementRes = await sql`
      INSERT INTO bank_statements (file_name, status)
      VALUES (${fileName}, 'Completed')
      RETURNING id
    `;
    const statementId = statementRes[0].id;

    // Bulk insert into transactions
    for (const trx of transactions) {
      await sql`
        INSERT INTO transactions (
          statement_id, date, description, teller, debit, credit, balance, category
        )
        VALUES (
          ${statementId}, 
          ${trx.date}, 
          ${trx.description}, 
          ${trx.teller || null}, 
          ${trx.debit || 0}, 
          ${trx.credit || 0}, 
          ${trx.balance || null},
          ${trx.category || null}
        )
      `;
    }

    return { success: true, statementId };
  } catch (err: any) {
    console.error("Error saving bank statement:", err);
    return { success: false, error: err.message };
  }
}

export async function getBankTransactions() {
  try {
    const data = await sql`
      SELECT id, date, description, teller, debit, credit, balance, category 
      FROM transactions
      ORDER BY date DESC
    `;
    return { success: true, data };
  } catch (err: any) {
    console.error("Error getting bank transactions:", err);
    return { success: false, error: err.message };
  }
}
