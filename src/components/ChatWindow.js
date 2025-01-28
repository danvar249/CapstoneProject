import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, Avatar, CircularProgress } from '@mui/material';
import axios from '../utils/axios';
import './ChatWindow.css';

const ChatWindow = () => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingChats, setLoadingChats] = useState(true); // For loading chats
    const [loadingMessages, setLoadingMessages] = useState(false); // For loading messages

    const chatContainerRef = useRef(null);

    const fetchChats = async () => {
        setLoadingChats(true);
        try {
            const response = await axios.get('/whatsapp/chats');
            setChats(response.data);
            setLoadingChats(false);
        } catch (error) {
            console.error('Error fetching chats:', error);
            setLoadingChats(false);
        }
    };

    const fetchMessagesForChat = async (chatId) => {
        setLoadingMessages(true);
        try {
            const response = await axios.get(`/whatsapp/chats/${chatId}/messages`);
            setMessages(response.data);
            setLoadingMessages(false);

            setTimeout(() => {
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                }
            }, 0);
        } catch (error) {
            console.error(`Error fetching messages for chat ${chatId}:`, error);
            setLoadingMessages(false);
        }
    };


    const handleChatClick = (chat) => {
        setSelectedChat(chat);
        fetchMessagesForChat(chat.id);
    };

    const handleSendMessage = async () => {
        if (!selectedChat || !newMessage.trim()) return;

        try {
            const response = await axios.post('/whatsapp/send-message', {
                phoneNumber: selectedChat.id.split('@')[0],
                message: newMessage,
            });

            if (response.data.success) {
                const newMessageObj = {
                    id: `temp-${Date.now()}`,
                    from: 'me',
                    body: newMessage,
                    timestamp: new Date().toISOString(),
                };

                setMessages((prevMessages) => [...prevMessages, newMessageObj]);
                setNewMessage("");
            }
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    return (
        <Box className="chat-window">
            {/* Show Loading Spinner When Chats Are Loading */}
            {loadingChats ? (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        width: '80vw',
                    }}
                >
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Chat List */}
                    <Box className="chat-list">
                        {/* Static Title Section */}
                        <Box className="chat-list-header">
                            <Typography variant="h6">Chats</Typography>
                        </Box>

                        {/* Scrollable Chat List */}
                        <Box className="chat-list-scrollable">
                            <List>
                                {chats.map((chat) => (
                                    <ListItem
                                        key={chat.id}
                                        button
                                        onClick={() => handleChatClick(chat)}
                                        className={`chat-list-item ${selectedChat?.id === chat.id ? 'selected' : ''}`}
                                    >
                                        <Avatar src={chat.profilePicUrl} alt={chat.name} sx={{ marginRight: 2 }} />
                                        <Typography variant="body1" noWrap>
                                            {chat.name || chat.id}
                                        </Typography>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Box>

                    {/* Chat Messages */}
                    <Box className="chat-messages">
                        {/* Chat Header */}
                        {selectedChat && (
                            <Box className="chat-header">
                                <Avatar
                                    src={selectedChat.profilePicUrl}
                                    alt={selectedChat.name}
                                    className="chat-header-avatar"
                                />
                                <Typography variant="h6">{selectedChat.name || selectedChat.id}</Typography>
                            </Box>
                        )}

                        {/* Messages Container */}
                        <Box ref={chatContainerRef} className="messages-container">
                            {loadingMessages ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: '100%',
                                    }}
                                >
                                    <CircularProgress />
                                </Box>
                            ) : selectedChat ? (
                                <List>
                                    {messages.map((msg, index) => (
                                        <ListItem
                                            key={index}
                                            className={`message-item ${msg.from === 'me' ? 'me' : 'them'}`}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start', // Align left for "them", right for "me"
                                                padding: '8px 0',
                                            }}
                                        >
                                            <Box
                                                className={`message-bubble ${msg.from === 'me' ? 'me' : 'them'}`}
                                                sx={{
                                                    bgcolor: msg.from === 'me' ? '#DCF8C6' : '#fff', // Green for "me", white for "them"
                                                    padding: 1.5,
                                                    borderRadius: 2,
                                                    maxWidth: '70%',
                                                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                                                    textAlign: 'left',
                                                }}
                                            >
                                                <Typography variant="body2">{msg.body}</Typography>
                                                <Typography
                                                    sx={{
                                                        display: 'block',
                                                        textAlign: 'right',
                                                        marginTop: 0.5,
                                                        fontSize: '0.75rem',
                                                        color: '#999',
                                                    }}
                                                >
                                                    {/* Local time without seconds */}
                                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </Typography>
                                            </Box>
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Typography
                                    variant="body1"
                                    sx={{
                                        textAlign: 'center',
                                        marginTop: 4,
                                        color: '#999',
                                    }}
                                >
                                    Select a chat to view messages
                                </Typography>
                            )}
                        </Box>


                        {/* Message Input */}
                        {selectedChat && (
                            <Box className="message-input-container">
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="message-input"
                                />
                                <Button
                                    variant="contained"
                                    className="message-send-button"
                                    onClick={handleSendMessage}
                                >
                                    Send
                                </Button>
                            </Box>
                        )}
                    </Box>
                </>
            )}
        </Box>
    );

};

export default ChatWindow;