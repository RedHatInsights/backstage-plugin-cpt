import { useState, useEffect } from 'react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

export const queryTestRunsData = () => {
    const [result, setResult] = useState([]);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    // Get Backstage objects
    const config = useApi(configApiRef);
    const backendUrl = config.getString('backend.baseUrl');

    const { entity } = useEntity();

    const getQueryValue = () => {
        // Configured through the entity provider
        return entity?.metadata?.annotations?.["cpt-test-runs/query"]
    }

    const getTestRunsData = async() => {
        const query = getQueryValue();
        console.log(query);

        const body = {
            "query":{
                "term":{
                    "product.keyword":{
                        "value":`${query}`
                    }
                }
            }
        }

        await fetch(`${backendUrl}/api/proxy/cpt-test-runs`, {
            body: body,
        })
        .then(response => response.json())
        .then(resp => {
            setLoaded(true)
            setResult(resp.hits.hits)
        })
        .catch((_error) => {
            setError(true)
            console.error(`Error fetching CPT test runs data`);
        })
    }

    useEffect(() => {
        getTestRunsData()

    }, [backendUrl]);

    return { result, loaded, error }
}