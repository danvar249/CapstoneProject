import React from 'react';
import { List, ListItem, ListItemText, Divider, Box, Typography } from '@mui/material';

const ChatList = ({ chats, onSelectChat }) => {
  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      <Typography variant="h6" sx={{ p: 2 }}>Chats</Typography>
      <Divider />
      <List>
        {chats.map((chat) => (
          <ListItem button key={chat.id} onClick={() => onSelectChat(chat.id)}>
            <ListItemText primary={chat.name} secondary={chat.lastMessage} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ChatList;
