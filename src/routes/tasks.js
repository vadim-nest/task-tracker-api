const express = require("express");
const router = express.Router();
const repo = require("../repo/tasksRepo");
const { validateTask } = require("../middleware/validate");

router.get("/", async (req, res, next) => {
  try {
    const { status, dueBefore, limit, offset } = req.query;
    const data = await repo.list({ status, dueBefore, limit, offset });
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const item = await repo.get(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json({ data: item });
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const v = validateTask(req.body);
    if (!v.ok)
      return res.status(400).json({ error: "Validation", details: v.errors });
    const created = await repo.create(req.body);
    res.status(201).json({ data: created });
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const v = validateTask(req.body);
    if (!v.ok)
      return res.status(400).json({ error: "Validation", details: v.errors });
    const updated = await repo.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ data: updated });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
