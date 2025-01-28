const QRCode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');
const EventEmitter = require('events');
const fs = require('fs');

// Create an event emitter for QR code updates
const qrEmitter = new EventEmitter();

let qrCode = null; // Store QR code for login
let client = null; // WhatsApp client instance

// Initialize the WhatsApp client
const initializeClient = () => {
    try {
        console.log('Initializing WhatsApp client...');
        client = new Client({
            authStrategy: new LocalAuth(),
        });

        attachEventHandlers(client);
        client.initialize();
    } catch (err) {
        console.error('Error during client initialization:', err);
    }
};

// Attach event handlers to the client
const attachEventHandlers = (client) => {
    // QR Code generation for login
    client.on('qr', (qr) => {
        console.log('QR code generated. Scan it to log in.');
        qrCode = qr;
        // qrEmitter.emit('qrUpdated', qr); // Notify listeners about the QR code update
        // qrcode.generate(qr, { small: true }); // Log QR code to the console
    });

    // Client is ready
    client.on('ready', () => {
        console.log('WhatsApp client is ready!');
    });

    // Authentication successful
    client.on('authenticated', () => {
        console.log('WhatsApp client authenticated!');
        qrCode = null; // Clear QR code as it's no longer needed
    });

    // Authentication failure
    client.on('auth_failure', (message) => {
        console.error('Authentication failed:', message);
    });

    // Client disconnected
    client.on('disconnected', async (reason) => {
        console.error('WhatsApp client disconnected. Reason:', reason);

        if (reason === 'LOGOUT') {
            console.log('Client logged out. Attempting to clean up and reconnect...');
            try {
                await client.logout(); // Use logout for standard cleanup
                console.log('Client logged out successfully.');
            } catch (error) {
                console.error('Error during logout:', error);
                console.log('Falling back to destroy the client instance...');
                await safeDestroyClient(); // Emergency cleanup
            }

            // Reinitialize after ensuring cleanup
            setTimeout(() => {
                console.log('Reinitializing WhatsApp client...');
                initializeClient();
            }, 5000); // Reinitialize after 5 seconds
        }
    });

    // Handle incoming messages
    client.on('message', (message) => {
        console.log(`Message received from ${message.from}: ${message.body}`);
    });

    // Handle client errors
    client.on('error', (error) => {
        console.error('An error occurred in WhatsApp client:', error);
    });

    // Log all state changes
    client.on('change_state', (state) => {
        console.log('Client state changed to:', state);
    });
};

const getEncodedQrCode = async () => {
    if (!qrCode) return null; // If no QR code is available, return null
    try {
        // Generate QR code as a data URI (Base64-encoded PNG)
        const dataUri = await QRCode.toDataURL(qrCode);
        return dataUri; // Return encoded QR code
    } catch (error) {
        console.error('Error encoding QR code:', error);
        return null;
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

// Start the client
initializeClient();

// Export the required functionalities
module.exports = {
    getEncodedQrCode,
    getAllContacts,
    getChats,
    getMessagesForChat,
    initializeClient,
    getClientState,
};
