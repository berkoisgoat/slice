# Workflow Engine (TypeScript + Express)

A minimal workflow automation engine that lets you define simple workflows (steps with dependencies) and run them. The project exposes a small HTTP API and a Swagger UI to add and trigger workflows interactively.

## Run Dev

```bash
yarn
yarn dev
```

By default the app listens on port 3000. Open http://localhost:3000/docs to view the Swagger UI.

## What you can do

- Add workflows via the POST /workflows endpoint.
- List workflows with GET /workflows.
- Trigger a workflow run with POST /workflows/{id}/run.
- View past runs with GET /workflows/{id}/runs.

## Workflow schema

Each workflow has a name and an array of steps. Each step must include:

- `name` (string)
- `type` (string) — allowed values: `sendEmail`, `updateGrant`
- `dependsOn` (array of step names) — optional, defaults to []
- `fail` (boolean) — optional; if true the step will be simulated as failed when the workflow runs

Example JSON to create a workflow (this is also suitable to paste into the Swagger UI):

```json
{
  "name": "Example with failure",
  "steps": [
    { "name": "Update Grant 1", "type": "updateGrant", "dependsOn": [] },
    { "name": "Update Grant 2", "type": "updateGrant", "dependsOn": [], "fail": true },
    { "name": "Send Email", "type": "sendEmail", "dependsOn": ["Update Grant 1", "Update Grant 2"] }
  ]
}
```

In this example `Update Grant 2` is marked with `fail: true`, so it will be reported as failed when the workflow is run and any steps depending on it will be skipped.

## Quick curl examples

1. Create a workflow (returns the created workflow object / id):

```bash
curl -X POST http://localhost:3000/workflows \
	-H "Content-Type: application/json" \
	-d '{"name":"Example with failure","steps":[{"name":"Update Grant 1","type":"updateGrant","dependsOn":[]},{"name":"Update Grant 2","type":"updateGrant","dependsOn":[],"fail":true},{"name":"Send Email","type":"sendEmail","dependsOn":["Update Grant 1","Update Grant 2"]}]}'
```

```json
"ccbd584b-a635-45a4-abd9-c703f19a25f5"
```

2. Trigger the workflow run (replace `<id>` with the workflow id returned above):

```bash
curl -X POST http://localhost:3000/workflows/ccbd584b-a635-45a4-abd9-c703f19a25f5/run
```

```json
{
  "workflowId": "ccbd584b-a635-45a4-abd9-c703f19a25f5",
  "executedSteps": [
    { "name": "Update Grant 1", "type": "updateGrant", "status": "success" },
    { "name": "Update Grant 2", "type": "updateGrant", "status": "failed" },
    { "name": "Send Email", "type": "sendEmail", "status": "skipped" }
  ],
  "updatedAt": 1764174175726
}
```

3. Get runs for a workflow:

```bash
curl http://localhost:3000/workflows/ccbd584b-a635-45a4-abd9-c703f19a25f5/runs
```

```json
[
  {
    "workflowId": "ccbd584b-a635-45a4-abd9-c703f19a25f5",
    "executedSteps": [
      { "name": "Update Grant 1", "type": "updateGrant", "status": "success" },
      { "name": "Update Grant 2", "type": "updateGrant", "status": "failed" },
      { "name": "Send Email", "type": "sendEmail", "status": "skipped" }
    ],
    "updatedAt": 1764174154091
  },
  {
    "workflowId": "ccbd584b-a635-45a4-abd9-c703f19a25f5",
    "executedSteps": [
      { "name": "Update Grant 1", "type": "updateGrant", "status": "success" },
      { "name": "Update Grant 2", "type": "updateGrant", "status": "failed" },
      { "name": "Send Email", "type": "sendEmail", "status": "skipped" }
    ],
    "updatedAt": 1764174175726
  }
]
```

## Notes

Changes for production:

- Replace all in-memory data with persistent storage so the engine can survive restarts and scale horizontally.  
  A PostgresSQL database is a good fit to store workflow definitions, runs, steps, and logs.
- Move step execution into separate workers. This can be done with separate worker processes communicating via a queue.
- ADD CRUD endpoints for managing workflow definitions.
- Add support for real step implementations.
- Require authentication + authorization so only allowed users/services can trigger workflows or change definitions.
- Improve logging
- Add retry mechanism for steps
- Add timeout handling to prevent stuck executions
- The engine interface should be REST API
