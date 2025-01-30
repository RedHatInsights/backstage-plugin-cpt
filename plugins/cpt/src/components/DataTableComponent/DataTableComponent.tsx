import React from 'react';
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Link,
} from '@material-ui/core';
import { Close, CheckCircle } from '@material-ui/icons';

export const DataTableComponent = (data: any) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(page);
  };

  const formatISODateTime = (isoDateString: any) => {
    const date = new Date(isoDateString);

    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();

    return `${formattedDate} @ ${formattedTime}`;
  };

  const ResultIcon = (params: any) => {
    if (params.result == 'FAIL') {
      return <Close data-testid="CloseIcon" style={{ color: 'red' }} />;
    }
    return <CheckCircle data-testid="CheckCircleIcon" style={{ color: 'green' }} />;
  };

  const RowHead = () => {
    return (
      <TableHead>
        <TableRow>
          <TableCell align="center">
            <Typography variant="button">Date/Time</Typography>
          </TableCell>
          <TableCell align="center">
            <Typography variant="button">Image Tag</Typography>
          </TableCell>
          <TableCell align="center">
            <Typography variant="button">Test Name</Typography>
          </TableCell>
          <TableCell align="center">
            <Typography variant="button">Result</Typography>
          </TableCell>
        </TableRow>
      </TableHead>
    );
  };

  const RowBody = ({ result }: { result: any }) => {
    return (
      <TableRow>
        <TableCell align="center">
          {formatISODateTime(result._source.date)}
        </TableCell>
        <TableCell align="center">
          <Link href={`https://${result._source.version}`} target="_blank">
            {result._source.version}
          </Link>
        </TableCell>
        <TableCell align="center">
          <Link href={result._source.link} target="_blank">
            {result._source.test}
          </Link>
        </TableCell>
        <TableCell align="center">
          <ResultIcon result={result._source.result} />
        </TableCell>
      </TableRow>
    );
  };

  const ShowTable = () => {
    return (
      <Table aria-label="simple table">
        <RowHead />
        <TableBody>
          {(data.data.length > 0
            ? data.data.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage,
              )
            : data.data
          ).map((deployment, index) => (
            <RowBody result={deployment} key={index} />
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Grid container spacing={3} direction="column">
      <TableContainer>
        <ShowTable />
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Grid>
  );
};
