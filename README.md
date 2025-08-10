# Task Tracker API
Simple REST API for managing caseworker tasks.
Built with Node.js, Express, and PostgreSQL. Includes validation, basic security hardening, and integration tests.

## Tech stack
Node.js + Express

PostgreSQL (pg Pool)

Helmet (security headers), CORS (optional)

Jest + Supertest (integration tests)

Nodemon (dev)

## Features
Create, read, update, delete tasks

Update task status via dedicated endpoint

Filter list by status and by due date (dueBefore)

ISO 8601 timestamps, server validation, consistent error format

Health endpoint

## Quick start
### Requirements
Node 18+

PostgreSQL 13+

DATABASE_URL with a database the app can write to

### Environment
Create .env from the example:

```bash
cp .env.example .env
# edit as needed
```

**.env.example**
```ini
PORT=4000
DATABASE_URL=postgres://app:app@localhost:5432/tasks
```

### Install & run
```bash
npm i
npm run dev        # nodemon
# or
npm start          # node
```

Server prints:
```nginx
API listening on :4000
```

## Tests
```bash
npm test
```
Tests truncate the tasks table in the configured DB. Use a separate test database.

## Database
Schema is created automatically on boot:
```sql
CREATE TABLE IF NOT EXISTS tasks(
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('todo','in_progress','done')),
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tasks_status_due ON tasks(status, due_at);
```

## API
Base URL: http://localhost:${PORT} (default :4000)  
All responses are JSON.

### Health
`GET /health` → `200 { "ok": true }`

### List tasks
`GET /tasks?status=<todo|in_progress|done>&dueBefore=<ISO>&limit=<n>&offset=<n>`

Filters are optional.

Example:
```bash
GET /tasks?status=in_progress&dueBefore=2025-08-10T12:00:00.000Z
200
```
```json
{
  "data": [
    {
      "id": "6c4…",
      "title": "Prepare bundle",
      "description": "Case 12345",
      "status": "in_progress",
      "dueAt": "2025-08-12T09:00:00.000Z",
      "createdAt": "2025-08-10T10:01:22.000Z",
      "updatedAt": "2025-08-10T10:01:22.000Z"
    }
  ]
}
```

### Get a task
`GET /tasks/:id`

- 200 → `{ "data": {…task} }`  
- 404 → `{ "error": "Not found" }`

### Create a task
`POST /tasks`
```json
{
  "title": "Write witness summary",
  "description": "Optional",
  "status": "todo",
  "dueAt": "2025-08-12T09:00:00.000Z"
}
```
- 201 → `{ "data": { "...created task..." } }`
- 400 →  
```json
{
  "error": "Validation",
  "details": [
    { "path": "title", "message": "Title is required" },
    { "path": "status", "message": "Invalid status" },
    { "path": "dueAt", "message": "Invalid ISO date" }
  ]
}
```

### Update a task
`PUT /tasks/:id`  
Body is the full task payload (same fields as create).

- 200 → `{ "data": {…updated} }`  
- 400 → validation as above  
- 404 → `{ "error": "Not found" }`

### Update status only
`PATCH /tasks/:id/status`
```json
{ "status": "in_progress" }
```
- 200 → `{ "data": {…updated} }`  
- 400 → `{ "error": "Validation", "details":[{ "path":"status","message":"Invalid status" }] }`  
- 404 → `{ "error": "Not found" }`

### Delete a task
`DELETE /tasks/:id`  
204 → no body

## Data model
```ts
Task {
  id: string (uuid)
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  dueAt: string | null        // ISO 8601
  createdAt: string           // ISO 8601
  updatedAt: string           // ISO 8601
}
```

## Validation
- title required (string, non-empty)  
- status must be one of `todo` | `in_progress` | `done`  
- dueAt must be a valid ISO date if provided  

Validation errors use a consistent shape (`error`, `details[]`).

## Security
- helmet() enabled by default  
- cors() enabled with `origin: true` for convenience (adjust/remove if only the server-side web app calls this API)  
- Parameterised SQL (no string interpolation)  

## Project layout
```csharp
src/
  app.js            # express app, middleware, routes, error handler
  server.js         # entrypoint
  db.js             # pg Pool + bootstrap DDL
  routes/
    tasks.js        # REST routes
  repo/
    taskRepo.js     # data access (SQL)
  middleware/
    validate.js     # request body validation
tests/
  tasks.int.test.js # integration test
.env.example
```

## Decisions & trade-offs
- No ORM: simple SQL with pg keeps the footprint small.  
- DDL on boot: acceptable for a coding test; in production, use migrations.  
- Timestamps: ISO 8601 strings for client simplicity; DB stores timestamptz.  
- Status endpoint: separate PATCH to highlight partial update workflow.  

## Running with Docker (optional)
You can run Postgres locally, e.g.:
```bash
docker run --name tasksdb -e POSTGRES_PASSWORD=app -e POSTGRES_USER=app   -e POSTGRES_DB=tasks -p 5432:5432 -d postgres:16
```
Then set:
```bash
DATABASE_URL=postgres://app:app@localhost:5432/tasks
```

## Licence
ISC (see package.json).
