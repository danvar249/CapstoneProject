import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Collapse, Box, Grid, Typography } from '@mui/material'; import ChatIcon from '@mui/icons-material/Chat';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function CustomerMessagesTable({ messages, onReply }) {
  const [openTags, setOpenTags] = useState({});

  const handleToggleTags = (id) => {
    setOpenTags((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Number</TableCell>
            <TableCell>Message</TableCell>
            <TableCell>Tags</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {messages.map((msg) => (
            <TableRow key={msg._id}>
              <TableCell>{msg.customerName}</TableCell>
              <TableCell>{msg.customerPhone}</TableCell>
              <TableCell>{msg.messages[msg.messages.length - 1].text}</TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {msg.tags[0] || 'No tags'}
                  </Typography>
                  {msg.tags.length > 1 && (
                    <IconButton onClick={() => handleToggleTags(msg._id)}>
                      {openTags[msg._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  )}
                  <Collapse in={openTags[msg._id]} timeout="auto" unmountOnExit>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      {msg.tags.slice(1).map((tag, index) => (
                        <Grid item key={index} xs={12} sm={6} md={4}>
                          <Box
                            sx={{
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              padding: '8px',
                              textAlign: 'center',
                              backgroundColor: '#f9f9f9',
                            }}
                          >
                            {tag}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Collapse>

                </Box>
              </TableCell>
              <TableCell>{msg.messages[msg.messages.length - 1].timestamp}</TableCell>
              <TableCell>
                <IconButton onClick={() => onReply(msg.chatId)} color="primary">
                  <ChatIcon />
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
