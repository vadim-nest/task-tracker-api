require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { init } = require("./db");
const tasks = require("./routes/tasks");

const app = express();
app.use(helmet());
app.use(express.json());

// Only needed if browser calls API directly:
app.use(cors({ origin: true, credentials: true }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/tasks", tasks);

// Basic error handler
app.use((err, _req, res, _next) => {
  if (err?.status) return res.status(err.status).json({ error: err.message });
  console.error(err);
  return res.status(500).json({ error: "InternalServerError" });
});

async function start() {
  await init();
  app.listen(process.env.PORT || 4000, () =>
    console.log(`API listening on :${process.env.PORT || 4000}`)
  );
}
module.exports = { app, start };
