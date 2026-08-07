"use server";

import pool from "@/app/lib/neon";

export async function fetchTicketsAction(userEmail: string, userName: string) {
  try {
    // Jika admin, ambil semua tiket. Jika tidak, ambil tiket miliknya (berdasarkan user)
    if (userEmail === "riocandra@surveyteknologi.id") {
      const result = await pool.query('SELECT * FROM tickets ORDER BY date DESC');
      return { success: true, data: result.rows };
    } else {
      const result = await pool.query('SELECT * FROM tickets WHERE "user" = $1 ORDER BY date DESC', [userName]);
      return { success: true, data: result.rows };
    }
  } catch (error: any) {
    console.error("fetchTicketsAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function submitTicketAction(userName: string, issue: string) {
  try {
    const date = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    
    await pool.query(
      `INSERT INTO tickets ("user", date, messages, status) VALUES ($1, $2, $3, 'submitted')`,
      [userName, date, issue]
    );
    
    return { success: true };
  } catch (error: any) {
    console.error("submitTicketAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTicketStatusAction(ticketId: string, status: string) {
  try {
    await pool.query(
      `UPDATE tickets SET status = $1 WHERE tickets_id = $2`,
      [status, ticketId]
    );
    
    return { success: true };
  } catch (error: any) {
    console.error("updateTicketStatusAction error:", error);
    return { success: false, error: error.message };
  }
}
