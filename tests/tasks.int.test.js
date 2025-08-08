const request = require("supertest");
const { app } = require("../src/app");
const { pool } = require("../src/db");

beforeAll(async () => {
  await pool.query("TRUNCATE tasks");
});
afterAll(async () => {
  await pool.end();
});

it("creates and fetches a task", async () => {
  const created = await request(app)
    .post("/tasks")
    .send({ title: "Write docs" });
  expect(created.status).toBe(201);
  const id = created.body.data.id;

  const got = await request(app).get(`/tasks/${id}`);
  expect(got.status).toBe(200);
  expect(got.body.data.title).toBe("Write docs");
});
