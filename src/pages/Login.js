import React from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { sendWhatsAppMessage } from './whatsapp.ts';

function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    console.log('sending')
    await sendWhatsAppMessage('972585272419')
    console.log('sent')
    navigate('/connect');
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>Sign In</Typography>
      <TextField label="User" fullWidth margin="normal" />
      <TextField label="Password" type="password" fullWidth margin="normal" />
      <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>
        Sign In
      </Button>
    </Container>
  );
}

export default Login;
