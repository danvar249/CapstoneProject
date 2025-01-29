const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const fs = require('fs');

let client = null; // WhatsApp client instance

// Initialize the WhatsApp client
const initializeClient = (io) => {
    try {
        console.log('Initializing WhatsApp client...');
        client = new Client({
            authStrategy: new LocalAuth(),
        });

        attachEventHandlers(client, io);
        client.initialize();
    } catch (err) {
        console.error('Error during client initialization:', err);
    }
};

// Attach event handlers to the client
const attachEventHandlers = (client, io) => {
    // QR Code generation for login
    client.on('qr', (qr) => {
        console.log('New QR Code generated');
        qrcode.toDataURL(qr, (err, url) => {
            if (!err) {
                io.emit('qrCode', url); // Send QR to all connected clients in real-time
            }
        });
    });

    // Client is ready
    client.on('ready', () => {
        console.log('WhatsApp is ready');
    });

    // Authentication successful
    client.on('authenticated', () => {
        console.log('WhatsApp client authenticated!');
    });

    client.on('change_state', (newState) => {
        console.log(`WhatsApp state changed: ${newState}`);
        io.emit('WA_ClientState', { clientState: newState });
    });

    // Authentication failure
    client.on('auth_failure', (message) => {
        console.error('Authentication failed:', message);
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

        setTimeout(() => initializeWhatsApp(io), 5000);
    });


    // Handle incoming messages
    client.on('message', (message) => {
        console.log(`Message received from ${message.from}: ${message.body}`);
        io.emit('incomingMessage', message);
    });

    // Handle client errors
    client.on('error', (error) => {
        console.error('An error occurred in WhatsApp client:', error);
    });
};


// Fetch all contacts
const getAllContacts = async () => {
    try {
        const contacts = await client.getContacts();
        return contacts.map((contact) => ({
            id: contact.id._serialized,
            name: contact.name || contact.pushname || contact.number,
            number: contact.number,
            isBusiness: contact.isBusiness,
            isMyContact: contact.isMyContact,
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
const getMessagesForChat = async (chatId, limit = 50) => {
    try {
        const chat = await client.getChatById(chatId);
        const messages = await chat.fetchMessages({ limit });
        return messages.map((msg) => ({
            id: msg.id.id,
            from: msg.from,
            body: msg.body,
            timestamp: msg.timestamp,
            senderName: msg._data.notifyName || msg.from,
        }));
    } catch (error) {
        console.error(`Error fetching messages for chat ${chatId}:`, error);
        throw error;
    }
};

// Check client state
const getClientState = async () => {
    try {
        const state = await client.getState();
        return state;
    } catch (error) {
        console.error('Error checking connection state:', error);
        return false;
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

// Export the required functionalities
module.exports = {
    getAllContacts,
    getChats,
    getMessagesForChat,
    initializeClient,
    getClientState,
    logoutClient,
    sendMessage,
};
