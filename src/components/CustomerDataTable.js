import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';

const CustomerDataTable = () => {
  // Sample data for the table
  const customers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      status: "Active",
      lastContacted: "2024-09-01",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+0987654321",
      status: "Inactive",
      lastContacted: "2024-08-15",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      phone: "+1122334455",
      status: "Active",
      lastContacted: "2024-09-05",
    },
    // Add more customer data here
  ];

  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" gutterBottom align="center" sx={{ marginTop: 2 }}>
        Customer Data
      </Typography>
      <Table aria-label="customer data table">
        <TableHead>
          <TableRow>
            <TableCell align="center">ID</TableCell>
            <TableCell align="center">Name</TableCell>
            <TableCell align="center">Email</TableCell>
            <TableCell align="center">Phone</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="center">Last Contacted</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell align="center">{customer.id}</TableCell>
              <TableCell align="center">{customer.name}</TableCell>
              <TableCell align="center">{customer.email}</TableCell>
              <TableCell align="center">{customer.phone}</TableCell>
              <TableCell align="center">{customer.status}</TableCell>
              <TableCell align="center">{customer.lastContacted}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomerDataTable;
