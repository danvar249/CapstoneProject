import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './pages/Login'
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import ProductCatalog from './pages/ProductCatalog';
import Broadcast from './pages/Broadcast';
import { WhatsAppProvider } from './WhatsAppContext';

ReactDOM.render(
  <React.StrictMode>
    <WhatsAppProvider>
      <Router>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="/" element={<App />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="product-catalog" element={<ProductCatalog />} />
            <Route path="broadcast" element={<Broadcast />} />
          </Route>
        </Routes>
      </Router>
    </WhatsAppProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
