import React, { createContext, useEffect, useState, useCallback } from "react";
import { socket, addSocketListener, removeSocketListener } from "./utils/socket"; // Use the existing WebSocket instance

// ✅ Define context type
interface WhatsAppContextType {
    qrCode: string | null;
    state: string | null;
}

// ✅ Create Context
export const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [state, setState] = useState<string | null>(null);
    // ✅ Function to handle WhatsApp events
    const handleQRCode = useCallback((qrImage: string) => {
        setQrCode(qrImage);
    }, []);
    const handleState = useCallback((state: string) => {
        setState(state);
    }, []);
    useEffect(() => {
        console.log("📡 Listening for WhatsApp events...");
        addSocketListener("qrCode", handleQRCode);
        addSocketListener("WA_ClientState", handleState);

        // ✅ Request current WhatsApp state when connecting
        console.log("📡 Requesting initial WhatsApp state...");
        socket.emit("whatsappClientState");

        return () => {
            console.log("❌ Removing WhatsApp event listeners");
            removeSocketListener("qrCode", handleQRCode);
            removeSocketListener("WA_ClientState", handleState);
        };
    }, [handleQRCode, handleState]);

    return (
        <WhatsAppContext.Provider value={{ qrCode, state }}>
            {children}
        </WhatsAppContext.Provider>
    );
};
