import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@material-ui/core';

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
}

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
            <Typography variant="button">Test</Typography>
          </TableCell>
          <TableCell align="center">
            <Typography variant="button">Result</Typography>
          </TableCell>
        </TableRow>
      </TableHead>
    );
  };

  const RowBody = ({ result }: { result: any }) => {
    console.log(result)
    return (
      <TableRow>
        <TableCell align="center">
          {formatISODateTime(result._source.date)}
        </TableCell>
        <TableCell align="center">
          {result._source.version}
        </TableCell>
        <TableCell align="center">
          {result._source.test}
        </TableCell>
        <TableCell align="center">
          {result._source.result}
        </TableCell>
      </TableRow>
    );
  };

  const ShowTable = () => {
    console.log(data)
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
              <RowBody result={deployment} key={index}/>
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
  )
}
