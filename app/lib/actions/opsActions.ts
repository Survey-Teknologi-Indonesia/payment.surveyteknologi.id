"use server";

import pool from "@/app/lib/neon";

export async function fetchOpsAction() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM "opsOasis" ORDER BY date DESC');
    return { success: true, data: result.rows };
  } catch (error: any) {
    console.error("fetchOpsAction error:", error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

export async function addOpsAction(date: string, item: string, total: number) {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO "opsOasis" (date, item, total) VALUES ($1, $2, $3)`,
      [date, item, total]
    );
    return { success: true };
  } catch (error: any) {
    console.error("addOpsAction error:", error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

export async function deleteOpsAction(opsId: string) {
  const client = await pool.connect();
  try {
    await client.query(
      `DELETE FROM "opsOasis" WHERE ops_id = $1`,
      [opsId]
    );
    return { success: true };
  } catch (error: any) {
    console.error("deleteOpsAction error:", error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}
