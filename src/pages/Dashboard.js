import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from '../utils/axios';
import DisconnectedState from '../components/DisconnectedState';
import ChatWindow from '../components/ChatWindow';
import { Button } from '@mui/material';

const SERVER_ADDRESS = process.env.SERVER_URL || 'http://localhost:5000';
const socket = io(SERVER_ADDRESS, { transports: ['websocket', 'polling'] });

function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Request Notification Permission on Load
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // Listen for QR Code
    socket.on('qrCode', (qr) => {
      console.log('Received QR code from server');
      setQrCode(qr);
      setLoading(false);
      setErrorMessage(null); // ✅ Clear error when a new QR is received
    });

    // 📢 Listen for WhatsApp State Changes
    socket.on('WA_ClientState', (data) => {
      console.log('WhatsApp State:', data.clientState);

      switch (data.clientState) {
        case 'CONNECTED':
          setIsConnected(true);
          setLoading(false);
          setErrorMessage(null);
          break;

        case 'PAIRING':
          setLoading(true);
          break;

        case 'TIMEOUT':
          setLoading(false);
          setIsConnected(false);
          setErrorMessage('Connection timed out. Please try scanning the QR code again.');
          break;

        case 'PROXYBLOCK':
          setLoading(false);
          setIsConnected(false);
          setErrorMessage('Connection blocked due to proxy settings.');
          break;

        case 'TOS_BLOCK':
          setLoading(false);
          setIsConnected(false);
          setErrorMessage('WhatsApp Terms of Service block detected.');
          break;

        case 'SMB_TOS_BLOCK':
          setLoading(false);
          setIsConnected(false);
          setErrorMessage('WhatsApp Business Terms of Service block detected.');
          break;

        case 'UNPAIRED':
        case 'UNPAIRED_IDLE':
          setLoading(false);
          setIsConnected(false);
          setErrorMessage('WhatsApp session has been unpaired.');
          break;

        case 'UNLAUNCHED':
          setLoading(false);
          setIsConnected(false);
          setErrorMessage('WhatsApp client is not launched.');
          break;

        default:
          setLoading(false);
          setIsConnected(false);
          setErrorMessage(null);
          break;
      }
    });
    //  Listen for Incoming Messages (Browser Notifications)
    socket.on('incomingMessage', (message) => {
      console.log('Incoming Message:', message);

      // Show a browser notification
      if (Notification.permission === "granted") {
        new Notification("New WhatsApp Message", {
          body: `${message.from}: ${message.body}`,
          icon: "/whatsapp-icon.png"
        });
      }
    });

    return () => {
      socket.off('qrCode');
      socket.off('WA_ClientState');
      socket.off('incomingMessage');
    };
  }, []);

  // 📢 Handle Manual WhatsApp Disconnect
  const handleDisconnectWhatsApp = async () => {
    try {
      await axios.post('/whatsapp/logout');
      setIsConnected(false);
    } catch (error) {
      console.error('Error disconnecting from WhatsApp:', error);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', width: '70vw' }}>
      {isConnected ? (
        <>
          <ChatWindow />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleDisconnectWhatsApp}
            sx={{ position: 'absolute', top: 20, right: 20 }}
          >
            Disconnect WhatsApp
          </Button>
        </>
      ) : (
        <DisconnectedState qrCode={qrCode} loading={loading} errorMessage={errorMessage} />
      )}
    </div>
  );
}

export default Dashboard;
