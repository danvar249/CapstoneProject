import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './pages/Login'
import Connect from './pages/Connect'
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import CustomerManagement from './pages/CustomerManagement';
import ProductCatalog from './pages/ProductCatalog';
import Broadcast from './pages/Broadcast';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
      <Route path="login" element={<Login />} />
      <Route path="connect" element={<Connect />} />

        <Route path="/" element={<App />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="customer-management" element={<CustomerManagement />} />
          <Route path="product-catalog" element={<ProductCatalog />} />
          <Route path="broadcast" element={<Broadcast />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
