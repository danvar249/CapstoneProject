import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button } from "@mui/material";
import axios from "../utils/axios";
import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";
import MessageInput from "./MessageInput";
import { Chat, Message } from "../types";
import "../styles/ChatWindow.css";
import "../styles/select.css";
import ChatHeader from "./ChatHeader";

const ChatWindow: React.FC = () => {
    // ✅ State Definitions
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [chats, setChats] = useState<Chat[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [loadingChats, setLoadingChats] = useState<boolean>(true);
    const [userData, setUserData] = useState<{ userId: string; role: string } | null>(null);
    const [customerExists, setCustomerExists] = useState<boolean>(false);
    const [customerClassifications, setCustomerClassifications] = useState<string[]>([]);
    const [selectedClassification, setSelectedClassification] = useState<string>("All");
    const [customersByTag, setCustomersByTag] = useState<Record<string, { name: string; number: string }>>({});

    // ✅ Load userData from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUserData(JSON.parse(storedUser));
    }, []);

    // ✅ Fetch Chats and Available Tags
    useEffect(() => {
        const fetchChats = async () => {
            try {
                setLoadingChats(true);
                console.log("fetching chats")
                const response = await axios.get("/whatsapp/chats");
                setChats(response.data);
            } catch (error) {
                console.error("❌ Error fetching chats:", error);
            } finally {
                setLoadingChats(false);
            }
        };

        const fetchTags = async () => {
            try {
                const response = await axios.get("/tags");
                setAvailableTags(response.data.map((tag: { name: string }) => tag.name));
            } catch (error) {
                console.error("❌ Error fetching tags:", error);
            }
        };

        fetchChats();
        fetchTags();
    }, []);

    // ✅ Fetch Messages when Chat is Selected
    useEffect(() => {
        if (!selectedChat?.id || !userData?.userId) return;

        const fetchMessages = async () => {
            try {
                console.log(`📥 Fetching messages for chat: ${selectedChat.id}`);
                const response = await axios.get(`/whatsapp/chats/${selectedChat.id}/messages`, {
                    headers: { Authorization: `Bearer ${userData.userId}` },
                });

                setMessages(response.data);

                // ✅ Check if customer exists in the system
                const phoneNumber = selectedChat.id.split("@")[0];

                try {
                    const res = await axios.get(`/customer/${phoneNumber}`);
                    setCustomerExists(true);
                    setCustomerClassifications(res.data.interests);
                } catch (error: any) {
                    if (error.response?.data?.error === "Customer not found") {
                        setCustomerExists(false);
                        setCustomerClassifications([]);
                    }
                }
            } catch (error) {
                console.error(`❌ Error fetching messages for chat ${selectedChat.id}:`, error);
            }
        };

        fetchMessages();
    }, [selectedChat, userData]);


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


    // ✅ Register Customer
    const handleRegisterCustomer = async () => {
        if (!userData || !selectedChat) return;
        try {
            const number = selectedChat.id.split("@")[0];
            await axios.post("/addCustomer", {
                userId: userData.userId,
                name: selectedChat.name || "Unknown",
                number,
            });

            console.log("✅ Customer Registered:", number);
            setCustomerExists(true);

            // ✅ Classify messages after registration
            await axios.post("/classify", {
                userId: userData.userId,
                phoneNumber: number,
                messages: messages,
            });
            console.log("📤 Sent messages to /classify after registration.");
        } catch (error) {
            console.error("❌ Error registering customer:", error);
        }
    };

    // ✅ Handle Sending Messages
    const handleSendMessage = useCallback(async (messageText: string) => {
        if (!selectedChat || !messageText.trim()) return;

        try {
            const response = await axios.post("/whatsapp/send-message", {
                phoneNumber: selectedChat.id.split("@")[0],
                message: messageText,
            });

            if (response.data.success) {
                const newMessage: Message = {
                    id: `temp-${Date.now()}`,
                    from: "me",
                    body: messageText,
                    timestamp: new Date().toISOString(),
                    fromMe: true,
                    classifications: [],
                };

                setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
        } catch (error) {
            console.error("Error sending WhatsApp message:", error);
        }
    }, [selectedChat]);


    return (
        <Box className="chat-window">
            {/* 🔹 Sidebar (Chat List) */}
            <ChatList
                chats={chats}
                selectedChat={selectedChat}
                setSelectedChat={setSelectedChat}
                availableTags={availableTags}
                loadingChats={loadingChats} customersByTag={customersByTag} selectedClassification={selectedClassification} setSelectedClassification={setSelectedClassification} />

            {/* 🔹 Main Panel (Messages & Header) */}
            <Box className="chat-messages">
                {/* 🔹 Chat Header */}
                {selectedChat && <ChatHeader chatName={selectedChat.name || selectedChat.id} customerExists={customerExists} customerClassifications={customerClassifications} role={userData?.role || ""}
                    handleRegisterCustomer={handleRegisterCustomer} />}


                {/* 🔹 Chat Messages */}
                {selectedChat && <ChatMessages messages={messages} />}

                {/* 🔹 Message Input */}
                {selectedChat && <MessageInput onSendMessage={handleSendMessage} />}
            </Box>
        </Box>
    );

};

export default ChatWindow;
