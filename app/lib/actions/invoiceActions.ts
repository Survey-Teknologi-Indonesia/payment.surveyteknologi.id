"use server";

import pool from "@/app/lib/neon";

export async function saveInvoiceData(invoiceId: string, customer: string, date: string, dpp: number) {
  try {
    const query = `
      INSERT INTO invoice (invoice_id, customer, date, dpp, status)
      VALUES ($1, $2, $3, $4, 'Pending')
      ON CONFLICT (invoice_id) 
      DO UPDATE SET 
        customer = EXCLUDED.customer,
        date = EXCLUDED.date,
        dpp = EXCLUDED.dpp;
    `;
    const values = [invoiceId, customer, date, dpp];
    await pool.query(query, values);
    return { success: true };
  } catch (error) {
    console.error("Error saving invoice:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getInvoices() {
  try {
    const query = `
      SELECT invoice_id, customer, date, dpp, status
      FROM invoice
      ORDER BY date DESC
    `;
    const result = await pool.query(query);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function toggleInvoiceStatus(invoiceId: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    const query = `
      UPDATE invoice
      SET status = $1
      WHERE invoice_id = $2
    `;
    await pool.query(query, [newStatus, invoiceId]);
    return { success: true, newStatus };
  } catch (error) {
    console.error("Error toggling status:", error);
    return { success: false, error: (error as Error).message };
  }
}
