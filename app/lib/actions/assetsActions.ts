"use server";

import pool from "@/app/lib/neon";

export async function createAssetsTableAction() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        location VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    return { success: true };
  } catch (error: any) {
    console.error("createAssetsTableAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchAssetsAction() {
  try {
    // Ensure table exists
    await createAssetsTableAction();

    const result = await pool.query('SELECT * FROM assets ORDER BY created_at DESC');
    return { success: true, data: result.rows };
  } catch (error: any) {
    console.error("fetchAssetsAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function addAssetAction(name: string, quantity: number, location: string) {
  try {
    // Ensure table exists
    await createAssetsTableAction();

    await pool.query(
      `INSERT INTO assets (name, quantity, location) VALUES ($1, $2, $3)`,
      [name, quantity, location]
    );
    
    return { success: true };
  } catch (error: any) {
    console.error("addAssetAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateAssetLocationAction(id: string, location: string) {
  try {
    await pool.query(
      `UPDATE assets SET location = $1 WHERE id = $2`,
      [location, id]
    );
    
    return { success: true };
  } catch (error: any) {
    console.error("updateAssetLocationAction error:", error);
    return { success: false, error: error.message };
  }
}
