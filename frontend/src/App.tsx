import React, { useEffect, useContext } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Box, Snackbar, Alert, Button } from "@mui/material";
import axios from "./utils/axios";
import { WhatsAppContext } from "./WhatsAppContext";
import QRCodeDisplay from "./components/QRCodeDisplay";
const logo = require("./logo.png");

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { qrCode, state } = useContext(WhatsAppContext) || {};

  useEffect(() => {
    const userDataString = localStorage.getItem('user');
    const userData = userDataString ? JSON.parse(userDataString) : null;
    if (!userData) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    try {
      axios.post('/logout')
    }
    catch (error) {

    }
    navigate('/login');
  };

  return (
    <Box>
      <AppBar position="fixed" sx={{ bgcolor: 'green' }}>
        <Toolbar>
          <Box component="img" src={logo} alt="ShopLINK Logo" sx={{ width: 40, height: 40, mr: 2 }} />
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'white' }}>
            ShopLINK
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Button color="inherit" component={Link} to="/">Home</Button>

            <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
            <Button color="inherit" component={Link} to="/broadcast">Broadcast</Button>

            <Button color="inherit" component={Link} to="/product-catalog">Product Catalog</Button>
            <Button color="inherit" component={Link} to="/analytics">Analytics</Button>
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
        {state !== "CONNECTED" && (location.pathname === "/dashboard" || location.pathname === "/broadcast") ? <QRCodeDisplay qrCode={qrCode || ""} clientState={state || ""} /> : <Outlet />}
      </Box>
    </Box >
  );
}

export default App;
