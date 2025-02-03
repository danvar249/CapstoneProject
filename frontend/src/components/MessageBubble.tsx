import React from "react";
import { Box, Typography } from "@mui/material";
import { Message } from "../types";

interface MessageBubbleProps {
    msg: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ msg }) => (
    <Box className={`message-bubble ${msg.fromMe ? "me" : "them"}`}
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
        <Typography sx={{ display: "block", textAlign: "right", marginTop: 0.5, fontSize: "0.75rem", color: "#999" }}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Typography>
    </Box>
);

export default React.memo(MessageBubble);
