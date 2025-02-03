import React, { useMemo, useState } from "react";
import { Box, List, Typography, CircularProgress, TextField, Select, MenuItem, InputLabel, Badge, ListItemButton } from "@mui/material";
import { Chat } from "../types";
import "../styles/select.css";
import "../styles/ChatList.css";
import "../styles/text.css";

interface ChatListProps {
    chats: Chat[];
    selectedChat: Chat | null;
    setSelectedChat: (chat: Chat) => void;
    availableTags: string[];
    loadingChats: boolean;
    customersByTag: Record<string, { name: string; number: string }>;
    selectedClassification: string;
    setSelectedClassification: (classification: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({
    chats,
    selectedChat,
    setSelectedChat,
    availableTags,
    loadingChats,
    customersByTag,
    selectedClassification,
    setSelectedClassification
}) => {
    const [chatSearchQuery, setChatSearchQuery] = useState<string>("");

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
        <Box className="chat-list">
            <Box className="chat-list-header">
                <Typography variant="h6">Chats</Typography>
                <TextField className="text" fullWidth placeholder="Search Chats..." variant="outlined" value={chatSearchQuery} onChange={(e) => setChatSearchQuery(e.target.value)} />
                <InputLabel>Filter by Classification</InputLabel>
                <Select className="select" fullWidth value={selectedClassification} onChange={(e) => setSelectedClassification(e.target.value)}>
                    <MenuItem value="All">All</MenuItem>
                    {availableTags.map((tag) => (
                        <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                    ))}
                </Select>
            </Box>
            {loadingChats ? (
                <CircularProgress />
            ) : (
                <List className="chat-list-scrollable">
                    {filteredChats.map((chat) => (
                        <ListItemButton key={chat.id} component="button" onClick={() => setSelectedChat(chat)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                padding: "12px",
                                borderBottom: "1px solid #e0e0e0",
                                transition: "background 0.2s",
                                backgroundColor: selectedChat?.id === chat.id ? "#e0f7fa" : "white",
                                "&:hover": { backgroundColor: "#f0f0f0" },
                                width: "100%"
                            }}>
                            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                                <Typography variant="body1" noWrap sx={{
                                    fontWeight: chat.unreadCount > 0 ? "bold" : "normal",
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}>
                                    {chat.name || chat.id}
                                </Typography>
                                {chat.lastMessage && (
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        noWrap
                                        sx={{ fontSize: "0.85rem", opacity: 0.8, maxWidth: "100%" }}
                                    >
                                        {chat.lastMessage}
                                    </Typography>
                                )}
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                {chat.unreadCount > 0 && (
                                    <Badge badgeContent={chat.unreadCount} color="primary" />
                                )}
                            </Box>
                        </ListItemButton>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default React.memo(ChatList);

