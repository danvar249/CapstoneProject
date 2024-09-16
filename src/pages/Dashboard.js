import React, { useState } from 'react';
import { Typography, Paper, TextField, Button, Box, List, ListItem, Autocomplete } from '@mui/material';
import CustomerMessagesTable from '../components/CustomerMessagesTable';

const mockChats = {
  1: [
    { id: 1, text: "Hello, I'm interested in the new smartphone model.", sender: "customer" },
    { id: 2, text: "Great choice! We have it available in stock. Would you like to place an order?", sender: "user" },
    { id: 3, text: "Yes, I'd like to order one.", sender: "customer" },
    { id: 4, text: "Order confirmed! You'll receive it within 3-5 business days.", sender: "user" },
    { id: 5, text: "Thank you for your help!", sender: "customer" },
  ],
  2: [
    { id: 1, text: "Can you tell me more about your current promotions?", sender: "customer" },
    { id: 2, text: "Sure! We have a 20% discount on all electronics this week.", sender: "user" },
    { id: 3, text: "That's great! I'll check out the products.", sender: "customer" },
    { id: 4, text: "Feel free to reach out if you have any questions.", sender: "user" },
    { id: 5, text: "Will do, thanks!", sender: "customer" },
  ],
  3: [
    { id: 1, text: "I haven't received my order yet. Can you help?", sender: "customer" },
    { id: 2, text: "Let me check the status of your order.", sender: "user" },
    { id: 3, text: "It looks like it's on its way. You should receive it by tomorrow.", sender: "user" },
    { id: 4, text: "Thank you for the update.", sender: "customer" },
    { id: 5, text: "You're welcome! Let us know if there's anything else.", sender: "user" },
  ],
  4: [
    { id: 1, text: "I'm looking for a new laptop. Can you recommend one?", sender: "customer" },
    { id: 2, text: "Certainly! What are your primary needs for the laptop?", sender: "user" },
    { id: 3, text: "I need something powerful for gaming.", sender: "customer" },
    { id: 4, text: "I'd recommend the XGamer Pro. It has a high-end GPU and plenty of RAM.", sender: "user" },
    { id: 5, text: "Sounds perfect, I'll take it.", sender: "customer" },
  ],
  5: [
    { id: 1, text: "Do you have any discounts on accessories?", sender: "customer" },
    { id: 2, text: "Yes, we're offering 15% off all phone accessories this week.", sender: "user" },
    { id: 3, text: "That's good to know. I'll add some to my order.", sender: "customer" },
    { id: 4, text: "Great choice! Let us know if you need any help.", sender: "user" },
    { id: 5, text: "Thank you!", sender: "customer" },
  ],
  6: [
    { id: 1, text: "I received a damaged product. What should I do?", sender: "customer" },
    { id: 2, text: "I'm sorry to hear that. Please provide your order number.", sender: "user" },
    { id: 3, text: "Here it is: 12345.", sender: "customer" },
    { id: 4, text: "Thank you. We'll send a replacement immediately.", sender: "user" },
    { id: 5, text: "Thank you for the quick response.", sender: "customer" },
  ],
  7: [
    { id: 1, text: "Can you help me with the specifications of the latest gaming laptop?", sender: "customer" },
    { id: 2, text: "Absolutely! The latest model has a 16-core processor and 32GB of RAM.", sender: "user" },
    { id: 3, text: "That sounds amazing. How much does it cost?", sender: "customer" },
    { id: 4, text: "It's currently priced at $1,499.", sender: "user" },
    { id: 5, text: "I'll order it now, thanks!", sender: "customer" },
  ],
  8: [
    { id: 1, text: "What are the best smartphones for photography?", sender: "customer" },
    { id: 2, text: "The latest models from Brand X and Brand Y are highly recommended.", sender: "user" },
    { id: 3, text: "Which one has the better camera?", sender: "customer" },
    { id: 4, text: "Brand X has a slight edge in low-light photography.", sender: "user" },
    { id: 5, text: "Thanks for the info. I'll go with Brand X.", sender: "customer" },
  ],
};

const customerMessages = [
  { id: 1, text: "I'm interested in the new smartphone model.", number: "+1234567890", name: "John Doe", tag: "smartphone", status: "Unread", date: "2024-09-01", chatId: 1 },
  { id: 2, text: "Can you tell me more about your current promotions?", number: "+0987654321", name: "Jane Smith", tag: "promotion", status: "Read", date: "2024-09-02", chatId: 2 },
  { id: 3, text: "I haven't received my order yet. Can you help?", number: "+1122334455", name: "Bob Johnson", tag: "order", status: "Unread", date: "2024-09-03", chatId: 3 },
  { id: 4, text: "I'm looking for a new laptop. Can you recommend one?", number: "+1234567890", name: "Alice Brown", tag: "laptop", status: "Unread", date: "2024-09-04", chatId: 4 },
  { id: 5, text: "Do you have any discounts on accessories?", number: "+0987654321", name: "Charlie Green", tag: "accessories", status: "Read", date: "2024-09-05", chatId: 5 },
  { id: 6, text: "I received a damaged product. What should I do?", number: "+1122334455", name: "Emily White", tag: "damaged", status: "Unread", date: "2024-09-06", chatId: 6 },
  { id: 7, text: "Can you help me with the specifications of the latest gaming laptop?", number: "+2233445566", name: "David Black", tag: "laptop", status: "Unread", date: "2024-09-07", chatId: 7 },
  { id: 8, text: "What are the best smartphones for photography?", number: "+3344556677", name: "Eve Blue", tag: "smartphone", status: "Read", date: "2024-09-08", chatId: 8 },
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '80vh', padding: '20px', boxSizing: 'border-box' }}>
      <Typography variant="h4" gutterBottom>Messages</Typography>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', flex: 1 }}>
        {/* Customer Messages Table */}
        <div style={{ flex: '1', overflowY: 'auto', height: '65vh' }}>
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

        {/* WhatsApp Interface */}
        <div style={{ flex: '1', overflowY: 'auto', height: '65vh', display: 'flex', flexDirection: 'column' }}>
          <Paper 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              flexGrow: 1,
              backgroundColor: '#f5f5f5',
              borderRadius: 2,
              boxShadow: 3,
              overflowY: 'auto',
              height: '100%'
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
