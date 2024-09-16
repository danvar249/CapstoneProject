import React, { useState } from 'react';
import { Typography, Paper, TextField, Button, Autocomplete, Box } from '@mui/material';

const mockCustomers = [
  { id: 1, name: 'John Doe', number: '+1234567890', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', number: '+0987654321', email: 'jane@example.com' },
  { id: 3, name: 'Alice Brown', number: '+1122334455', email: 'alice@example.com' },
  { id: 4, name: 'Bob Johnson', number: '+2233445566', email: 'bob@example.com' },
  { id: 5, name: 'Charlie Green', number: '+3344556677', email: 'charlie@example.com' },
  // Add more customers as needed...
];

function CustomerManagement() {
  const [customers, setCustomers] = useState(mockCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedNumber, setEditedNumber] = useState('');
  const [editedEmail, setEditedEmail] = useState('');

  const handleCustomerSelection = (event, value) => {
    setSelectedCustomer(value);
    if (value) {
      setEditedName(value.name);
      setEditedNumber(value.number);
      setEditedEmail(value.email);
    } else {
      setEditedName('');
      setEditedNumber('');
      setEditedEmail('');
    }
  };

  const handleSaveChanges = () => {
    if (selectedCustomer) {
      const updatedCustomers = customers.map((customer) =>
        customer.id === selectedCustomer.id
          ? { ...customer, name: editedName, number: editedNumber, email: editedEmail }
          : customer
      );
      setCustomers(updatedCustomers);
      alert('Customer details updated successfully!');
    }
  };

  const handleAddCustomer = () => {
    const newCustomer = {
      id: customers.length + 1,
      name: editedName,
      number: editedNumber,
      email: editedEmail,
    };
    setCustomers([...customers, newCustomer]);
    setSelectedCustomer(newCustomer);
    alert('New customer added successfully!');
  };

  const handleDeleteCustomer = () => {
    if (selectedCustomer) {
      const updatedCustomers = customers.filter(customer => customer.id !== selectedCustomer.id);
      setCustomers(updatedCustomers);
      setSelectedCustomer(null);
      setEditedName('');
      setEditedNumber('');
      setEditedEmail('');
      alert('Customer deleted successfully!');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Box sx={{ width: '100%', maxWidth: '600px' }}>
        <Typography variant="h4" gutterBottom>Customer Management</Typography>
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography variant="h6" gutterBottom>Search and Select Customer</Typography>
          <Autocomplete
            options={customers}
            getOptionLabel={(option) => `${option.name} (${option.number})`}
            value={selectedCustomer}
            onChange={handleCustomerSelection}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Search Customer"
                placeholder="Select customer"
              />
            )}
          />
        </Paper>
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography variant="h6" gutterBottom>{selectedCustomer ? 'Edit Customer Details' : 'Add New Customer'}</Typography>
          <TextField
            label="Name"
            fullWidth
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Phone Number"
            fullWidth
            value={editedNumber}
            onChange={(e) => setEditedNumber(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Email"
            fullWidth
            value={editedEmail}
            onChange={(e) => setEditedEmail(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={selectedCustomer ? handleSaveChanges : handleAddCustomer}
              sx={{ marginRight: 2 }}
            >
              {selectedCustomer ? 'Save Changes' : 'Add Customer'}
            </Button>
            {selectedCustomer && (
              <Button variant="outlined" color="secondary" onClick={handleDeleteCustomer}>
                Delete Customer
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default CustomerManagement;
