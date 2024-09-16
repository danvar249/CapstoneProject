import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatIcon from '@mui/icons-material/Chat';

function CustomerMessagesTable({ messages, onDelete, onReply }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Number</TableCell>
            <TableCell>Message</TableCell>
            <TableCell>Tag</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {messages.map((msg) => (
            <TableRow key={msg.id}>
              <TableCell>{msg.name}</TableCell>
              <TableCell>{msg.number}</TableCell>
              <TableCell>{msg.text}</TableCell>
              <TableCell>{msg.tag}</TableCell>
              <TableCell>{msg.status}</TableCell>
              <TableCell>{msg.date}</TableCell>
              <TableCell>
                <IconButton onClick={() => onReply(msg.chatId)} color="primary">
                  <ChatIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(msg.id)} color="secondary">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default CustomerMessagesTable;
