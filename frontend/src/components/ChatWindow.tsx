import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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

// Define Message Type with Classifications
interface Message {
    id: string; // Unique message ID
    from: string; // Sender's identifier (e.g., phone number)
    fromMe: boolean; // Indicates if the message was sent by the user
    body: string; // Message content
    timestamp: string; // Timestamp in ISO format
    classifications: string[]; // List of classifications
}

// Define Chat Type with Messages
interface Chat {
    id: string; // Unique chat identifier
    name?: string; // Optional chat name
    messages: Message[]; // List of messages in the chat
}


// ✅ Custom Hook for Fetching Data (Encapsulation)
const useFetchData = (endpoint: string, initialState: any, transformFn = (data: any) => data) => {
    const [data, setData] = useState(initialState);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(endpoint);
                setData(transformFn(response.data));
            } catch (error) {
                console.error(`❌ Error fetching ${endpoint}:`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [endpoint]);

    return { data, setData, loading };
};

const ChatWindow: React.FC = () => {
    // ✅ State Definitions
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");
    const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
    const [chatSearchQuery, setChatSearchQuery] = useState<string>("");
    const [selectedClassification, setSelectedClassification] = useState<string>("All");
    const [customerExists, setCustomerExists] = useState<boolean | null>(null);
    const [customerClassifications, setCustomerClassifications] = useState<string[]>([]);
    const [expanded, setExpanded] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [userData, setUserData] = useState<{ userId: string } | null>(null);

    // Load userData from localStorage or API
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        }
    }, []);

    // ✅ Custom Hooks for Fetching Data
    const { data: chats, setData: setChats, loading: loadingChats } = useFetchData(
        "/whatsapp/chats",
        []
    );
    const { data: availableTags } = useFetchData("/tags", [], (tags) => tags.map((t: any) => t.name));

    // ✅ Fetch Messages when Chat is Selected
    useEffect(() => {
        if (!selectedChat?.id || !userData?.userId || selectedChat.messages?.length > 0) return; // ✅ Prevent infinite loop if messages exist
        setLoadingMessages(true);
        setCustomerExists(null);

        const fetchMessages = async () => {
            try {
                console.log(`📥 Fetching messages for chat: ${selectedChat.id}`);
                const response = await axios.get(`/whatsapp/chats/${selectedChat.id}/messages`, {
                    headers: { Authorization: `Bearer ${userData.userId}` },
                });

                if (!response.data) throw new Error("No messages received");

                setMessages(response.data);

            } catch (error) {
                console.error(`❌ Error fetching messages for chat ${selectedChat.id}:`, error);
            } finally {
                setLoadingMessages(false);
            }
        };

        fetchMessages();
    }, [selectedChat, userData]); // ✅ Runs only when `selectedChat` or `userData` changes



    // ✅ Handle Incoming Messages with WebSocket
    useEffect(() => {
        const handleIncomingMessage = (message: Message) => {
            console.log("📥 New Message Received:", message);

            if (selectedChat?.id === message.from) {
                setSelectedChat((prevChat: Chat) =>
                    prevChat ? { ...prevChat, messages: [...prevChat.messages, message] } : null
                );
            }
        };

        addSocketListener("incomingMessage", handleIncomingMessage);
        return () => removeSocketListener("incomingMessage", handleIncomingMessage);
    }, [selectedChat]);


    // ✅ Handle Sending Messages
    const handleSendMessage = useCallback(async () => {
        if (!selectedChat || !newMessage.trim()) return;

        try {
            const response = await axios.post("/whatsapp/send-message", {
                phoneNumber: selectedChat.id.split("@")[0],
                message: newMessage,
            });

            if (response.data.success) {
                const newMessageObj: Message = {
                    id: `temp-${Date.now()}`,
                    from: "me",
                    body: newMessage,
                    timestamp: new Date().toISOString(),
                    fromMe: true,
                    classifications: []
                };

                setMessages((prevMessages) => [...prevMessages, newMessageObj]);
                setNewMessage("");
            }
        } catch (error) {
            console.error("Error sending WhatsApp message:", error);
        }
    }, [selectedChat, newMessage]);

    const [customersByTag, setCustomersByTag] = useState<Record<string, { name: string; number: string }>>({});

    useEffect(() => {
        const fetchCustomersByTag = async () => {
            if (selectedClassification === "All") {
                setCustomersByTag({});
                return;
            }

            try {
                const response = await axios.post("/customers/by-tags", { tags: [selectedClassification] });
                const customerData = response.data.reduce((acc: Record<string, { name: string; number: string }>, customer: { name: string; number: string }) => {
                    acc[customer.number] = customer; // ✅ Map phone numbers to customer details
                    return acc;
                }, {});

                setCustomersByTag(customerData);
            } catch (error) {
                console.error("❌ Error fetching customers by tags:", error);
            }
        };

        fetchCustomersByTag();
    }, [selectedClassification]); // ✅ Runs when classification changes

    const filteredChats = useMemo(() =>
        chats.filter((chat: Chat) => {
            const phoneNumber = chat.id.split("@")[0]; // ✅ Extract phone number

            // ✅ Check if customer exists in filtered customer list
            const customerMatches = selectedClassification === "All" || phoneNumber in customersByTag;

            // ✅ Check if the chat name matches the search query
            const nameMatches = chat.name?.toLowerCase().includes(chatSearchQuery.toLowerCase());

            return nameMatches && customerMatches;
        }),
        [chats, chatSearchQuery, selectedClassification, customersByTag]
    );


    return (
        <Box className="chat-window">
            {/* 🔹 Chat List Section */}
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
                    <Select
                        className="select"
                        fullWidth
                        value={selectedClassification}
                        onChange={(e) => setSelectedClassification(e.target.value)}
                    >
                        <MenuItem value="All">All</MenuItem>
                        {availableTags.map((tag: string) => (
                            <MenuItem key={tag} value={tag}>
                                {tag}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                {/* ✅ Fix JSX Structure Here */}
                {loadingChats ? (
                    <CircularProgress />
                ) : (
                    <List className="chat-list-scrollable">
                        {filteredChats.length > 0 ? (
                            filteredChats.map((chat: Chat) => (
                                <ListItem
                                    key={chat.id}
                                    component="button"
                                    onClick={() => setSelectedChat(chat)}
                                    className={`chat-list-item ${selectedChat?.id === chat.id ? "selected" : ""}`}
                                >
                                    <Typography variant="body1" noWrap>
                                        {chat.name || chat.id}
                                    </Typography>
                                </ListItem>
                            ))
                        ) : (
                            <Typography>No chats available</Typography>
                        )}
                    </List>
                )}
            </Box>

            {/* 🔹 Chat Messages Section */}
            <Box className="chat-messages">
                {selectedChat && (
                    <Box className="chat-header">
                        <Typography variant="h6">{selectedChat.name || selectedChat.id}</Typography>
                        {customerExists && (
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
                        )}
                    </Box>
                )}

                <Box ref={chatContainerRef} className="messages-container">
                    <List>
                        {messages
                            .filter((msg: Message) => msg.body.trim() !== "")
                            .map((msg: Message) => (
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
