import React from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

function Messages() {
  const messages = [
    { id: 1, content: "Hello, I need help!", number: "+1234567890", tags: "Help", time: "10:00 AM", status: "Unread" },
    { id: 2, content: "Can I get more info?", number: "+0987654321", tags: "Info", time: "10:30 AM", status: "Read" },
    // Add more messages here
  ];

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Messages</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Message</TableCell>
              <TableCell>Number</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message.id}>
                <TableCell>{message.content}</TableCell>
                <TableCell>{message.number}</TableCell>
                <TableCell>{message.tags}</TableCell>
                <TableCell>{message.time}</TableCell>
                <TableCell>{message.status}</TableCell>
                <TableCell>
                  {/* Add buttons for reply, delete, etc. */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default Messages;
