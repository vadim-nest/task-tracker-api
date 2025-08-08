function validateTask(body, { partial = false } = {}) {
  const errors = [];
  const allowed = ["todo", "in_progress", "done"];

  if (!partial) {
    if (!body.title || typeof body.title !== "string")
      errors.push({ path: "title", message: "Title is required" });
  }
  if (body.status && !allowed.includes(body.status))
    errors.push({ path: "status", message: "Invalid status" });
  if (body.dueAt && isNaN(Date.parse(body.dueAt)))
    errors.push({ path: "dueAt", message: "Invalid ISO date" });

  return { ok: errors.length === 0, errors };
}
module.exports = { validateTask };
