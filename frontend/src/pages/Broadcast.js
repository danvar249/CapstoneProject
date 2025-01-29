import React, { useState } from 'react';
import { Typography, TextField, Button, Box, Autocomplete } from '@mui/material';

const mockCustomers = [
  { id: 1, name: 'John Doe', tags: ['electronics', 'promo'] },
  { id: 2, name: 'Jane Smith', tags: ['accessories'] },
  { id: 3, name: 'Bob Johnson', tags: ['laptop', 'computers'] },
  { id: 4, name: 'Alice Brown', tags: ['promo', 'computers'] },
];

const mockTags = ['promo', 'electronics', 'laptop', 'computers', 'accessories', 'audio'];

function BroadcastMessages() {
  const [selectedTags, setSelectedTags] = useState([]); // Tags selected
  const [filteredCustomers, setFilteredCustomers] = useState([]); // Filtered customers based on tags
  const [selectedCustomers, setSelectedCustomers] = useState([]); // Selected customers to send broadcast
  const [message, setMessage] = useState('');

  const handleTagChange = (event, newValue) => {
    setSelectedTags(newValue);

    // Automatically filter customers based on selected tags
    const filtered = mockCustomers.filter(customer =>
      newValue.some(tag => customer.tags.includes(tag))
    );
    setFilteredCustomers(filtered);
    setSelectedCustomers(filtered); // Automatically select customers matching tags
  };

  const handleSendBroadcast = () => {
    if (selectedCustomers.length > 0) {
      alert(`Broadcast message sent to: ${selectedCustomers.map(c => c.name).join(', ')}`);
    } else {
      alert('No customers selected.');
    }

    // Clear the form after sending
    setMessage('');
    setSelectedTags([]);
    setSelectedCustomers([]);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      <Box sx={{ width: '100%', maxWidth: '800px' }}>
        <Typography variant="h4" gutterBottom>Send Broadcast Message</Typography>
        
        {/* Message Input */}
        <TextField
          label="Message"
          multiline
          rows={4}
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{ marginBottom: 3 }}
        />

        {/* Tag Selection */}
        <Autocomplete
          multiple
          options={mockTags}
          value={selectedTags}
          onChange={handleTagChange}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Select Tags"
              placeholder="Choose tags"
            />
          )}
          sx={{ marginBottom: 3 }}
        />

        {/* Customer Selection based on filtered tags */}
        <Autocomplete
          multiple
          options={filteredCustomers.map(customer => customer.name)} // List of customers filtered by tags
          value={selectedCustomers.map(customer => customer.name)} // Show currently selected customers
          onChange={(event, newValue) => {
            const updatedCustomers = mockCustomers.filter(customer => newValue.includes(customer.name));
            setSelectedCustomers(updatedCustomers);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Select Customers"
              placeholder="Select customers"
            />
          )}
          sx={{ marginBottom: 3 }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSendBroadcast}
          disabled={!message || selectedCustomers.length === 0}
        >
          Send Broadcast
        </Button>
      </Box>
    </Box>
  );
}

export default BroadcastMessages;
