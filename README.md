# CPT Plugin

## Configure
```
export ELASTICSEARCH_URL="http://elastic.mycompany.com/results-dashboard-data/_doc/_search"
```

## Catalog

Migrate the `catalog_example` directory to the default `category` directory.
```
cp -r catalog_example catalog
```

Add the following annotation to a Component entity with the correct mapping to a CPT test bucket:

```
cpt-test-runs/query: "Inventory Export"
```

## Local Development 
```
yarn dev
```

## Test
```
yarn workspace @redhatinsights/backstage-plugin-cpt test
```

## Build
```
./build
```
