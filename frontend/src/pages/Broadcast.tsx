import React, { useState, useEffect, useContext } from "react";
import { Typography, TextField, Button, Box, Autocomplete } from "@mui/material";
import axios from "../utils/axios"; // ✅ Ensure axios is configured with base API URL
import { WhatsAppContext } from "../WhatsAppContext";
import QRCodeDisplay from "../components/QRCodeDisplay";

function BroadcastMessages() {
    // ✅ State for tags and customers
    const [tags, setTags] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [allCustomers, setAllCustomers] = useState<{ id: string, name: string, number: string }[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<{ id: string, name: string, number: string }[]>([]);
    const [selectedCustomers, setSelectedCustomers] = useState<{ id: string, name: string, number: string }[]>([]);
    const [message, setMessage] = useState("");
    const [clientState, setClientState] = useState<string>("");
    const context = useContext(WhatsAppContext)

    useEffect(() => {
        if (context?.state) {
            setClientState(context.state)
        }
    }, [context?.state]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                // ✅ Fetch all tags
                const tagsResponse = await axios.get("/tags");
                setTags(tagsResponse.data.map((tag: { name: string }) => tag.name));

                // ✅ Fetch all customers
                const customersResponse = await axios.get("/customer_profiles");
                setAllCustomers(customersResponse.data);
                setFilteredCustomers(customersResponse.data); // ✅ Show all customers initially
            } catch (error) {
                console.error("❌ Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    // ✅ Fetch customers when tags are selected
    const handleTagChange = async (event: any, newTags: string[]) => {
        setSelectedTags(newTags);

        if (newTags.length === 0) {
            setFilteredCustomers(allCustomers); // ✅ Show all customers if no tags are selected
            return;
        }

        try {
            // ✅ Fetch customers who have the selected tags
            const response = await axios.post("/customers/by-tags", { tags: newTags });
            setFilteredCustomers(response.data);
        } catch (error) {
            console.error("❌ Error fetching customers:", error);
        }
    };

    // ✅ Handle broadcast message sending
    const handleSendBroadcast = async () => {
        if (selectedCustomers.length === 0 || !message.trim()) {
            alert("Please enter a message and select at least one customer.");
            return;
        }

        try {
            console.log(selectedCustomers);
            await axios.post("/whatsapp/send-broadcast", {
                customers: selectedCustomers.map(c => ({ number: c.number })), // ✅ Send customer ID & number
                message
            });

            alert(`✅ Broadcast message sent to: ${selectedCustomers.map(c => c.name).join(", ")}`);

            // ✅ Clear form after sending
            setMessage("");
            setSelectedTags([]);
            setSelectedCustomers([]);
        } catch (error) {
            console.error("❌ Error sending broadcast:", error);
            alert("Failed to send broadcast.");
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 4 }}>
            <Box sx={{ width: "100%", maxWidth: "800px" }}>
                <Typography variant="h4" gutterBottom>Send Broadcast Message</Typography>

                {/* ✅ Message Input */}
                <TextField
                    label="Message"
                    multiline
                    rows={4}
                    fullWidth
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{ marginBottom: 3 }}
                />

                {/* ✅ Tag Selection */}
                <Autocomplete
                    multiple
                    options={tags} // ✅ Fetched from API
                    value={selectedTags}
                    onChange={handleTagChange}
                    renderInput={(params) => (
                        <TextField {...params} variant="outlined" label="Select Tags" placeholder="Choose tags" />
                    )}
                    sx={{ marginBottom: 3 }}
                />

                {/* ✅ Customer Selection */}
                <Autocomplete
                    multiple
                    options={filteredCustomers}
                    getOptionLabel={(customer) => `${customer.name} (${customer.number})`}
                    value={selectedCustomers}
                    onChange={(event, newCustomers) => setSelectedCustomers(newCustomers)}
                    renderInput={(params) => (
                        <TextField {...params} variant="outlined" label="Select Customers" placeholder="Select customers" />
                    )}
                    sx={{ marginBottom: 3 }}
                />

                {/* ✅ Send Broadcast Button */}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSendBroadcast}
                    disabled={!message.trim() || selectedCustomers.length === 0}
                >
                    Send Broadcast
                </Button>
            </Box>
        </Box>
    );
}

export default BroadcastMessages;
