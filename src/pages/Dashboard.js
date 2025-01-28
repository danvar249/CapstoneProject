import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import DisconnectedState from '../components/DisconnectedState';
import ChatWindow from '../components/ChatWindow';

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  // Fetch QR code from the server
  const fetchQrCode = async () => {
    try {
      const response = await axios.get('/whatsapp/qr');
      if (response.data.qr) {
        setQrCode(response.data.qr);
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
    }
  };

  // Check connection status with WhatsApp
  const checkConnection = async () => {
    try {
      const response = await axios.get('/whatsapp/state');
      if (response.data.clientState === 'CONNECTED') {
        setIsConnected(true);
        setIsLoading(false); // Stop loading when connected
      } else {
        setIsConnected(false);
        await fetchQrCode(); // Fetch QR code if not connected
        setIsLoading(false); // Stop loading
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      setIsLoading(false);
    }
  };

  // Poll connection state every few seconds until connected
  useEffect(() => {
    checkConnection();
    const interval = setInterval(() => {
      if (!isConnected) {
        checkConnection();
      } else {
        clearInterval(interval); // Stop polling once connected
      }
    }, 5000);

    return () => clearInterval(interval); // Clean up interval on component unmount
  }, [isConnected]);

  // Loading spinner while determining connection state
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <h2>Loading...</h2>
      </div>
    );
  }

  // Render content in a full-screen container
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
      {isConnected ? <ChatWindow /> : <DisconnectedState qrCode={qrCode} />}
    </div>
  );
}

export default Dashboard;
