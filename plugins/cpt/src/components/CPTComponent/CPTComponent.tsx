import React from 'react';
import {
    InfoCard,
} from '@backstage/core-components';
import {
  Typography,
  Box
} from '@material-ui/core';
import LinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles } from '@material-ui/core/styles';

import { DataTableComponent } from '../DataTableComponent/DataTableComponent';
import { queryTestRunsData } from '../../common/QueryTestRunsData';

export const CPTComponent = () => {
  const title = "CPT Test Runs";
  const subheader = "Performance testing results";

  const {
    result: TestRunsResult,
    loaded: TestRunsLoaded,
    error: TestRunsError,
  } = queryTestRunsData();

  // styles for linear progress bar
  const useStyles = makeStyles(theme => ({
    root: {
      width: '100%',
      '& > * + *': {
        marginTop: theme.spacing(2),
      },
    },
  }));

  const classes = useStyles();

  if (TestRunsError) {
    return (
      <InfoCard title={title} subheader={subheader}>
        <Typography align="center" variant="body1">
          Error retrieving data from OpenSearch.
        </Typography>
      </InfoCard>
    );
  }

  if (!TestRunsLoaded) {
    return (
      <InfoCard title={title} subheader={subheader}>
        <LinearProgress />
      </InfoCard>
    );
  }

  // If this is empty, populate new info card
  // so you can copy the logic from above
  if (TestRunsResult?.length === 0) {
    return (
      <InfoCard title={title} subheader={subheader}>
        <Typography variant="h5" component="h2" align="center">
          No results found for your query.
        </Typography>
        <Typography variant="subtitle1" align="center">
          To configure this component to display data from ElasticSearch, add the annotation: <Box component="pre" sx={{ display: 'inline' }}>cpt-test-runs/query</Box>
        </Typography>
      </InfoCard>
    );
  }

  return (
    <InfoCard title={title} subheader={subheader}>
        <DataTableComponent data={TestRunsResult} />
    </InfoCard>
  )
}
