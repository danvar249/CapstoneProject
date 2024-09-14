import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './pages/Login';
import Connect from './pages/Connect';
import Dashboard from './pages/Dashboard';
import CustomerInsights from './pages/CustomerInsights';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/dashboard" element={<App />}>
          <Route path="overview" element={<Dashboard />} />
          <Route path="insights" element={<CustomerInsights />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
