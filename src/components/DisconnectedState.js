import React from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

const DisconnectedState = ({ qrCode, loading, errorMessage }) => {
  return (
    <Box
      // sx={{
      //   display: 'flex',
      //   flexDirection: 'column',
      //   alignItems: 'center',
      //   justifyContent: 'center',
      //   height: '100vh', // Full screen height
      //   backgroundColor: '#f7f7f7',
      //   overflow: 'hidden', // Prevent scrolling
      //   padding: '20px',
      //   boxSizing: 'border-box', // Include padding in height calculation
      // }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
      }}
    >
      {errorMessage ? (
        <>
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {errorMessage}
          </Alert>
          <Typography variant="body2" color="textSecondary">
            Please refresh or try scanning the QR code again.
          </Typography>
        </>
      ) : loading ? (
        <>
          <CircularProgress />
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Connecting to WhatsApp...
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please wait while we establish the connection.
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            Connect to WhatsApp
          </Typography>
          {qrCode ? (
            <img src={qrCode} alt="WhatsApp QR Code" style={{ width: '300px', height: '300px' }} />
          ) : (
            <Typography variant="body2" color="textSecondary">
              Waiting for QR code...
            </Typography>
          )}
          <Typography variant="body1" color="textSecondary" sx={{ marginTop: 2 }}>
            Scan this QR code using your WhatsApp app to connect.
          </Typography>
        </>
      )}
    </Box>
  );
};

export default DisconnectedState;
