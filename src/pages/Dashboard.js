import React, { useState, useEffect } from 'react';
import { Typography, Paper, TextField, Button, Box, List, ListItem, Autocomplete } from '@mui/material';
import CustomerMessagesTable from '../components/CustomerMessagesTable';
import axios from '../utils/axios';

function Dashboard() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [tableMessages, setTableMessages] = useState([]);

  useEffect(() => {
    // Fetch customer messages from the server
    const fetchCustomerMessages = async () => {
      try {
        const response = await axios.get('/conversations');
        const enrichedConversations = response.data.map(conversation => ({
          ...conversation,
          customerName: conversation.customerDetails.name,
          customerPhone: conversation.customerDetails.contact,
          tags: conversation.tags, // Already resolved tag names
        }));
  
        console.log('Conversations with Resolved Tags:', enrichedConversations);
        setTableMessages(enrichedConversations);
      } catch (error) {
        console.error('Error fetching customer messages:', error);
      }
    };

    fetchCustomerMessages();
  }, []);

  const handleReplyClick = async (chatId) => {
    setSelectedChat(chatId);
    try {
      setMessages(tableMessages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const handleSearchFilterChange = (event, value) => {
    setSearchFilter(value);
  };

  // const filteredMessages = tableMessages.filter(msg =>
  //   msg.tags.includes(searchFilter.toLowerCase()) ||
  //   msg.text.includes(searchFilter.toLowerCase())
  // );

  const uniqueTags = [...new Set(tableMessages.map(msg => msg.tags))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '20px', boxSizing: 'border-box' }}>
      <Typography variant="h4" gutterBottom>Messages</Typography>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', flex: 1 }}>
        {/* Customer Messages Table */}
        <div style={{ flex: 2, overflowY: 'auto', height: '80vh' }}>
          <Autocomplete
            freeSolo
            options={uniqueTags}
            value={searchFilter}
            onInputChange={handleSearchFilterChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search or filter by tag"
                variant="outlined"
                fullWidth
                style={{ marginBottom: '20px' }}
              />
            )}
          />
          <CustomerMessagesTable messages={tableMessages} onReply={handleReplyClick} onDelete={() => {}} />
        </div>
  
        {/* WhatsApp Interface */}
        <div style={{ flex: 1, overflowY: 'auto', height: '80vh', display: 'flex', flexDirection: 'column' }}>
          <Paper 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              flexGrow: 1,
              backgroundColor: '#f5f5f5',
              borderRadius: 2,
              boxShadow: 3,
              overflowY: 'auto',
              height: '100%',
            }}
          >
            <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: 2 }}>
              {selectedChat ? (
                <List>
                  {messages.map((msg, index) => (
                    <ListItem key={index} sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-start' : 'flex-end' }}>
                      <Box 
                        sx={{
                          background: msg.sender === "user" ? "#e0e0e0" : "#3f51b5",
                          color: msg.sender === "user" ? "#000" : "#fff",
                          borderRadius: 2,
                          padding: '8px 12px',
                          maxWidth: '75%',
                          wordWrap: 'break-word',
                        }}
                      >
                        {msg.text}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="textSecondary" align="center" sx={{ mt: 3 }}>
                  Select a message to view the chat.
                </Typography>
              )}
            </Box>
            {selectedChat && (
              <Box sx={{ display: 'flex', padding: 1, borderTop: '1px solid #ddd' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type your message..."
                  sx={{ flexGrow: 1 }}
                />
                <Button variant="contained" color="primary" sx={{ marginLeft: 1 }}>
                  Send
                </Button>
              </Box>
            )}
          </Paper>
        </div>
      </div>
    </div>
  );
}  

export default Dashboard;
