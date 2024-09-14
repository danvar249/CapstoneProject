import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button } from '@mui/material';

const ChatWindow = ({ messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  return (
    <div>
      {/* Messages Display */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: 2, backgroundColor: '#e5ddd5' }}>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 2,
            }}
          >
            <Paper
              sx={{
                padding: 1,
                maxWidth: '60%',
                backgroundColor: message.sender === 'user' ? '#DCF8C6' : '#FFF',
                borderRadius: 2,
              }}
            >
              <Typography variant="body1">{message.content}</Typography>
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', marginTop: 1 }}>
                {message.time}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Box>

      {/* Message Input */}
      <Box sx={{ display: 'flex', padding: 2, backgroundColor: '#FFF', borderTop: '1px solid #ddd' }}>
        <TextField
          variant="outlined"
          placeholder="Type a message"
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          sx={{ marginRight: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage}>
          Send
        </Button>
      </Box>
    </div>
  );
};

export default ChatWindow;
