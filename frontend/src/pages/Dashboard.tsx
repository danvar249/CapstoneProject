import React, { useEffect, useState, useContext } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
// import { WhatsappContext, WhatsappState } from "../context/WhatsappContext";
import { addSocketListener, removeSocketListener, socket } from "../utils/socket";
import DisconnectedState from "../components/DisconnectedState";
import ChatWindow from "../components/ChatWindow";
import axios from "../utils/axios";

const Dashboard: React.FC = () => {
  // const { clientState, setClientState } = useContext(WhatsappContext);
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const [isConnected, setIsConnected] = useState(false);
  const [clientState, setClientState] = useState<any>(null);

  // Check connection status with WhatsApp
  const checkConnection = async () => {
    try {
      const response = await axios.get('/whatsapp/state');
      setIsConnected(response.data.clientState === "CONNECTED");

    } catch (error) {
      console.error('Error checking connection status:', error);
    }
    setIsLoading(false); // Stop loading

  };

  useEffect(() => {
    console.log("📡 Connecting to WhatsApp...");

    const handleWhatsAppStateChange = (data: { clientState: any }) => {
      console.log(`🔄 WhatsApp State Changed: ${data.clientState}`);
      setClientState(data.clientState);

      console.log(data.clientState)
      setClientState(data.clientState);
    };

    // ✅ Attach socket listeners
    addSocketListener("WA_ClientState", handleWhatsAppStateChange);
    console.log("📡 Requesting initial WhatsApp state...");
    socket.emit('whatsappClientState'); // ✅ Request initial state

    return () => {
      removeSocketListener("WA_ClientState", handleWhatsAppStateChange);
    };
  }, [setClientState]);

  // useEffect(() => {
  //   if ("Notification" in window && Notification.permission !== "granted") {
  //     Notification.requestPermission();
  //   }
  // }, []);

  // useEffect(() => {
  //    // ✅ WebSocket Connected
  //    socket.on('connect', () => {
  //     console.log('✅ Connected to WebSocket');
  //   });

  //   // ✅ WebSocket Connection Error
  //   socket.on('connect_error', (err) => {
  //     console.error('❌ WebSocket Connection Error:', err);
  //     setErrorMessage('WebSocket connection failed.');
  //   });

  //   // Listen for QR Code
  //   socket.on('qrCode', (qr) => {
  //     console.log('Received QR code from server');
  //     setQrCode(qr);
  //     setLoading(false);
  //     setErrorMessage(null); // ✅ Clear error when a new QR is received
  //   });

  //   // 📢 Listen for WhatsApp State Changes
  //   socket.on('WA_ClientState', (data) => {

  //   });
  //   //  Listen for Incoming Messages (Browser Notifications)
  //   socket.on('incomingMessage', (message) => {
  //     console.log('Incoming Message:', message);
  //     // TODO: Handle classification of incoming messages and updating them in DB
  //     // Show a browser notification
  //     if (Notification.permission === "granted") {
  //       new Notification("New WhatsApp Message", {
  //         body: `${message.from}: ${message.body}`,
  //         icon: "/whatsapp-icon.png"
  //       });
  //     }
  //   });

  //   return () => {
  //     socket.off('connect');
  //     socket.off('connect_error');
  //     socket.off('qrCode');
  //     socket.off('WA_ClientState');
  //     socket.off('incomingMessage');
  //   };
  // }, []);

  // 📢 Handle Manual WhatsApp Disconnect


  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isConnected ? '#f5f5f5' : '#f7f7f7',
        height: '80vh',
        width: '70vw',
      }}
    >
      {clientState === "CONNECTED" ? <ChatWindow /> : <DisconnectedState />}
    </div>
  );
}

export default Dashboard;
