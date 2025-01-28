import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box} from '@mui/material';
import logo from './logo.png'; // Importing the logo

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <Box>
      <AppBar position="fixed"  sx={{ bgcolor: 'green' }}>
        <Toolbar>
          <Box component="img" src={logo} alt="ShopLINK Logo" sx={{ width: 40, height: 40, mr: 2 }} />
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'white' }}>
            ShopLINK
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
            <Button color="inherit" component={Link} to="/analytics">Analytics</Button>
            <Button color="inherit" component={Link} to="/customer-management">Customer Management</Button>
            <Button color="inherit" component={Link} to="/product-catalog">Product Catalog</Button>
            <Button color="inherit" component={Link} to="/broadcast">Broadcast</Button>
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#f5f5f5',
          height: '98vh',
          }}
      >
        {location.pathname === '/' && (
          <Box sx={{ height: '80vh', textAlign: 'center', paddingTop: '10vh' }}>
            <img
              src={logo}
              alt="ShopLINK Logo"
              style={{ width: '512px', height: '512px', marginBottom: '16px' }}
            />
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'green' }}>
              Welcome to ShopLINK
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Your one-stop solution for business management.
            </Typography>
          </Box>
        )}
        <Outlet />
      </Box>
    </Box>
  );
}

export default App;
