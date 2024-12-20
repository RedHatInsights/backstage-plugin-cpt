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
    return (
      <TableRow>
        <TableCell style={{ width: '8%' }} align="center">
          {result._date}
        </TableCell>
        <TableCell align="center">
          {result.version}
        </TableCell>
        <TableCell align="center">
          {result.test}
        </TableCell>
        <TableCell style={{ width: '10%' }} align="center">
          {result.result}
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
              ? data.slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage,
                )
              : data
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
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Grid>    
  )
}
