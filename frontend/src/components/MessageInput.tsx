import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";

interface MessageInputProps {
    onSendMessage: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
    const [newMessage, setNewMessage] = useState("");

    return (
        <Box className="message-input-container">
            <TextField fullWidth variant="outlined" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
            <Button variant="contained" onClick={() => { onSendMessage(newMessage); setNewMessage(""); }}>
                Send
            </Button>
        </Box>
    );
};

export default React.memo(MessageInput);
