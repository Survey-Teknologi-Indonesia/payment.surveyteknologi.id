"use server";

import pool from "@/app/lib/neon";

export async function submitRequestAccess(formData: FormData) {
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const reason = formData.get("reason")?.toString() + "from : " + email;
  const date = "now()";

  if (!name || !email || !reason) {
    return { success: false, error: "Semua kolom harus diisi." };
  }

  const client = await pool.connect();
  try {
    // Memastikan table tickets ada (opsional, untuk safety)


    await client.query(
      `INSERT INTO tickets ("user", date, messages, status) VALUES ($1, $2, $3, $4)`,
      [name, date, reason, "submitted"]
    );

    return { success: true };
  } catch (error: any) {
    console.error("submitRequestAccess error:", error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}
