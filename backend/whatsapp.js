const { Client, LocalAuth } = require('whatsapp-web.js');
const { classifyText } = require('./textClassifier');
const { Conversations } = require('./mongo'); // MongoDB model
const qrcode = require('qrcode');
const fs = require('fs');

let client = null; // WhatsApp client instance
let latestQrCode = null; // Latest QR code generated

// Initialize the WhatsApp client
const initializeClient = () => {
    try {
        console.log('Initializing WhatsApp client...');
        client = new Client({
            authStrategy: new LocalAuth(),
        });

        client.initialize();
    } catch (err) {
        console.error('Error during client initialization:', err);
    }
};

const attachEvents = (io) => {
    if (!client)
        return;
    client.on("qr", async (qr) => {
        console.log("📡 New QR Code received from WhatsApp");
        try {
            const qrUri = await qrcode.toDataURL(qr)
            latestQrCode = qrUri
            io.emit("qrCode", qrUri);
        } catch (error) {
            console.error("❌ Error generating QR code:", error);
        }
    });
    client.on("ready", () => {
        console.log("✅ WhatsApp Client is Ready");
        io.emit('WA_ready');
    });
    client.on("message", (message) => {
        console.log(`Message received from ${message.from}: ${message.body}`);
        io.emit('incomingMessage', message);
    });
    client.on("change_state", (newState) => {
        console.log(`📢 WhatsApp State Changed: ${newState}`);
        io.emit("WA_ClientState", newState);
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
    });
}
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
    if (!client)
        return;
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
        await client.sendMessage(`${phoneNumber}@c.us`, message);
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
    attachEvents
};


