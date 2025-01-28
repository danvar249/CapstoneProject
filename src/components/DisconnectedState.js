import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const DisconnectedState = ({ qrCode }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh', // Full screen height
        backgroundColor: '#f7f7f7',
        overflow: 'hidden', // Prevent scrolling
        padding: '20px',
        boxSizing: 'border-box', // Include padding in height calculation
      }}
    >
      <Typography variant="h4" gutterBottom>
        Connect to WhatsApp
      </Typography>
      {qrCode ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            maxWidth: '300px',
          }}
        >
          <img
            src={qrCode}
            alt="WhatsApp QR Code"
            style={{
              width: '250px',
              height: '250px',
              marginBottom: '20px',
            }}
          />
          <Typography variant="body1" color="textSecondary" align="center">
            Open WhatsApp on your phone and scan this QR code to connect.
          </Typography>
        </Box>
      ) : (
        <CircularProgress />
      )}
      <Typography
        variant="body2"
        color="textSecondary"
        align="center"
        sx={{ marginTop: 3 }}
      >
        Use your phone to scan the code. Go to WhatsApp {'>'} Settings {'>'} Linked Devices.
      </Typography>
    </Box>
  );
};

export default DisconnectedState;
