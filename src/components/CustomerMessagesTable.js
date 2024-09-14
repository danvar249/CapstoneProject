import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const CustomerMessagesTable = ({ messages, onDelete, onReply }) => {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="customer messages table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Message</TableCell>
            <TableCell align="center">Number</TableCell>
            <TableCell align="center">Name</TableCell>
            <TableCell align="center">Tag/Category</TableCell>
            <TableCell align="center">Reply</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="center">Date</TableCell>
            <TableCell align="center">Delete</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {messages.map((msg) => (
            <TableRow key={msg.id}>
              <TableCell align="center">{msg.text}</TableCell>
              <TableCell align="center">{msg.number}</TableCell>
              <TableCell align="center">{msg.name}</TableCell>
              <TableCell align="center">{msg.tag}</TableCell>
              <TableCell align="center">
                <Button variant="contained" color="primary" onClick={() => onReply(msg.chatId)}>
                  Reply
                </Button>
              </TableCell>
              <TableCell align="center">{msg.status}</TableCell>
              <TableCell align="center">{msg.date}</TableCell>
              <TableCell align="center">
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
};

export default CustomerMessagesTable;
