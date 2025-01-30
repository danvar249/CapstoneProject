const { Client, LocalAuth } = require('whatsapp-web.js');
const { classifyText } = require('./textClassifier');
const { Conversations } = require('./mongo'); // MongoDB model
const fs = require('fs');

let client = null; // WhatsApp client instance
let latestQrCode = null; // Latest QR code generated

// Initialize the WhatsApp client
const initializeClient = (io) => {
    try {
        console.log('Initializing WhatsApp client...');
        client = new Client({
            authStrategy: new LocalAuth(),
        });
        client.on("qr", (qr) => {
            console.log("📌 New QR Code generated");
            latestQrCode = qr; // Store latest QR but do NOT emit here
        });
        client.on("ready", () => {
            console.log("✅ WhatsApp Client is Ready");
            latestQrCode = null; // Clear stored QR when connected
        });
        // Handle client errors
        client.on('error', (error) => {
            console.error('An error occurred in WhatsApp client:', error);
        });
        // Client disconnected
        client.on('disconnected', async (reason) => {
            console.log(`WhatsApp Disconnected. Reason: ${reason}`);
            if (reason === 'LOGOUT') {
                console.log('User logged out. Restarting client...');
                // await client.logout().catch(err => console.error('Error logging out:', err));
                client = null;
            } else {
                console.log('Restarting WhatsApp client...');
            }
            client.initialize();
        });
        client.initialize();
    } catch (err) {
        console.error('Error during client initialization:', err);
    }
};


// Fetch all contacts
const getAllContacts = async () => {
    try {
        const contacts = await client.getContacts();
        return contacts.map((contact) => ({
            id: contact.id._serialized,
            name: contact.name || contact.pushname || contact.number,
            number: contact.number,
        }));
    } catch (error) {
        console.error('Error fetching contacts:', error);
        throw error;
    }
};

// Fetch all chats
const getChats = async () => {
    try {
        const chats = await client.getChats();
        return chats.map((chat) => ({
            id: chat.id._serialized,
            name: chat.name || chat.id.user,
            isGroup: chat.isGroup,
            lastMessage: chat.lastMessage?.body || null,
            unreadCount: chat.unreadCount || 0,
        }));
    } catch (error) {
        console.error('Error fetching chats:', error);
        throw error;
    }
};

// Fetch messages for a specific chat
const getMessagesForChat = async (chatId, userId, limit = 50) => {
    try {
        // ✅ Find or create conversation
        console.log(`🔍 Fetching messages for chatId: ${chatId}, userId:${userId}`);

        const chat = await client.getChatById(chatId);
        if (!chat) throw new Error(`Chat ${chatId} not found`);

        const messages = await chat.fetchMessages({ limit });
        const formattedMessages = messages.map(msg => ({
            id: msg.id.id,
            from: msg.from,
            body: msg.body.trim(),
            timestamp: msg.timestamp,
            fromMe: msg.fromMe,
        }));
        return formattedMessages;

    } catch (error) {
        console.error(`❌ Error fetching messages for chat ${chatId}:`, error);
        throw error;
    }
};



//Send message
const sendMessage = async (phoneNumber, message) => {
    try {
        await whatsapp.client.sendMessage(`${phoneNumber}@c.us`, message);
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
};

// Safely destroy the client instance (emergency only)
const safeDestroyClient = async () => {
    try {
        if (client) {
            console.log('Destroying the client instance...');
            await client.destroy();
            // Remove any residual session files if necessary
            const sessionPath = './.wwebjs_auth/session/Default';
            if (fs.existsSync(sessionPath)) {
                console.log('Cleaning up session files...');
                fs.rmSync(sessionPath, { recursive: true, force: true });
            }
            console.log('Client instance destroyed successfully.');
        }
    } catch (error) {
        console.error('Error during safe client destruction:', error);
    }
};

// Restart the client safely
const restartClient = async () => {
    try {
        console.log('Restarting WhatsApp client...');
        if (client) {
            await safeDestroyClient();
        }
        initializeClient();
    } catch (error) {
        console.error('Error during client restart:', error);
    }
};

const logoutClient = async (req, res) => {
    try {
        if (client) {
            await client.logout();
            res.status(200).json({ success: true, message: 'WhatsApp disconnected successfully' });
        } else {
            res.status(400).json({ error: 'Client is not initialized' });
        }
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Failed to disconnect WhatsApp' });
    }
};

const getLatestQrCode = () => latestQrCode;
const getClient = () => client;

// Export the required functionalities
module.exports = {
    getAllContacts,
    getMessagesForChat,
    initializeClient,
    logoutClient,
    sendMessage,
    getLatestQrCode,
    getClient,
    getChats,
};


