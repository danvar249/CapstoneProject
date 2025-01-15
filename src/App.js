import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemText, Container } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import logo from './logo.png'; // Importing the logo

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        ShopLINK
      </Typography>
      <List>
        <ListItem button component={Link} to="/dashboard">
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/analytics">
          <ListItemText primary="Analytics" />
        </ListItem>
        <ListItem button component={Link} to="/customer-management">
          <ListItemText primary="Customer Management" />
        </ListItem>
        <ListItem button component={Link} to="/product-catalog">
          <ListItemText primary="Product Catalog" />
        </ListItem>
        <ListItem button component={Link} to="/broadcast">
          <ListItemText primary="Broadcast" />
        </ListItem>
        <ListItem button onClick={handleLogout}>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <div>
      <AppBar position="fixed" sx={{ bgcolor: 'green' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
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
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Container maxWidth="md" sx={{ mt: 10, textAlign: 'center' }}>
        {location.pathname === '/' && (
          <Box sx={{ mb: 4 }}>
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
      </Container>
      <Box sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </div>
  );
}

export default App;
