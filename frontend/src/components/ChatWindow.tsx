import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    Avatar,
    CircularProgress,
} from "@mui/material";
import axios from "../utils/axios";
import { addSocketListener, removeSocketListener } from "../utils/socket";
import "./ChatWindow.css";

const ChatWindow: React.FC = () => {
    // ✅ State Definitions
    const [chats, setChats] = useState<any>([]);
    const [filteredChats, setFilteredChats] = useState<any>([]);
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [messages, setMessages] = useState<any>([]);
    const [filteredMessages, setFilteredMessages] = useState<any>([]);
    const [unreadMessages, setUnreadMessages] = useState<Record<string, any[]>>({});
    const [newMessage, setNewMessage] = useState<string>("");
    const [loadingChats, setLoadingChats] = useState<boolean>(true);
    const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
    const [chatSearchQuery, setChatSearchQuery] = useState<string>("");
    const [messageSearchQuery, setMessageSearchQuery] = useState<string>("");

    const chatContainerRef = useRef<HTMLDivElement>(null);

    // ✅ Fetch Chats from Server
    const fetchChats = async (): Promise<void> => {
        setLoadingChats(true);
        try {
            const response = await axios.get<any[]>("/whatsapp/chats");
            setChats(response.data);
            setFilteredChats(response.data);
        } catch (error) {
            console.error("Error fetching chats:", error);
        } finally {
            setLoadingChats(false);
        }
    };

    // ✅ Fetch Messages for Selected Chat
    const fetchMessagesForChat = async (chatId: string): Promise<void> => {
        setLoadingMessages(true);
        try {
            const response = await axios.get<any[]>(`/whatsapp/chats/${chatId}/messages`);
            setMessages(response.data);
            setFilteredMessages(response.data);

            // ✅ Mark messages as read when opening chat
            setUnreadMessages((prevUnread) => {
                const updatedUnread = { ...prevUnread };
                delete updatedUnread[chatId];
                return updatedUnread;
            });

            // ✅ Scroll to bottom when messages load
            setTimeout(() => {
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                }
            }, 0);
        } catch (error) {
            console.error(`Error fetching messages for chat ${chatId}:`, error);
        } finally {
            setLoadingMessages(false);
        }
    };

    // ✅ Handle Incoming Messages from WebSocket
    useEffect(() => {
        const handleIncomingMessage = (message: any) => {
            console.log("📥 New Message Received:", message);
            const chatId = message.from;

            if (selectedChat?.id === chatId) {
                setMessages((prevMessages: any) => [...prevMessages, message]);
                setFilteredMessages((prevMessages: any) => [...prevMessages, message]);
            } else {
                setUnreadMessages((prevUnread) => ({
                    ...prevUnread,
                    [chatId]: [...(prevUnread[chatId] || []), message],
                }));
            }
        };

        addSocketListener("incomingMessage", handleIncomingMessage);

        return () => {
            removeSocketListener("incomingMessage", handleIncomingMessage);
        };
    }, [selectedChat]);

    // ✅ Handle Chat Selection
    const handleChatClick = (chat: any) => {
        setSelectedChat(chat);
        fetchMessagesForChat(chat.id);
        setMessageSearchQuery("");
    };

    // ✅ Handle Message Sending
    const handleSendMessage = async (): Promise<void> => {
        if (!selectedChat || !newMessage.trim()) return;

        try {
            const response = await axios.post<{ success: boolean }>("/whatsapp/send-message", {
                phoneNumber: selectedChat.id.split("@")[0],
                message: newMessage,
            });

            if (response.data.success) {
                const newMessageObj = {
                    id: `temp-${Date.now()}`,
                    from: 'me',
                    body: newMessage,
                    timestamp: new Date().toISOString(),
                };

                setMessages((prevMessages: any) => [...prevMessages, newMessageObj]);
                setFilteredMessages((prevMessages: any) => [...prevMessages, newMessageObj]);
                setNewMessage("");
            }
        } catch (error) {
            console.error("Error sending WhatsApp message:", error);
        }
    };

    // ✅ Handle Chat Search
    useEffect(() => {
        setFilteredChats(
            chats.filter((chat: { name: string; }) =>
                chat.name.toLowerCase().includes(chatSearchQuery.toLowerCase())
            )
        );
    }, [chatSearchQuery, chats]);

    // ✅ Handle Message Search
    useEffect(() => {
        setFilteredMessages(
            messages.filter((message: { body: string; }) =>
                message.body.toLowerCase().includes(messageSearchQuery.toLowerCase())
            )
        );
    }, [messageSearchQuery, messages]);

    useEffect(() => {
        fetchChats();
    }, []);

    return (
        <Box className="chat-window">
            {/* 🔹 Chat List */}
            <Box className="chat-list">
                <Box className="chat-list-header">
                    <Typography variant="h6">Chats</Typography>
                    <TextField
                        fullWidth
                        placeholder="Search Chats..."
                        variant="outlined"
                        value={chatSearchQuery}
                        onChange={(e) => setChatSearchQuery(e.target.value)}
                        sx={{ marginTop: 1, bgcolor: "white" }}
                    />
                </Box>

                {loadingChats ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <List className="chat-list-scrollable">
                        {filteredChats.map((chat: { id: React.Key | null | undefined; profilePicUrl: string | undefined; name: string | undefined; }) => (
                            <ListItem key={chat.id}
                                component="button"
                                onClick={() => handleChatClick(chat)}
                                className={`chat-list-item ${selectedChat?.id === chat.id ? 'selected' : ''}`}>
                                <Avatar src={chat.profilePicUrl} alt={chat.name} sx={{ marginRight: 2 }} />
                                <Typography variant="body1" noWrap>
                                    {chat.name || chat.id}
                                </Typography>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>

            {/* 🔹 Chat Messages */}
            <Box className="chat-messages">
                {selectedChat && (
                    <Box className="chat-header">
                        <Avatar src={selectedChat.profilePicUrl} alt={selectedChat.name} className="chat-header-avatar" />
                        <Typography variant="h6">{selectedChat.name || selectedChat.id}</Typography>
                    </Box>
                )}

                {loadingMessages ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box ref={chatContainerRef} className="messages-container">
                        <List>
                            {filteredMessages.filter((msg: { body: string; }) => msg.body.trim() !== "").map((msg: {
                                fromMe: any; id: React.Key | null | undefined; from: string; body: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; timestamp: string | number | Date;
                            }) => (
                                <ListItem
                                    key={msg.id}
                                    className={`message-item ${msg.fromMe ? "me" : "them"}`}
                                    sx={{
                                        display: "flex",
                                        justifyContent: msg.fromMe ? "flex-end" : "flex-start",
                                        padding: "5px 0",
                                    }}
                                >
                                    <Box
                                        className={`message-bubble ${msg.fromMe ? "me" : "them"}`}
                                        sx={{
                                            backgroundColor: msg.fromMe ? "#DCF8C6" : "#ffffff",
                                            padding: "10px 15px",
                                            borderRadius: "10px",
                                            maxWidth: "65%",
                                            boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.2)",
                                            textAlign: msg.fromMe ? "right" : "left",
                                        }}
                                    >
                                        <Typography variant="body2">{msg.body}</Typography>
                                        <Typography
                                            sx={{
                                                display: "block",
                                                textAlign: "right",
                                                marginTop: 0.5,
                                                fontSize: "0.75rem",
                                                color: "#999",
                                            }}
                                        >
                                            {new Date(msg.timestamp).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </Typography>
                                    </Box>
                                </ListItem>

                            ))}
                        </List>
                    </Box>
                )}

                {selectedChat && (
                    <Box className="message-input-container">
                        <TextField variant="outlined" fullWidth placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="message-input" />
                        <Button variant="contained" className="message-send-button" onClick={handleSendMessage}>
                            Send
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default ChatWindow;
