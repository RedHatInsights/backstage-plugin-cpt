# Architecture

This document describes the internal architecture of the backstage-plugin-cpt project -- a
[Backstage][backstage] application with a custom frontend plugin for displaying Cluster Performance
Testing (CPT) results sourced from an [Elasticsearch][elasticsearch]/[OpenSearch][opensearch]
backend.

## System overview

The project follows the standard Backstage monorepo layout with three packages that form a
single-page application backed by a Node.js API server:

```
                       +-----------+
                       |  Browser  |
                       +-----+-----+
                             |
              +--------------+--------------+
              |                             |
        +-----v-----+               +------v------+
        |    app     |               |   backend   |
        |  (React)   |               |  (Node.js)  |
        | port 3000  |               |  port 7007  |
        +-----+------+               +------+------+
              |                             |
    +---------+---------+            +------v------+
    |  Backstage core   |            | Proxy /cpt  |
    |  plugins          |            +------+------+
    +---------+---------+                   |
              |                      +------v------+
    +---------v---------+            | Elasticsearch|
    |   CPT plugin      |            +--------------+
    +-------------------+
```

**`app`** -- The Backstage frontend. Assembles the UI from Backstage core plugins (catalog, search,
TechDocs, scaffolder, Kubernetes, notifications) and the custom CPT plugin. Routes, the sidebar
layout, and the entity page customization all live here.

**`backend`** -- The Backstage backend. Uses the [new backend system][backend-system] (`createBackend`)
and registers backend plugins declaratively. It does not contain any custom backend plugins; the CPT
data path relies entirely on the built-in [proxy backend plugin][proxy-backend].

**`plugins/cpt`** -- The custom frontend plugin. Provides a React component that queries
Elasticsearch via the backend proxy and renders CPT test-run results in a paginated table. This is
the only non-stock code in the repository.

### Dependency graph between packages

```
app  ──depends on──>  plugins/cpt   (via workspace link)
backend ──depends on──>  app         (via workspace link, serves bundled app assets)
```

The `app` package declares a workspace link to the CPT plugin
(`"@redhatinsights/backstage-plugin-cpt": "link:../../plugins/cpt"`). The `backend` package
similarly links to `app` (`"app": "link:../app"`) so the `plugin-app-backend` module can serve the
built frontend as static assets in production.

## CPT plugin architecture

### Plugin registration

The plugin is defined in `plugins/cpt/src/plugin.ts` using `createPlugin` with the id `cpt`. It
exports a single component extension, `EntityCPTContent`, which lazy-loads the `CPTComponent`:

```ts
export const EntityCPTContent = cptPlugin.provide(
  createComponentExtension({
    name: 'EntityCPTContent',
    component: {
      lazy: () =>
        import('./components/CPTComponent').then(m => m.CPTComponent),
    },
  }),
);
```

This follows Backstage's lazy-loading convention: the CPT code is only fetched when a user navigates
to an entity page that includes the CPT tab, keeping the initial bundle size small.

### Catalog entity integration

The CPT plugin activates per-entity through the `cpt-test-runs/query` annotation. The app's entity
page (`packages/app/src/components/catalog/EntityPage.tsx`) defines a predicate:

```ts
const hasCPTAnnotation = (entity: Entity) =>
  Boolean(entity?.metadata?.annotations?.['cpt-test-runs/query']);
```

This predicate gates a `defaultEntityPageWithCPT` layout that includes a `/cpt` tab. The
`EntitySwitch` component renders the CPT tab only for entities carrying the annotation, while all
other entities see the default layout without it.

The annotation value is used verbatim as the `product.keyword` term in the Elasticsearch query,
making the data source configurable per catalog entity.

### Component structure

```
plugins/cpt/src/
  plugin.ts               Plugin + extension registration
  index.ts                Public API barrel export
  common/
    QueryTestRunsData.ts   Custom React hook for data fetching
  components/
    CPTComponent/          Top-level component: loading/error/empty states
    DataTableComponent/    Paginated Material-UI table
```

**`useQueryTestRunsData`** -- A custom hook that reads the `cpt-test-runs/query` annotation from the
current catalog entity (via `useEntity`), constructs an Elasticsearch query body, and sends it to
`${backend.baseUrl}/api/proxy/cpt` using Backstage's `fetchApi`. It manages three states: `result`,
`loaded`, and `error`.

**`CPTComponent`** -- Consumes the hook and renders one of four states: loading (progress bar),
error (error message), empty results (configuration guidance), or the data table.

**`DataTableComponent`** -- Renders the Elasticsearch hits in a Material-UI table with columns for
date/time, image tag (linked), test name (linked), and pass/fail icon. Supports client-side
pagination via `TablePagination`.

### Data flow

1. A user opens a catalog entity page that carries the `cpt-test-runs/query` annotation.
2. The `EntitySwitch` in `EntityPage.tsx` matches the annotation and renders `EntityCPTContent`.
3. The lazy-loaded `CPTComponent` mounts and calls `useQueryTestRunsData`.
4. The hook reads the annotation value from the entity and POST requests to the backend proxy
   endpoint `/api/proxy/cpt`.
5. The backend proxy (configured in `app-config.yaml` under `proxy.endpoints./cpt`) forwards the
   request to the Elasticsearch URL specified by the `ELASTICSEARCH_URL` environment variable.
6. The Elasticsearch response (`hits.hits`) is stored in React state and rendered by
   `DataTableComponent`.

The proxy approach means no custom backend plugin is required -- the data path is:

```
Browser -> Backend proxy (/api/proxy/cpt) -> Elasticsearch
```

### Dynamic plugin support

The CPT plugin includes a `janus-cli` dev dependency and an `export-dynamic` script
(`janus-cli package export-dynamic-plugin`). This enables the plugin to be packaged as a
[dynamic plugin][dynamic-plugins] for [Red Hat Developer Hub][rhdh] (Janus-IDP), where plugins can
be loaded at runtime without rebuilding the entire application. The `dist-scalprum` output directory
(listed in the `files` array) contains the dynamic plugin bundle.

## Technology stack

### Frontend

| Technology | Purpose |
|---|---|
| [React 18][react] | UI framework |
| [TypeScript ~5.8][typescript] | Type-safe JavaScript |
| [Material-UI v4][mui] | Component library (Backstage standard) |
| [Backstage core-components][core-components] | Backstage UI primitives (`InfoCard`, `Sidebar`, etc.) |
| [Backstage core-plugin-api][core-plugin-api] | Plugin registration, API refs, `useApi` |
| [Backstage plugin-catalog-react][catalog-react] | Entity context (`useEntity`) |
| [react-use][react-use] | Utility hooks |

### Backend

| Technology | Purpose |
|---|---|
| [Node.js 22 or 24][nodejs] | Runtime |
| [Backstage backend-defaults][backend-defaults] | New backend system bootstrap |
| [better-sqlite3][better-sqlite3] | Local development database |
| [pg][pg] | Production PostgreSQL client |
| [Backstage proxy-backend][proxy-backend] | HTTP proxy for Elasticsearch requests |

### Tooling

| Tool | Purpose |
|---|---|
| [Yarn 4.4.1][yarn] | Package manager (node-modules linker) |
| [Backstage CLI][backstage-cli] | Build, lint, test orchestration |
| [Jest 30][jest] | Unit testing |
| [Playwright][playwright] | End-to-end testing |
| [ESLint + Prettier][eslint] | Code style enforcement |
| [Dependabot][dependabot] | Automated dependency updates |

## Build system

### Monorepo layout

The project uses [Yarn workspaces][yarn-workspaces] to manage the monorepo. The root `package.json`
declares two workspace globs:

```json
{
  "workspaces": {
    "packages": ["packages/*", "plugins/*"]
  }
}
```

This resolves to three packages: `packages/app`, `packages/backend`, and `plugins/cpt`. Yarn's
`link:` protocol handles cross-package references at development time.

### TypeScript configuration

The root `tsconfig.json` extends `@backstage/cli/config/tsconfig.json` and includes source
directories from both `packages/*/src` and `plugins/*/src`. The compiler targets `react-jsx` and
outputs type declarations to `dist-types/`.

### Build commands

| Command | Scope | Effect |
|---|---|---|
| `yarn build:all` | All packages | Full production build via `backstage-cli repo build --all` |
| `yarn build:backend` | Backend only | Builds backend bundle for Docker |
| `yarn build-image` | Backend Docker | Runs `docker build` from backend workspace |
| `yarn tsc` | All packages | Type-checks without emitting |

Individual packages can be built independently via `yarn workspace <name> build`, which invokes
`backstage-cli package build` under the hood.

## Deployment

### Docker image

The backend Dockerfile (`packages/backend/Dockerfile`) produces a production image based on
`node:24-trixie-slim`. It uses a skeleton-first strategy to optimize Docker layer caching:

1. Copy the monorepo skeleton (`skeleton.tar.gz` from `backstage-cli package build`) containing
   only `package.json` files and `yarn.lock`.
2. Run `yarn workspaces focus --all --production` to install production dependencies.
3. Copy the full backend bundle (`bundle.tar.gz`).
4. Start the backend with both `app-config.yaml` and `app-config.production.yaml`.

This approach ensures that dependency installation is cached as long as `package.json` files do not
change, even when application code is modified.

### Production database

The production configuration (`app-config.production.yaml`) switches from in-memory SQLite to
PostgreSQL, configured via environment variables (`POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`,
`POSTGRES_PASSWORD`).

### Environment variables

| Variable | Required in | Purpose |
|---|---|---|
| `GITHUB_TOKEN` | All environments | GitHub integration (catalog, scaffolder) |
| `ELASTICSEARCH_URL` | All environments | Upstream URL for the CPT proxy endpoint |
| `POSTGRES_HOST` | Production | PostgreSQL host |
| `POSTGRES_PORT` | Production | PostgreSQL port |
| `POSTGRES_USER` | Production | PostgreSQL user |
| `POSTGRES_PASSWORD` | Production | PostgreSQL password |

## Testing strategy

### Unit tests

Unit tests use [Jest][jest] with [Testing Library][testing-library] and live alongside the source
files they test (co-located `*.test.tsx` / `*.test.ts` files). The CPT plugin has three test suites:

- **`plugin.test.ts`** -- Verifies the plugin object exports correctly.
- **`CPTComponent.test.tsx`** -- Tests loading, error, and empty-result states using a mocked
  `useQueryTestRunsData` hook.
- **`DataTableComponent.test.tsx`** -- Tests table rendering, date formatting, pass/fail icons,
  pagination, and rows-per-page selection.

Tests mock the data-fetching hook rather than the network layer, keeping tests fast and focused on
component behavior.

### End-to-end tests

Playwright is configured (`playwright.config.ts`) to start both the app (port 3000) and backend
(port 7007) dev servers before running tests. In CI, the servers are expected to be running
already. Test projects are auto-discovered via `generateProjects()` from
`@backstage/e2e-test-utils`.

### CI pipeline

The GitHub Actions workflow (`.github/workflows/test.yml`) runs on every pull request. It checks out
the code, installs dependencies with `yarn install --immutable`, and runs the CPT plugin's test
suite via `yarn workspace @redhatinsights/backstage-plugin-cpt test`.

## Architectural constraints

1. **Material-UI v4 lock-in.** Backstage currently standardizes on Material-UI v4. The CPT plugin
   must use MUI v4 APIs (`@material-ui/core`) rather than MUI v5+ until Backstage completes its
   migration.

2. **Proxy-only data access.** The CPT plugin has no dedicated backend plugin. All Elasticsearch
   communication goes through the generic Backstage proxy. This simplifies the architecture but
   means there is no server-side validation, transformation, or caching of Elasticsearch responses.

3. **Annotation-driven activation.** The plugin is invisible to entities without the
   `cpt-test-runs/query` annotation. Adding the plugin to new entity types requires updating the
   `EntitySwitch` cases in `EntityPage.tsx`.

4. **React peer dependency range.** The CPT plugin declares `react` as a peer dependency supporting
   React 16, 17, and 18. This broad range enables compatibility with older Backstage installations
   but may need narrowing as React 19 adoption progresses.

<!-- Link references -->
[backstage]: https://backstage.io
[elasticsearch]: https://www.elastic.co/elasticsearch
[opensearch]: https://opensearch.org
[backend-system]: https://backstage.io/docs/backend-system/
[proxy-backend]: https://backstage.io/docs/plugins/proxying
[dynamic-plugins]: https://github.com/janus-idp/backstage-showcase/blob/main/showcase-docs/dynamic-plugins.md
[rhdh]: https://developers.redhat.com/rhdh/overview
[react]: https://react.dev
[typescript]: https://www.typescriptlang.org
[mui]: https://v4.mui.com
[core-components]: https://backstage.io/docs/reference/core-components
[core-plugin-api]: https://backstage.io/docs/reference/core-plugin-api
[catalog-react]: https://backstage.io/docs/reference/plugin-catalog-react
[react-use]: https://github.com/streamich/react-use
[nodejs]: https://nodejs.org
[backend-defaults]: https://backstage.io/docs/reference/backend-defaults
[better-sqlite3]: https://github.com/WiseLibs/better-sqlite3
[pg]: https://node-postgres.com
[yarn]: https://yarnpkg.com
[yarn-workspaces]: https://yarnpkg.com/features/workspaces
[backstage-cli]: https://backstage.io/docs/tooling/cli/overview
[jest]: https://jestjs.io
[playwright]: https://playwright.dev
[eslint]: https://eslint.org
[dependabot]: https://docs.github.com/en/code-security/dependabot
[testing-library]: https://testing-library.com
