import React, { useState } from 'react';
import { Typography, Paper, TextField, Button, Box, List, ListItem,Autocomplete } from '@mui/material';
import CustomerMessagesTable from '../components/CustomerMessagesTable';


const mockChats = {
  1: [
    { id: 1, text: "Hello, John! How can I help you?", sender: "user" },
    { id: 2, text: "Can I get some help?", sender: "customer" },
  ],
  2: [
    { id: 1, text: "Thanks for the info!", sender: "customer" },
    { id: 2, text: "You're welcome!", sender: "user" },
  ],
  3: [
    { id: 1, text: "I'll get back to you soon.", sender: "customer" },
    { id: 2, text: "Sure, take your time.", sender: "user" },
  ],
  4: [
    { id: 1, text: "Hello, John! How can I help you?", sender: "user" },
    { id: 2, text: "Can I get some help?", sender: "customer" },
  ],
  5: [
    { id: 1, text: "Thanks for the info!", sender: "customer" },
    { id: 2, text: "You're welcome!", sender: "user" },
  ],
  6: [
    { id: 1, text: "I'll get back to you soon.", sender: "customer" },
    { id: 2, text: "Sure, take your time.", sender: "user" },
  ],
};

const customerMessages = [
  { id: 1, text: "Can I get some help?", number: "+1234567890", name: "John Doe", tag: "Support", status: "Unread", date: "2024-09-01", chatId: 1 },
  { id: 2, text: "Thanks for the info!", number: "+0987654321", name: "Jane Smith", tag: "Feedback", status: "Read", date: "2024-09-02", chatId: 2 },
  { id: 3, text: "I'll get back to you soon.", number: "+1122334455", name: "Bob Johnson", tag: "Follow-up", status: "Unread", date: "2024-09-03", chatId: 3 },
  { id: 4, text: "Can I get some help?", number: "+1234567890", name: "John Doe", tag: "Support", status: "Unread", date: "2024-09-01", chatId: 1 },
  { id: 5, text: "Thanks for the info!", number: "+0987654321", name: "Jane Smith", tag: "Feedback", status: "Read", date: "2024-09-02", chatId: 2 },
  { id: 6, text: "I'll get back to you soon.", number: "+1122334455", name: "Bob Johnson", tag: "Follow-up", status: "Unread", date: "2024-09-03", chatId: 3 },
  { id: 7, text: "Can I get some help?", number: "+1234567890", name: "John Doe", tag: "Support", status: "Unread", date: "2024-09-01", chatId: 1 },
  { id: 8, text: "Thanks for the info!", number: "+0987654321", name: "Jane Smith", tag: "Feedback", status: "Read", date: "2024-09-02", chatId: 2 },
  { id: 9, text: "I'll get back to you soon.", number: "+1122334455", name: "Bob Johnson", tag: "Follow-up", status: "Unread", date: "2024-09-03", chatId: 3 },
];

function Dashboard() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [tableMessages, setTableMessages] = useState(customerMessages);

  const handleReplyClick = (chatId) => {
    setSelectedChat(chatId);
    setMessages(mockChats[chatId]);
  };

  const handleSearchFilterChange = (event, value) => {
    setSearchFilter(value);
  };

  const handleDeleteMessage = (id) => {
    setTableMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
  };

  const filteredMessages = tableMessages.filter(msg =>
    msg.tag.toLowerCase().includes(searchFilter.toLowerCase()) ||
    msg.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    msg.text.toLowerCase().includes(searchFilter.toLowerCase())
  );


  const uniqueTags = [...new Set(customerMessages.map(msg => msg.tag))];

  return (
    <div style={{flex:1}}>
      <Typography variant="h4" gutterBottom>Messages</Typography>
        <div  style={{ display: 'flex', flexDirection: 'row', width:'auto' }}>
          <div>
        {/* Customer Messages Table */}
        <div style={{ flex: '1 1 60%', minWidth: '400px' }}>
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
          <CustomerMessagesTable messages={filteredMessages} onDelete={handleDeleteMessage} onReply={handleReplyClick} />
        </div>
          </div>
          <div style={{flex: 1, alignContent: 'center'}}>

        {/* WhatsApp Interface */}
          <Paper 
            sx={{ 
              display: 'flex', 
              padding: 2,
              height: '80%',
              width:'75%',
              backgroundColor: '#f5f5f5',
              borderRadius: 2,
              boxShadow: 3 
            }}
          >
            <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: 2 }}>
              {selectedChat ? (
                <List>
                  {messages.map((msg) => (
                    <ListItem key={msg.id} sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-start' : 'flex-end' }}>
                      <Box 
                        sx={{
                          background: msg.sender === "user" ? "#e0e0e0" : "#3f51b5",
                          color: msg.sender === "user" ? "#000" : "#fff",
                          borderRadius: 2,
                          padding: '8px 12px',
                          maxWidth: '75%',
                          wordWrap: 'break-word'
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
