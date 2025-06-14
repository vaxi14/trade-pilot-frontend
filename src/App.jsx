import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

import { UserContext } from './context/UserContext'; // ✅ Correctly importing context

// Import components and pages
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Holdings from './pages/Holdings';
import Positions from './pages/Positions';
import Bids from './pages/Bids';
import Funds from './pages/Funds';
import StockDetail from './pages/StockDetail';
import MoreStocks from './pages/MoreStocks';
import CartPage from './pages/CartPage';
import NotificationsPage from './pages/NotificationsPage';
import UserProfilePage from './pages/UserProfilePage';
import SettingsPage from './pages/SettingsPage';
import SecurityPage from './pages/SecurityPage';
import SupportPage from './pages/SupportPage';
import AboutUsPage from './pages/AboutUsPage';
import ProductPage from './pages/ProductPage';
import ContactUsPage from './pages/ContactUsPage';


const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  return token ? children : null;
};

function App() {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Hero />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/product" element={<ProductPage />} />
              <Route path="/contact" element={<ContactUsPage />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/holdings" element={<ProtectedRoute><Holdings /></ProtectedRoute>} />
              <Route path="/positions" element={<ProtectedRoute><Positions /></ProtectedRoute>} />
              <Route path="/bids" element={<ProtectedRoute><Bids /></ProtectedRoute>} />
              <Route path="/funds" element={<ProtectedRoute><Funds /></ProtectedRoute>} />
              <Route path="/stock/:symbol" element={<ProtectedRoute><StockDetail /></ProtectedRoute>} />
              <Route path="/more-stocks" element={<ProtectedRoute><MoreStocks /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/security" element={<ProtectedRoute><SecurityPage/></ProtectedRoute>} />
              <Route path="/support" element={<ProtectedRoute><SupportPage/></ProtectedRoute>} />

            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
