import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import CustomerDataTable from '../components/CustomerDataTable';

const data = [
  { name: 'Jan', customers: 30 },
  { name: 'Feb', customers: 20 },
  { name: 'Mar', customers: 27 },
  { name: 'Apr', customers: 18 },
  { name: 'May', customers: 23 },
  { name: 'Jun', customers: 34 },
];

function CustomerInsights() {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>Customer Insights</Typography>
      <Typography variant="body1" gutterBottom>
        Below is the data of customers that you can use to gain insights and make informed decisions.
      </Typography>

      {/* Customer Insights Graph */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Customer Growth Over the Months</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <Line type="monotone" dataKey="customers" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Customer Data Table */}
      <Box sx={{ mt: 2 }}>
        <CustomerDataTable />
      </Box>
    </Container>
  );
}

export default CustomerInsights;
