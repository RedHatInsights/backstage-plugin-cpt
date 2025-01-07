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

        await fetch(`${backendUrl}/api/proxy/cpt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "query":{
                    "term":{
                        "product.keyword":{
                            "value":`${query}`
                        }
                    }
                },
                "sort": [
                    {
                      "date": {
                        "order": "desc"
                      }
                    }
                ],
                "size": 50,
                "from": 0
            }),
        })
        .then(response => response.json())
        .then(resp => {
            console.log(resp)
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