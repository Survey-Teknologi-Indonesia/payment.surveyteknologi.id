"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getUserProfile() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`
      SELECT account_id, email, level, name, jabatan, password
      FROM account
      WHERE account_id = ${userId}
    `;

    if (result.length > 0) {
      return { success: true, user: result[0] };
    }
    return { success: false, message: "User not found" };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { success: false, message: "Failed to fetch profile" };
  }
}

export async function updateUserProfile(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) {
    return { success: false, message: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const emailPrefix = formData.get("emailPrefix") as string;
  const oldPassword = formData.get("oldPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  const email = `${emailPrefix}@surveyteknologi.id`;

  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // Check old password if they want to change password
    let passwordToSave = undefined;

    if (newPassword) {
      if (!oldPassword) {
        return { success: false, message: "Silakan masukkan password lama Anda." };
      }

      // Verify old password
      const userRes = await sql`SELECT password FROM account WHERE account_id = ${userId}`;
      if (userRes.length === 0) return { success: false, message: "User not found." };
      
      const currentPassword = userRes[0].password;
      if (currentPassword !== oldPassword) {
        return { success: false, message: "Password lama salah." };
      }
      
      passwordToSave = newPassword;
    }
    
    // Update the database
    let result;
    if (passwordToSave) {
      result = await sql`
        UPDATE account 
        SET name = ${name}, email = ${email}, password = ${passwordToSave}
        WHERE account_id = ${userId}
        RETURNING *
      `;
    } else {
      result = await sql`
        UPDATE account 
        SET name = ${name}, email = ${email}
        WHERE account_id = ${userId}
        RETURNING *
      `;
    }

    revalidatePath("/dashboard/profile");
    return { success: true, message: "Profile updated successfully!", user: result[0] };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: "Failed to update profile." };
  }
}
