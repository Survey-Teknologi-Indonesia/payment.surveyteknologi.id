"use server";

import pool from "@/app/lib/neon";

export async function setupSchedulerTables() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_date DATE,
        end_date DATE,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS scheduler_tasks (
        id VARCHAR(50) PRIMARY KEY,
        project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        start_date DATE,
        end_date DATE,
        progress INTEGER DEFAULT 0,
        assigned_to VARCHAR(100),
        sort_order INTEGER DEFAULT 0
      );
    `;
    await pool.query(query);
    return { success: true, message: "Tables created successfully." };
  } catch (error: any) {
    console.error("Error setting up scheduler tables:", error);
    return { success: false, error: error.message };
  }
}

export async function getProjects() {
  try {
    const result = await pool.query(`SELECT * FROM projects ORDER BY created_at DESC`);
    return { success: true, data: result.rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTasks(projectId?: string) {
  try {
    let query = `SELECT * FROM scheduler_tasks ORDER BY sort_order ASC, start_date ASC`;
    let values: any[] = [];
    if (projectId) {
      query = `SELECT * FROM scheduler_tasks WHERE project_id = $1 ORDER BY sort_order ASC, start_date ASC`;
      values = [projectId];
    }
    const result = await pool.query(query, values);
    return { success: true, data: result.rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveTask(task: {
  id: string;
  project_id: string;
  name: string;
  start_date: string;
  end_date: string;
  progress: number;
  assigned_to: string;
  sort_order: number;
}) {
  try {
    const query = `
      INSERT INTO scheduler_tasks (id, project_id, name, start_date, end_date, progress, assigned_to, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        progress = EXCLUDED.progress,
        assigned_to = EXCLUDED.assigned_to,
        sort_order = EXCLUDED.sort_order;
    `;
    const values = [
      task.id,
      task.project_id || 'default-project', // fallback
      task.name,
      task.start_date || null,
      task.end_date || null,
      task.progress || 0,
      task.assigned_to || '',
      task.sort_order || 0
    ];
    await pool.query(query, values);
    return { success: true };
  } catch (error: any) {
    console.error("Error saving task:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTask(id: string) {
  try {
    await pool.query(`DELETE FROM scheduler_tasks WHERE id = $1`, [id]);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Dummy project creation just to ensure foreign keys don't fail if we haven't built project management yet
export async function ensureDefaultProject() {
  try {
    const query = `
      INSERT INTO projects (id, name, status) 
      VALUES ('default-project', 'STI Internal Project', 'Active')
      ON CONFLICT (id) DO NOTHING;
    `;
    await pool.query(query);
  } catch (e) {
    console.error("Failed to ensure default project", e);
  }
}
