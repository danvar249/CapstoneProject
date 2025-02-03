import { io, Socket } from 'socket.io-client';

const SERVER_ADDRESS = process.env.SERVER_URL || 'http://localhost:5000';

// ✅ Initialize WebSocket connection
const socket: Socket = io(SERVER_ADDRESS, {
    transports: ["websocket", "polling"], // Ensure WebSockets work even with fallback
    reconnectionAttempts: 5, // Try to reconnect 5 times if disconnected
    reconnectionDelay: 3000,  // Delay 3 seconds before retrying
});

// Track Active Listeners to Prevent Duplicates
const activeListeners: Set<string> = new Set();

console.log('📡 WebSocket initialized');

// Log connection state changes
socket.on("connect", () => console.log("🟢 WebSocket connected"));
socket.on("disconnect", () => console.log("🔴 WebSocket disconnected"));
socket.on("connect_error", (error) => console.error("⚠️ WebSocket connection error:", error));

//  Function to add event listeners dynamically
const addSocketListener = (eventName: string, callback: (...args: any[]) => void) => {
    if (!activeListeners.has(eventName)) {
        socket.on(eventName, callback);
        activeListeners.add(eventName);
        console.log(`Listener added for event: ${eventName}`);
    } else {
        console.warn(`Listener for event '${eventName}' already exists.`);
    }
};

// Function to remove event listeners when unmounting
const removeSocketListener = (eventName: string, callback: (...args: any[]) => void) => {
    if (activeListeners.has(eventName)) {
        socket.off(eventName, callback);
        activeListeners.delete(eventName);
        console.log(`Listener removed for event: ${eventName}`);
    } else {
        console.warn(`No active listener found for event '${eventName}'.`);
    }
};

// Function to disconnect WebSocket
const disconnectSocket = () => {
    console.log('🔌 Disconnecting WebSocket...');
    socket.disconnect();
};

// Function to reconnect WebSocket
const reconnectSocket = () => {
    if (!socket.connected) {
        console.log('🔄 Reconnecting WebSocket...');
        socket.connect();
    }
};

// Function to check WebSocket connection status
const isSocketConnected = (): boolean => socket.connected;


export { socket, addSocketListener, removeSocketListener, disconnectSocket, reconnectSocket, isSocketConnected };
