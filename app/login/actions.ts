"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";

export async function loginUser(email: string, password: string) {
  if (!process.env.DATABASE_URL) {
    return { success: false, message: "Database URL not configured" };
  }
  
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Querying the account table matching the schema provided
    const result = await sql`
      SELECT account_id, email, level, name, jabatan
      FROM account
      WHERE email = ${email} AND password = ${password}
    `;
    
    if (result.length > 0) {
      const user = result[0];
      
      // Set auth cookie
      const cookieStore = await cookies();
      cookieStore.set('auth_token', user.account_id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 // 1 day
      });

      return { 
        success: true, 
        message: "Authentication successful! Redirecting to dashboard...", 
        user: { 
          id: user.account_id, 
          email: user.email, 
          level: user.level,
          name: user.name,
          jabatan: user.jabatan
        } 
      };
    } else {
      return { success: false, message: "Invalid email or password." };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "An error occurred during login. Please try again." };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  return { success: true };
}
