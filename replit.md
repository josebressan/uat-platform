# UATSync — Enterprise Test Management & UAT Platform

## Overview

Full enterprise Application Lifecycle Management (ALM) platform for Test Management and UAT. Serves PMO, QA Leads, Business Analysts, Product Owners, and Testers. Centralizes test cycle planning, test case management, test execution, defect tracking, and UAT sign-off workflows.

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 19 + Vite, Tailwind CSS, Recharts, Framer Motion, Wouter, React Query
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle for API server), Vite (frontend)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080, path /api)
│   └── uat-platform/       # React+Vite frontend (root path /)
├── lib/
│   ├── api-spec/           # OpenAPI 3.1 spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

9 schema files in `lib/db/src/schema/`:
- **users** — User accounts with roles (PMO, QA_Lead, BA, PO, Tester, Admin)
- **releases** — Software releases with lifecycle status
- **testCycles** — Test phases (SIT, UAT, Regression) within releases
- **testPlans** — Test plans linking cycles to scope
- **testScenarios** — Business scenarios grouping test cases
- **testCases + testSteps** — Detailed test cases with step-by-step instructions
- **testExecutions + executionSteps** — Execution records with step-level results
- **defects + defectComments** — Bug tracking with threaded comments
- **approvals** — UAT sign-off approval workflow

## API Routes

All routes mounted under `/api`:
- `/api/users` — User CRUD
- `/api/releases` — Release management
- `/api/test-cycles` — Test cycle management
- `/api/test-plans` — Test plan management
- `/api/test-cases` — Test cases + scenarios
- `/api/test-executions` — Execution management with step updates
- `/api/defects` — Defect tracking with comments
- `/api/approvals` — UAT sign-off workflow
- `/api/dashboard` — Dashboard KPIs and reports
- `/api/seed` — Dev-only database seeder (POST)

## Frontend Pages

- **Dashboard** — KPI cards, execution trend chart, defect severity breakdown
- **Releases** — List + detail views with status badges
- **Test Cycles** — SIT/UAT/Regression cycles with timeline
- **Test Plans** — Planning interface
- **Test Case Library** — Full test case repository with filtering
- **My Executions** — Assigned executions list
- **Execution Workspace** — Step-by-step test execution with Pass/Fail/Block
- **Defects Board** — Kanban board by status
- **Approvals** — UAT sign-off review with Approve/Reject/Conditional
- **Reports** — Placeholder
- **Settings** — Placeholder

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only `.d.ts` files during typecheck; JS bundling by esbuild/vite

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes in `src/routes/` use `@workspace/api-zod` for validation and `@workspace/db` for persistence.

### `artifacts/uat-platform` (`@workspace/uat-platform`)

React+Vite frontend application. Uses generated React Query hooks from `@workspace/api-client-react`. Dark theme with professional styling.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. In development: `pnpm --filter @workspace/db run push`.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec and Orval config. Codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from OpenAPI spec.

### `scripts` (`@workspace/scripts`)

Utility scripts. Run via `pnpm --filter @workspace/scripts run <script>`.
