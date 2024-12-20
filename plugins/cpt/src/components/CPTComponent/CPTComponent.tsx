import React from 'react';
import {
    InfoCard,
} from '@backstage/core-components';
import {
  Typography,
} from '@material-ui/core';
import LinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles } from '@material-ui/core/styles';

import { DataTableComponent } from '../DataTableComponent/DataTableComponent';
import { queryTestRunsData } from '../../common/QueryTestRunsData';

export const CPTComponent = () => {
  const {
    result: TestRunsResult,
    loaded: TestRunsLoaded,
    error: TestRunsError,
  } = queryTestRunsData();

  console.log(TestRunsResult);

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
      <InfoCard>
        <Typography align="center" variant="body1">
          Error retrieving data from OpenSearch.
        </Typography>
      </InfoCard>
    );
  }

  if (!TestRunsLoaded) {
    return (
      <InfoCard className={classes.root} title="test" >
        <LinearProgress />
      </InfoCard>
    );
  }

  return (
    <InfoCard >
        <DataTableComponent data={TestRunsResult} />
    </InfoCard>
  )
}
