const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

console.log('Initializing WhatsApp client...');
const client = new Client({
    authStrategy: new LocalAuth()
});
let latestQrCode = null; // Latest QR code generated
let io = null;

client.on("qr", async (qr) => {
    console.log("📡 New QR Code received from WhatsApp");
    try {
        const qrUri = await qrcode.toDataURL(qr)
        latestQrCode = qrUri
        io?.emit("qrCode", qrUri);
    } catch (error) {
        console.error("❌ Error generating QR code:", error);
    }
});
client.on("ready", () => {
    console.log("✅ WhatsApp Client is Ready");
    io?.emit('WA_ready', "READY");
});
client.on("message", (message) => {
    console.log(`Message received from ${message.from}: ${message.body}`);
    io?.emit('incomingMessage', message);
});
client.on("change_state", (newState) => {
    console.log(`📢 WhatsApp State Changed: ${newState}`);
    io?.emit("WA_ClientState", newState);
});

const attachSocket = (socket) => {
    io = socket;
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


client.initialize();

const getLatestQrCode = () => latestQrCode;
const getClient = () => client;

// Export the required functionalities
module.exports = {
    getAllContacts,
    getMessagesForChat,
    sendMessage,
    getLatestQrCode,
    getClient,
    getChats,
    attachSocket
};


