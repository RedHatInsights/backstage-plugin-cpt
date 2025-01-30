# CPT Plugin

## Configure
```
export ELASTICSEARCH_URL="http://elastic.mycompany.com/results-dashboard-data/_doc/_search"
```

## Develop
```
yarn dev
```

## Catalog
Add the following annotation to a Component entity with the correct mapping to a CPT test bucket:

```
cpt-test-runs/query: "Inventory Export"
```

## Test
```
yarn workspace @redhatinsights/backstage-plugin-cpt test
```

## Build
```
./build
```
