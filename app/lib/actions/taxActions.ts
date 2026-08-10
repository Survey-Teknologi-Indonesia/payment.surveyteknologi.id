"use server";

import pool from "@/app/lib/neon";

// --- PPN MASUKAN ---
export async function getPpnMasukan() {
  try {
    const query = `SELECT * FROM tax_ppn_masukan ORDER BY date DESC`;
    const result = await pool.query(query);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error("Error fetching ppn masukan:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function addPpnMasukan(
  date: string,
  description: string,
  vendor_name: string,
  faktur_pajak_no: string,
  dpp: number,
  ppn_amount: number
) {
  try {
    const query = `
      INSERT INTO tax_ppn_masukan (date, description, vendor_name, faktur_pajak_no, dpp, ppn_amount)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [date, description, vendor_name, faktur_pajak_no, dpp, ppn_amount];
    const result = await pool.query(query, values);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error("Error adding ppn masukan:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deletePpnMasukan(id: number) {
  try {
    const query = `DELETE FROM tax_ppn_masukan WHERE id = $1`;
    await pool.query(query, [id]);
    return { success: true };
  } catch (error) {
    console.error("Error deleting ppn masukan:", error);
    return { success: false, error: (error as Error).message };
  }
}

// --- PPh 21 ---
export async function getPph21() {
  try {
    const query = `SELECT * FROM tax_pph21 ORDER BY date DESC`;
    const result = await pool.query(query);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error("Error fetching pph21:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function addPph21(
  date: string,
  employee_name: string,
  gross_salary: number,
  tax_amount: number
) {
  try {
    const query = `
      INSERT INTO tax_pph21 (date, employee_name, gross_salary, tax_amount)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [date, employee_name, gross_salary, tax_amount];
    const result = await pool.query(query, values);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error("Error adding pph21:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deletePph21(id: number) {
  try {
    const query = `DELETE FROM tax_pph21 WHERE id = $1`;
    await pool.query(query, [id]);
    return { success: true };
  } catch (error) {
    console.error("Error deleting pph21:", error);
    return { success: false, error: (error as Error).message };
  }
}

// --- MONTHLY STATUS ---
export async function getMonthlyStatus(period: string) {
  try {
    const query = `SELECT status FROM tax_monthly_status WHERE period = $1`;
    const result = await pool.query(query, [period]);
    if (result.rows.length > 0) {
      return { success: true, status: result.rows[0].status };
    }
    return { success: true, status: 'Belum Disetor' };
  } catch (error) {
    console.error("Error fetching monthly status:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function toggleMonthlyStatus(period: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === 'Sudah Disetor' ? 'Belum Disetor' : 'Sudah Disetor';
    const query = `
      INSERT INTO tax_monthly_status (period, status)
      VALUES ($1, $2)
      ON CONFLICT (period) 
      DO UPDATE SET status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP
      RETURNING status;
    `;
    const result = await pool.query(query, [period, newStatus]);
    return { success: true, status: result.rows[0].status };
  } catch (error) {
    console.error("Error toggling monthly status:", error);
    return { success: false, error: (error as Error).message };
  }
}

// --- TAX OBJECTS (NEW REVAMP) ---
export async function getTaxObjects() {
  try {
    const query = `SELECT * FROM tax_objects ORDER BY date DESC, created_at DESC`;
    const result = await pool.query(query);
    return { success: true, data: result.rows };
  } catch (error) {
    console.error("Error fetching tax objects:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function addTaxObject(
  transaction_id: string,
  transaction_description: string,
  tax_name: string,
  tax_type: string,
  base_amount: number,
  tax_amount: number,
  status: string,
  date: string
) {
  try {
    const query = `
      INSERT INTO tax_objects (transaction_id, transaction_description, tax_name, tax_type, base_amount, tax_amount, status, date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [transaction_id, transaction_description, tax_name, tax_type, base_amount, tax_amount, status, date];
    const result = await pool.query(query, values);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error("Error adding tax object:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteTaxObject(id: string) {
  try {
    const query = `DELETE FROM tax_objects WHERE id = $1`;
    await pool.query(query, [id]);
    return { success: true };
  } catch (error) {
    console.error("Error deleting tax object:", error);
    return { success: false, error: (error as Error).message };
  }
}
