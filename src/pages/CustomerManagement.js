import React from 'react';
import { Typography, Paper, List, ListItem, ListItemText, Button } from '@mui/material';

const mockCustomers = [
  { id: 1, name: 'John Doe', number: '+1234567890', tags: ['smartphone', 'order'] },
  { id: 2, name: 'Jane Smith', number: '+0987654321', tags: ['promotion', 'accessories'] },
];

function CustomerManagement() {
  return (
    <div>
      <Typography variant="h4" gutterBottom>Customer Management</Typography>
      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>Customer List</Typography>
        <List>
          {mockCustomers.map((customer) => (
            <ListItem key={customer.id}>
              <ListItemText primary={customer.name} secondary={customer.number} />
              <Typography variant="body2">Tags: {customer.tags.join(', ')}</Typography>
            </ListItem>
          ))}
        </List>
      </Paper>
      <Paper sx={{ padding: 3 }}>
        <Typography variant="h6" gutterBottom>Add New Customer</Typography>
        <Button variant="contained" color="primary">
          Add Customer
        </Button>
      </Paper>
    </div>
  );
}

export default CustomerManagement;
