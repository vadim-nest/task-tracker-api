const { pool } = require("../db");
const { randomUUID } = require("crypto");

const map = (r) => ({
  id: r.id,
  title: r.title,
  description: r.description,
  status: r.status,
  dueAt: r.due_at ? new Date(r.due_at).toISOString() : null,
  createdAt: r.created_at.toISOString(),
  updatedAt: r.updated_at.toISOString(),
});

async function list({ status, dueBefore, limit = 50, offset = 0 }) {
  const where = [];
  const params = [];
  if (status) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }
  if (dueBefore) {
    params.push(dueBefore);
    where.push(`due_at <= $${params.length}`);
  }
  let sql = "SELECT * FROM tasks";
  if (where.length) sql += ` WHERE ${where.join(" AND ")}`;
  sql += ` ORDER BY due_at NULLS LAST, created_at DESC LIMIT $${params.push(
    limit
  )} OFFSET $${params.push(offset)}`;
  const { rows } = await pool.query(sql, params);
  return rows.map(map);
}

async function get(id) {
  const { rows } = await pool.query("SELECT * FROM tasks WHERE id=$1", [id]);
  return rows[0] ? map(rows[0]) : null;
}

async function create({ title, description, status = "todo", dueAt = null }) {
  const id = randomUUID();
  const { rows } = await pool.query(
    `INSERT INTO tasks(id,title,description,status,due_at)
     VALUES($1,$2,$3,$4,$5) RETURNING *`,
    [id, title.trim(), description ?? null, status, dueAt]
  );
  return map(rows[0]);
}

async function update(id, { title, description, status, dueAt }) {
  const { rows } = await pool.query(
    `UPDATE tasks SET
      title=$2, description=$3, status=$4, due_at=$5, updated_at=NOW()
     WHERE id=$1 RETURNING *`,
    [id, title.trim(), description ?? null, status, dueAt]
  );
  return rows[0] ? map(rows[0]) : null;
}

async function updateStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE tasks SET status=$2, updated_at=NOW() WHERE id=$1 RETURNING *`,
    [id, status]
  );
  return rows[0] ? map(rows[0]) : null;
}

async function remove(id) {
  await pool.query("DELETE FROM tasks WHERE id=$1", [id]);
}

module.exports = { list, get, create, update, updateStatus, remove };
