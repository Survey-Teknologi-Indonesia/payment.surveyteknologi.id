"use server";

import pool from "@/app/lib/neon";

export async function saveInvoiceData(
  invoiceId: string, 
  customer: string, 
  date: string, 
  dpp: number,
  customerAddress: string = "",
  up: string = "",
  phone: string = "",
  items: any[] = []
) {
  try {
    const query = `
      INSERT INTO invoice (invoice_id, customer, date, dpp, status, customer_address, up, phone, items)
      VALUES ($1, $2, $3, $4, 'Pending', $5, $6, $7, $8)
      ON CONFLICT (invoice_id) 
      DO NOTHING;
    `;
    const values = [invoiceId, customer, date, dpp, customerAddress, up, phone, JSON.stringify(items)];
    const result = await pool.query(query, values);
    
    if (result.rowCount === 0) {
      return { success: true, inserted: false, message: "Nomor Invoice sudah ada. Tidak disimpan ulang." };
    }
    
    return { success: true, inserted: true };
  } catch (error) {
    console.error("Error saving invoice:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getInvoices() {
  try {
    const query = `
      SELECT *
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
