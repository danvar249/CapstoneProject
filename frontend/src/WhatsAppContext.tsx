import React, { createContext, useEffect, useState, useCallback } from "react";
import { io, Socket } from 'socket.io-client';
import axios from "./utils/axios";

// ✅ Define context type
interface WhatsAppContextType {
    qrCode: string | null;
    state: string | null;
}

// ✅ Create Context
export const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

const SERVER_ADDRESS = process.env.SERVER_URL || 'http://localhost:5000';

// ✅ Initialize WebSocket connection
const socket: Socket = io(SERVER_ADDRESS, {
    transports: ["websocket", "polling"], // Ensure WebSockets work even with fallback
    reconnectionAttempts: 5, // Try to reconnect 5 times if disconnected
    reconnectionDelay: 3000,  // Delay 3 seconds before retrying
});

export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [state, setState] = useState<string | null>(null);
    // ✅ Function to handle WhatsApp events
    const handleQRCode = useCallback((qrImage: string) => {
        console.log("📡 Received QR Code:", qrImage);
        setQrCode(qrImage);
    }, []);
    const handleState = useCallback((clientState: string) => {
        console.log("📡 WhatsApp Client State:", clientState);
        setState(clientState);
        if (clientState === "LOADING" && qrCode === null)
            socket.emit("getQr");
    }, []);
    const handleReady = useCallback(() => {
        console.log("📡 WhatsApp ready");
        setState("CONNECTED");
    }, []);
    const handleIncomingMessage = useCallback(async (message: any) => {
        console.log("📥 New Message Received:", message);

        // ✅ Attempt to classify the message if it's from a customer
        const phoneNumber = message.from.split("@")[0];

        try {
            const res = await axios.get(`/customer/${phoneNumber}`);
            if (res.status === 200) {
                console.log("✅ Customer exists. Classifying message...");
                await axios.post("/classify", {
                    phoneNumber,
                    messages: [message],
                });
                console.log("📤 Sent message to /classify.");
            }
        } catch (error) {
            console.error("❌ Error classifying incoming message:", error);
        }
    }, []);

    useEffect(() => {
        console.log("📡 Connecting to WhatsApp WebSocket...");

        // ✅ Attach Listeners
        socket.on("qrCode", handleQRCode);
        socket.on("WA_ClientState", handleState);
        socket.on("WA_ready", handleReady)
        socket.on("incomingMessage", handleIncomingMessage);

        // ✅ Request current WhatsApp state when connecting
        console.log("📡 Requesting initial WhatsApp state...");
        socket.emit("whatsappClientState");

        return () => {
            console.log("❌ Removing WhatsApp event listeners");
            socket.off("qrCode", handleQRCode);
            socket.off("WA_ClientState", handleState);
            socket.off("WA_ready", handleReady)
            socket.off("incomingMessage", handleIncomingMessage);
        };
    }, [handleQRCode, handleState]);

    return (
        <WhatsAppContext.Provider value={{ qrCode, state }}>
            {children}
        </WhatsAppContext.Provider>
    );
};
