import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Alert, CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
const logo = require("../logo.png");

function Login() {
  const [userName, setUserName] = useState('');
  const [userPass, setUserPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/login', { userName, userPass });

      // Save user information in localStorage
      localStorage.setItem('user', JSON.stringify({
        userId: response.data.userId,
        userName: response.data.userName,
        role: response.data.role,
      }));


    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }

    // Navigate to the dashboard
    navigate('/dashboard');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center', boxShadow: 3, borderRadius: 2, p: 3, bgcolor: 'background.paper', width: { xs: '90%', sm: '75%', md: '50%' } }}>
      <Box sx={{ mb: 3 }}>
        <img src={logo} alt="ShopLINK Logo" style={{ width: '100px', height: 'auto' }} />
      </Box>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'green' }}>
        ShopLINK
      </Typography>
      <Typography variant="h5" gutterBottom>
        Welcome Back! Please Sign In
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        label="Username"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        fullWidth
        margin="normal"
        variant="outlined"
      />
      <TextField
        label="Password"
        type="password"
        value={userPass}
        onChange={(e) => setUserPass(e.target.value)}
        fullWidth
        margin="normal"
        variant="outlined"
      />

      <Button
        variant="contained"
        color="success"
        fullWidth
        onClick={handleLogin}
        disabled={loading}
        sx={{ mt: 3, py: 1.5, fontSize: '1rem' }}
      >
        {loading ? <CircularProgress size={24} /> : 'Sign In'}
      </Button>
    </Container>
  );
}

export default Login;
