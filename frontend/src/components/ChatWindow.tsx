import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    CircularProgress,
    Select,
    MenuItem,
    InputLabel,
    Accordion,
    AccordionDetails,
    AccordionSummary,
    ListItemText,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
    const [newMessage, setNewMessage] = useState<string>("");
    const [loadingChats, setLoadingChats] = useState<boolean>(true);
    const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
    const [chatSearchQuery, setChatSearchQuery] = useState<string>("");
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [selectedClassification, setSelectedClassification] = useState<string>("All");
    const [userData, setUserData] = useState<any>(null);
    const [customerExists, setCustomerExists] = useState<boolean | null>(null);
    const [customerClassifications, setCustomerClassifications] = useState<string[]>([]);
    const [expanded, setExpanded] = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            console.log('userData', userData)

            setUserData(JSON.parse(userData));
        }


        const fetchTags = async () => {
            try {
                const response = await axios.get("/tags");
                setAvailableTags(response.data.map((tag: { name: string }) => tag.name));
            } catch (error) {
                console.error("❌ Error fetching tags:", error);
            }
        };

        fetchTags();


    }, []);
    const handleIncomingMessage = async (message: any) => {
        console.log("📥 New Message Received:", message);
        const chatId = message.from;
        if (selectedChat?.id === chatId) {
            setMessages((prevMessages: any) => [...prevMessages, message]);
            setFilteredMessages((prevMessages: any) => [...prevMessages, message]);
        }
        try {
            const phoneNumber = selectedChat.id.split("@")[0];

            const res = await axios.get(`/customer/${phoneNumber}`);
            if (res.status === 200) {
                // if message from existing customer classify it.
                axios.post("/classify", {
                    phoneNumber: phoneNumber,
                    messages: [message],
                }).catch(() => { }); // ✅ Ignore errors (non-blocking)
            }
            console.log("📤 Sent message to /classify for processing.");
        } catch (error) {
            console.error("❌ Error sending message to /classify:", error);
        }
    };
    useEffect(() => {
        addSocketListener("incomingMessage", handleIncomingMessage);
        return () => {
            removeSocketListener("incomingMessage", handleIncomingMessage);
        };
    }, [])
    useEffect(() => {
        fetchMessagesForChat()
    }, [selectedChat])


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
    const fetchMessagesForChat = async (): Promise<void> => {
        if (!selectedChat)
            return;
        setLoadingMessages(true);
        setCustomerExists(null)
        try {
            console.log('messages')
            const userId = userData?.userId;

            if (!userId) {
                console.log('data: ', userData)
                console.error('❌ User ID is missing from local storage.');
                return;
            }

            const response = await axios.get(`/whatsapp/chats/${selectedChat.id}/messages`, {
                headers: { Authorization: `Bearer ${userId}` },
            });
            setMessages(response.data);
            setFilteredMessages(response.data);
            const phoneNumber = selectedChat.id.split("@")[0];

            try {
                const res = await axios.get(`/customer/${phoneNumber}`);
                setCustomerExists(true);
                setCustomerClassifications(res.data.interests);

                console.log("✅ Customer Exists:", res.data);
            } catch (error: any) {
                if (error.response && error.response.data.error === "Customer not found") {
                    setCustomerExists(false);
                    console.log(" Customer doesn't exist")
                }
            }

            setTimeout(() => {
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                }
            }, 0);
        } catch (error) {
            console.error(`Error fetching messages for chat ${selectedChat.id}:`, error);
        } finally {
            setLoadingMessages(false);
        }
    };

    // ✅ Register Customer
    const handleRegisterCustomer = async () => {
        if (!userData) return;
        if (!selectedChat) return;
        try {
            const number = selectedChat.id.split("@")[0];
            const response = await axios.post("/addCustomer", {
                userId: userData.userId,
                name: selectedChat.name || "Unknown",
                number: number,
            });

            console.log("✅ Customer Registered:", response.data);
            setCustomerExists(true);
            axios.post("/classify", {
                userId: userData.userId,
                phoneNumber: number,
                messages: messages
            }
            ).catch(() => { });
        } catch (error) {
            console.error("❌ Error registering customer:", error);
        }
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
        setFilteredChats(
            chats.filter((chat: { name: string; classification?: string }) =>
                chat.name.toLowerCase().includes(chatSearchQuery.toLowerCase()) &&
                (selectedClassification === "All" || chat.classification === selectedClassification)
            )
        );
    }, [chatSearchQuery, chats, selectedClassification]);

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
                        className="text"
                        fullWidth
                        placeholder="Search Chats..."
                        variant="outlined"
                        value={chatSearchQuery}
                        onChange={(e) => setChatSearchQuery(e.target.value)}
                    />
                    <InputLabel>Filter by Classification</InputLabel>
                    <Select fullWidth
                        className="select"
                        value={selectedClassification}
                        onChange={(e) => setSelectedClassification(e.target.value)}
                    >
                        <MenuItem value="All">All</MenuItem>
                        {availableTags.map((category) => (
                            <MenuItem key={category} value={category}>{category}</MenuItem>
                        ))}
                    </Select>
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
                                onClick={() => setSelectedChat(chat)}
                                className={`chat-list-item ${selectedChat?.id === chat.id ? 'selected' : ''}`}>
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
                        <Typography variant="h6">{selectedChat.name || selectedChat.id}</Typography>
                        {customerExists ? (
                            <div>
                                <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="h6">Customer Interests</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {customerClassifications.length > 0 ? (
                                            <List>
                                                {customerClassifications.map((interest, index) => (
                                                    <ListItem key={index}>
                                                        <ListItemText primary={interest} />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        ) : (
                                            <Typography color="textSecondary">No interests assigned</Typography>
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            </div>
                        ) : customerExists === false && userData?.role === "manager" ?
                            (
                                <Button variant="contained" sx={{ marginLeft: "auto", bgcolor: "red" }} onClick={handleRegisterCustomer}>
                                    Register Customer
                                </Button>
                            ) : <></>}

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
