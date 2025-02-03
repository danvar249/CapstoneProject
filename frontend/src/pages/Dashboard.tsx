import React, { useEffect, useState, useContext } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import ChatWindow from "../components/ChatWindow";
import axios from "../utils/axios";
import { WhatsAppContext } from "../WhatsAppContext";
import { addSocketListener, removeSocketListener, socket } from "../utils/socket";

const Dashboard: React.FC = () => {
  // const { clientState, setClientState } = useContext(WhatsappContext);
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const [isConnected, setIsConnected] = useState(false);
  const [clientState, setClientState] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const context = useContext(WhatsAppContext)

  const handleWA_Ready = () => {
    setIsConnected(true);
    setIsLoading(false);
  }
  useEffect(() => {
    addSocketListener("WA_ready", handleWA_Ready);
    return () => {
      removeSocketListener("WA_ready", handleWA_Ready);
    }
  }, [handleWA_Ready]);
  useEffect(() => {
    if (context?.qrCode) {
      setQrCode(context.qrCode);
    }
  }, [context?.qrCode]);
  useEffect(() => {
    if (context?.state) {
      console.log(context.state)
      setIsConnected(context.state === "CONNECTED");
    }
  }, [context?.state]);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/whatsapp/state');
      setIsConnected(response.data.clientState === "CONNECTED");

    } catch (error) {
      console.error('Error checking connection status:', error);
    }
    setIsLoading(false)
  };
  useEffect(() => {
    checkConnection()
  }, [])

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
      {isConnected ? (
        <ChatWindow />
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          {!qrCode || isLoading ? (
            <>
              <CircularProgress />
            </>
          ) : (
            <>
              <Typography variant="h5" gutterBottom>
                Scan QR Code to Connect
              </Typography>
              <img src={qrCode} alt="WhatsApp QR Code" style={{ width: '300px', height: '300px' }} />
              <Typography variant="body1" color="textSecondary" sx={{ marginTop: 2 }}>
                Open WhatsApp on your phone, go to Settings &gt; Linked Devices, and scan the QR code.
              </Typography>
            </>
          )}
        </Box>
      )}
    </div>
  );
}

export default Dashboard;

