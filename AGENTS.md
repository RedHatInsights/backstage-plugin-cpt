# Backstage CPT Plugin

## Project Overview

The Backstage CPT Plugin is a custom frontend plugin for Backstage that displays test results from the CPT (Continuous Performance Testing) system. It queries test run data from Elasticsearch and renders filterable tables within Backstage catalog entity pages. The plugin is distributed as part of a Backstage monorepo containing a reference application, backend, and the plugin itself.

## Dependencies

**Runtime:**

- React, Material-UI v4 (Backstage components)
- Backstage core libraries (`@backstage/core-*`, `@backstage/plugin-catalog-react`)
- Backend: Node 22|24, PostgreSQL (production), SQLite (development)

**Development/Test:**

- TypeScript
- Jest, Playwright
- Yarn (workspaces)
- Backstage CLI
- ESLint, Prettier (via `@backstage/cli/config`)

## Development Commands

- Install: `yarn install --immutable`
- Start dev server: `yarn dev` (app on :3000, backend on :7007)
- Test all packages: `yarn test:all`
- Test plugin only: `yarn workspace @redhatinsights/backstage-plugin-cpt test`
- E2E tests: `yarn test:e2e`
- Lint changed files: `yarn lint`
- Lint all files: `yarn lint:all`
- Format check: `yarn prettier:check`
- Type check: `yarn tsc`
- Build all packages: `yarn build:all`
- Build backend for Docker: `yarn build:backend`
- Build Docker image: `yarn workspace backend build-image`

The CI pipeline (`.github/workflows/test.yml`) runs `yarn workspace @redhatinsights/backstage-plugin-cpt test` on pull requests.

**Note:** lint-staged is configured in `package.json` but pre-commit hooks are not activated (no `.husky/` directory). Run `yarn lint` manually before committing.

## Architecture

The repository is a Backstage monorepo with three packages: `app` (frontend), `backend` (Node.js API), and `plugins/cpt` (custom plugin). The CPT plugin queries Elasticsearch via the backend proxy (no custom backend plugin). Data flows from browser → backend proxy → Elasticsearch. The plugin is activated on catalog entities annotated with `cpt-test-runs/query`. For detailed architecture, see [ARCHITECTURE.md][architecture-ref].

## Code Style

- **Linter:** ESLint (root `.eslintrc.js` with minimal config)
- **Formatter:** Prettier (configured via `@backstage/cli/config/prettier` defaults; see `.prettierignore` for excluded paths)
- **TypeScript**
- **Pre-commit:** lint-staged configured in `package.json` (ESLint + Prettier on staged files) but hooks not activated
- Use reference-style links in Markdown: `[text][ref-id]` format only

## Common Mistakes

1. **Material-UI version mismatch.** Backstage is locked to Material-UI v4. Using v5 imports (e.g., `@mui/material`) will fail. Always use `@material-ui/core` v4.
2. **Incorrect workspace commands.** Running `yarn test` at the root runs all packages. To run plugin tests only, use `yarn workspace @redhatinsights/backstage-plugin-cpt test`.
3. **Missing proxy configuration.** The CPT plugin relies on backend proxy routes configured in `app-config.yaml` under `proxy.endpoints./cpt`. Direct Elasticsearch access from the frontend will fail. All data fetching must go through the configured proxy.
4. **React peer dependency range.** The plugin's `package.json` declares `react` peer dependency as `^16.13.1 || ^17.0.0 || ^18.0.0` for Backstage compatibility across versions. The app itself uses React 18. Do not assume React 18-specific APIs are available in plugin code without checking peer ranges.
5. **Lint-staged without hooks.** The repository has lint-staged configured but no `.husky/` directory. Pre-commit hooks are not active. Run `yarn lint` manually before committing.

## Testing

- **Unit/integration:** Jest. Run `yarn test:all` for all packages or `yarn workspace @redhatinsights/backstage-plugin-cpt test` for plugin only.
- **E2E:** Playwright. Run `yarn test:e2e`.
- **Coverage:** `yarn test:all` includes coverage reporting.
- Test files use `.test.ts` or `.test.tsx` extensions.

## Deployment

The backend is containerized using `packages/backend/Dockerfile` with a skeleton-first Docker build strategy. The production backend requires PostgreSQL (development uses SQLite). Key environment variables: `ELASTICSEARCH_URL`, `GITHUB_TOKEN`, `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`. Build the Docker image with `yarn workspace backend build-image`.

[architecture-ref]: ARCHITECTURE.md
