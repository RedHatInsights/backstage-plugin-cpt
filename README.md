# CPT Backstage Plugin

A [Backstage][backstage-url] frontend plugin that integrates the CPT (Continuous Performance Testing) system into your Backstage catalog, enabling teams to view and track test run data directly from component pages.

## Overview

This repository is a Backstage monorepo containing:

- **app** — The Backstage frontend application
- **backend** — The Backstage backend service
- **plugins/cpt** — A custom plugin (`@redhatinsights/backstage-plugin-cpt`) that queries Elasticsearch for CPT test run data and displays results in the catalog

The CPT plugin allows component owners to annotate catalog entities with test bucket queries, surfacing test results and quality metrics without leaving Backstage.

## Prerequisites

- **Node.js** 22 or 24
- **Yarn** (Corepack-managed; version is pinned in `package.json`)
- **Environment variables:**
  - `ELASTICSEARCH_URL` — The Elasticsearch endpoint for CPT test run data

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd backstage-plugin-cpt
   ```

2. **Install dependencies:**

   ```bash
   yarn install
   ```

3. **Configure Elasticsearch:**

   Export the Elasticsearch URL for the CPT results dashboard:

   ```bash
   export ELASTICSEARCH_URL="http://elastic.mycompany.com/results-dashboard-data/_doc/_search"
   ```

4. **Set up the catalog:**

   Migrate the example catalog to the default location:

   ```bash
   cp -r catalog_example catalog
   ```

## Usage

### Adding CPT Test Data to Catalog Entities

To display CPT test runs for a component, add the `cpt-test-runs/query` annotation to the component's catalog entity YAML:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-component
  annotations:
    cpt-test-runs/query: "Inventory Export"
spec:
  type: service
  lifecycle: production
  owner: team-a
```

The annotation value is the query string used to filter test runs from the CPT Elasticsearch index. Test results will appear on the component's page in the Backstage UI.

## Development

### Running Locally

Start the development server with hot reload:

```bash
yarn dev
```

This starts both the frontend app and backend service. The frontend is available at `http://localhost:3000`.

### Testing

Run unit tests for all packages:

```bash
yarn test
```

Run tests with coverage:

```bash
yarn test:all
```

Run end-to-end tests with Playwright:

```bash
yarn test:e2e
```

Test only the CPT plugin:

```bash
yarn workspace @redhatinsights/backstage-plugin-cpt test
```

### Linting and Formatting

Lint changed files:

```bash
yarn lint
```

Lint all files:

```bash
yarn lint:all
```

Check formatting:

```bash
yarn prettier:check
```

Run type checking:

```bash
yarn tsc
```

### Building

Build all packages:

```bash
yarn build:all
```

Build the backend for Docker deployment:

```bash
yarn build:backend
```

Alternatively, use the build script:

```bash
./build
```

### Docker Deployment

The backend can be containerized for production deployment. After building the backend package, use the Dockerfile in the repository root to create an image:

```bash
yarn build:backend
docker build -t backstage-cpt-backend .
docker run -p 7007:7007 -e ELASTICSEARCH_URL="<your-es-url>" backstage-cpt-backend
```

## Architecture

For detailed information about the system architecture, package structure, and plugin implementation, see [ARCHITECTURE.md][architecture-doc].

## Contributing

Contributions are welcome. Please see [CONTRIBUTING.md][contributing-doc] for guidelines on submitting pull requests, coding standards, and development workflow.

## License

This project is licensed under the Apache License 2.0. See the LICENSE file for details.

[backstage-url]: https://backstage.io
[architecture-doc]: ARCHITECTURE.md
[contributing-doc]: CONTRIBUTING.md
