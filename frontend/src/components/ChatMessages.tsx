import React, { useEffect, useRef } from "react";
import { Box, List, ListItem, Typography } from "@mui/material";
import MessageBubble from "./MessageBubble";
import { Message } from "../types";

interface ChatMessagesProps {
    messages: Message[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // ✅ Auto-scroll to latest message
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    return (
        <Box ref={chatContainerRef} className="messages-container">
            <List>
                {messages.length &&
                    messages.map((msg) => (
                        <ListItem key={msg.id} className={`message-item ${msg.fromMe ? "me" : "them"}`}>
                            <MessageBubble msg={msg} />
                        </ListItem>
                    ))
                }
            </List>
        </Box>
    );
};

export default React.memo(ChatMessages);
