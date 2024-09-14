import React, { useEffect } from 'react';
import { Container, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Connect() {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate('/dashboard/overview');
    }, 2000); // Simulate a connection delay
  }, [navigate]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>Connecting with WhatsApp...</Typography>
      <CircularProgress />
    </Container>
  );
}

export default Connect;
