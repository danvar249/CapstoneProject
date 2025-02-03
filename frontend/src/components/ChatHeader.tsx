import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, Button } from "@mui/material";
import React, { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "../styles/ChatHeader.css";

interface ChatHeaderProps {
    chatName: string;
    customerExists: boolean;
    customerClassifications: string[];
    role: string;
    handleRegisterCustomer: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chatName, customerExists, customerClassifications, role, handleRegisterCustomer }) => {
    const [expanded, setExpanded] = useState(false);

    return <Box className="chat-header">
        <Typography variant="h6">{chatName}</Typography>
        {customerExists ? (
            <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Customer Interests</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ maxHeight: "200px", overflowY: "auto" }}>
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
        ) : role === "manager" ?
            (
                <Button variant="contained" sx={{ marginLeft: "auto", bgcolor: "red" }} onClick={handleRegisterCustomer}>
                    Register Customer
                </Button>
            ) : <></>}

    </Box>;
}
export default React.memo(ChatHeader);
