import React, { useEffect, useState } from 'react';
import { addSocketListener, removeSocketListener, socket } from '../utils/socket';
import { Box, Typography, CircularProgress } from '@mui/material';

const DisconnectedState: React.FC = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  useEffect(() => {
    const handleQrCodeUpdate = (qrDataUri: string) => {
      console.log('Received QR code');
      setQrCode(qrDataUri);
    };

    // Subscribe to QR Code updates (No need to listen to `clientState` separately)
    addSocketListener('qrCode', handleQrCodeUpdate);
    // ✅ If no QR code exists, request the latest one
    console.log("📡 Requesting latest QR code from server...");
    socket.emit("requestLatestQr");
    return () => {
      removeSocketListener('qrCode', handleQrCodeUpdate);
    };
  }, []);


  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      {!qrCode ? (
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
  );
};

export default DisconnectedState;
