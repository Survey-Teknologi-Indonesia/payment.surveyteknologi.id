import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    await sql`ALTER TABLE account ADD COLUMN IF NOT EXISTS jabatan TEXT;`;
    
    // Populate the existing users with some default jabatan based on their emails
    await sql`UPDATE account SET jabatan = 'Direktur Utama' WHERE email LIKE 'hindrawan%';`;
    await sql`UPDATE account SET jabatan = 'Komisaris' WHERE email LIKE 'riocandra%';`;
    await sql`UPDATE account SET jabatan = 'PJ STI Depok' WHERE email LIKE 'mashari%';`;
    
    console.log("Success: Added column 'jabatan' and updated default values.");
  } catch (e) {
    console.error("Error:", e);
  }
}

main();
