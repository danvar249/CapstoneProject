import React, { useState } from 'react';
import { Typography, Paper, TextField, Button, List, ListItem, Checkbox, Autocomplete, Box } from '@mui/material';

const mockCustomers = [
  { id: 1, name: 'John Doe', number: '+1234567890' },
  { id: 2, name: 'Jane Smith', number: '+0987654321' },
  { id: 3, name: 'Alice Brown', number: '+1122334455' },
  // Add more customers as needed...
];

const mockBroadcasts = [
  { id: 1, message: 'Check out our latest promotions!', date: '2024-09-10' },
  { id: 2, message: 'Exclusive offer for our loyal customers!', date: '2024-09-12' },
];

function Broadcast() {
  const [broadcasts, setBroadcasts] = useState(mockBroadcasts);
  const [newMessage, setNewMessage] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  const handleSendBroadcast = () => {
    const selectedCustomerNames = selectedCustomers.map(customer => customer.name).join(', ');

    const newBroadcast = {
      id: broadcasts.length + 1,
      message: `${newMessage} (Sent to: ${selectedCustomerNames})`,
      date: new Date().toISOString().split('T')[0],
    };
    setBroadcasts([...broadcasts, newBroadcast]);
    setNewMessage('');
    setSelectedCustomers([]);
  };

  const handleCustomerSelection = (event, value) => {
    setSelectedCustomers(value);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Box sx={{ width: '100%', maxWidth: '800px' }}>
        <Typography variant="h4" gutterBottom>Broadcast Messages</Typography>
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography variant="h6" gutterBottom>Sent Broadcasts</Typography>
          <List>
            {broadcasts.map((broadcast) => (
              <ListItem key={broadcast.id}>
                <div>
                  <Typography variant="body1">{broadcast.message}</Typography>
                  <Typography variant="caption" color="textSecondary">Sent on: {broadcast.date}</Typography>
                </div>
              </ListItem>
            ))}
          </List>
        </Paper>
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography variant="h6" gutterBottom>Select Customers</Typography>
          <Autocomplete
            multiple
            options={mockCustomers}
            getOptionLabel={(option) => `${option.name} (${option.number})`}
            value={selectedCustomers}
            onChange={handleCustomerSelection}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Search and Select Customers"
                placeholder="Select customers"
              />
            )}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  checked={selected}
                  style={{ marginRight: 8 }}
                />
                {`${option.name} (${option.number})`}
              </li>
            )}
          />
        </Paper>
        <Paper sx={{ padding: 3 }}>
          <Typography variant="h6" gutterBottom>New Broadcast</Typography>
          <TextField
            label="Broadcast Message"
            fullWidth
            multiline
            rows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleSendBroadcast}>
            Send Broadcast
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}

export default Broadcast;
