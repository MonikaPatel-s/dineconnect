import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/CustomerDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MenuByTable from "./pages/MenuByTable";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If opening a table QR URL (/m/...), save slug and clear session for fresh login
    if (window.location.pathname.startsWith('/m/')) {
      const slug = window.location.pathname.replace('/m/', '');
      localStorage.setItem('pendingTableSlug', slug);
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
      return;
    }
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp > Date.now() / 1000) {
          setUser(payload);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <NotificationProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={!user ? <LoginPage setUser={setUser} /> : <Navigate to={getLoginRedirect(user)} />} />
                <Route path="/register" element={!user ? <Register /> : <Navigate to={getDashboardRoute(user.role)} />} />
                <Route path="/m/:tableSlug" element={<MenuByTable user={user} setUser={setUser} />} />

                {/* Protected Routes */}
                <Route path="/customer" element={user && user.role === 'customer' ? <CustomerDashboard user={user} /> : <Navigate to="/login" />} />
                <Route path="/staff" element={user && user.role === 'staff' ? <StaffDashboard user={user} /> : <Navigate to="/login" />} />
                <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/login" />} />

                {/* Default Route */}
                <Route path="/" element={
                  user ? <Navigate to={getDashboardRoute(user.role)} /> : <Navigate to="/login" />
                } />
              </Routes>
            </div>
          </Router>
        </NotificationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

function getDashboardRoute(role) {
  switch (role) {
    case 'admin': return '/admin';
    case 'staff': return '/staff';
    case 'customer': return '/customer';
    default: return '/login';
  }
}

function getLoginRedirect(user) {
  if (!user) return null;
  const pendingTable = localStorage.getItem('pendingTableSlug');
  if (pendingTable && user.role === 'customer') {
    return `/m/${pendingTable}`;
  }
  return getDashboardRoute(user.role);
}

export default App;
