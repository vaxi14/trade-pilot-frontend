import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../pages/Navbar.jsx'; // Adjusted path for Navbar
import axios from 'axios';
import { toast } from 'react-hot-toast'; // For professional notifications

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch all relevant transaction data from the backend
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Please log in to view your notifications.');
        setLoading(false);
        setNotifications([]);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch fund transactions (deposits/withdrawals)
      const fundRes = await axios.get('http://localhost:5000/api/funds/transactions', { headers });
      const fundTransactions = Array.isArray(fundRes.data?.transactions) ? fundRes.data.transactions : [];

      // Fetch stock orders (buy/sell)
      const ordersRes = await axios.get('http://localhost:5000/api/orders', { headers });
      const stockOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];

      // Normalize and combine notifications
      const combinedNotifications = [];

      // Add fund transactions to combined notifications
      fundTransactions.forEach(transaction => {
        combinedNotifications.push({
          id: transaction._id || `fund-${transaction.createdAt}-${Math.random()}`, // Fallback ID
          type: transaction.type, // 'deposit' or 'withdraw'
          message: `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} of ₹${(transaction.amount || 0).toFixed(2)}`,
          details: `Amount: ₹${(transaction.amount || 0).toFixed(2)}`,
          timestamp: new Date(transaction.createdAt),
          category: 'funds',
          status: 'Completed' // Assuming fund transactions are always completed
        });
      });

      // Add stock orders to combined notifications
      stockOrders.forEach(order => {
        combinedNotifications.push({
          id: order._id || `order-${order.createdAt}-${Math.random()}`, // Fallback ID
          type: order.type, // 'buy' or 'sell'
          message: `${order.type.charAt(0).toUpperCase() + order.type.slice(1)} ${order.quantity} shares of ${order.stock} at ₹${(order.price || 0).toFixed(2)}`,
          details: `Order Type: ${order.orderType}, Status: ${order.status}`,
          timestamp: new Date(order.createdAt),
          category: 'stock',
          status: order.status // 'completed', 'pending', 'cancelled'
        });
      });

      // Sort notifications by timestamp (newest first)
      combinedNotifications.sort((a, b) => b.timestamp - a.timestamp);

      setNotifications(combinedNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err.response?.data || err.message);
      setError('Failed to load notifications. Please try again.');
      setNotifications([]);
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(); // Fetch on component mount
    const intervalId = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [fetchNotifications]);

  const getNotificationColor = (type, status) => {
    if (status === 'cancelled') return 'text-gray-500'; // Grey for cancelled
    if (type === 'deposit' || type === 'buy') return 'text-green-600';
    if (type === 'withdraw' || type === 'sell') return 'text-red-600';
    return 'text-gray-800';
  };

  const getStatusColor = (status) => {
    if (status === 'Completed') return 'bg-green-100 text-green-800';
    if (status === 'completed') return 'bg-green-100 text-green-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (status === 'cancelled') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-12 mb-8">🔔 Your Notifications</h1>

        {notifications.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center py-12">
            <p className="text-gray-500 text-lg">No notifications yet. Your recent activities will appear here.</p>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow-sm border overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {notifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50">
                    <td className={`px-4 py-4 whitespace-nowrap font-semibold ${getNotificationColor(notification.type, notification.status)}`}>
                      {notification.category === 'funds' ? 
                        (notification.type.toUpperCase()) : 
                        (notification.type.toUpperCase() + ' ' + notification.category.toUpperCase())
                      }
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-800">
                      {notification.message}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                      {notification.details}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(notification.status)}`}>
                        {notification.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                      {notification.timestamp.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
