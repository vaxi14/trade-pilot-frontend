import React, { useState, useEffect, useMemo, useCallback } from 'react';
import classNames from 'classnames';
import Navbar from '../pages/Navbar'; // Corrected import path for Navbar
import axios from 'axios';

const tabs = ['All', 'Pending', 'Executed', 'Cancelled'];

const Orders = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' }); // Default sort by latest timestamp

  // Function to fetch orders from backend
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError("You are not logged in. Please log in to view orders.");
        setLoading(false);
        setOrders([]); // Clear orders if not authenticated
        return;
      }
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err.response ? err.response.data : err.message);
      setError(`Failed to load orders: ${err.response?.data?.msg || err.message || 'Server error'}`);
      setOrders([]); // Clear orders on error
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies, as it's a core fetch function

  useEffect(() => {
    fetchOrders(); // Fetch orders on component mount
    // Set up an interval to refresh orders every 30 seconds
    const intervalId = setInterval(fetchOrders, 30000);
    return () => clearInterval(intervalId); // Clear interval on unmount
  }, [fetchOrders]); // Re-run when fetchOrders changes (due to useCallback)

  // Filtered orders based on active tab
  const filteredOrders = useMemo(() => {
    return activeTab === 'All'
      ? orders
      : orders.filter(order => order.status === activeTab);
  }, [orders, activeTab]);

  // Sorted orders based on sortConfig
  const sortedOrders = useMemo(() => {
    const sortableOrders = [...filteredOrders];
    if (sortConfig.key) {
      sortableOrders.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Handle date sorting
        if (sortConfig.key === 'timestamp' || sortConfig.key === 'createdAt') {
          valA = new Date(valA);
          valB = new Date(valB);
        } else if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableOrders;
  }, [filteredOrders, sortConfig]);

  // Function to handle sorting requests
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Helper to get sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };

  // Helper to get status styling
  const getStatusClasses = (status) => {
    switch (status) {
      case 'Executed':
        return 'bg-green-100 text-green-600';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'Cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-700 text-lg">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-red-500">
        <p className="text-center p-4 rounded bg-red-50">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">📝 Your Orders</h1>

        {/* Tabs for filtering orders */}
        <div className="flex flex-wrap gap-3 mb-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={classNames(
                'px-5 py-2 rounded-lg font-medium transition-all duration-200 ease-in-out',
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders List Table */}
        {sortedOrders.length === 0 ? (
          <p className="text-center text-gray-500 text-lg mt-10">No {activeTab.toLowerCase()} orders found.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => requestSort('stock')}
                  >
                    Stock{getSortIndicator('stock')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => requestSort('type')}
                  >
                    Order Type{getSortIndicator('type')}
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => requestSort('quantity')}
                  >
                    Quantity{getSortIndicator('quantity')}
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => requestSort('price')}
                  >
                    Price (₹){getSortIndicator('price')}
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total Value (₹)
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => requestSort('status')}
                  >
                    Status{getSortIndicator('status')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => requestSort('createdAt')} // Assuming 'createdAt' is the timestamp field from MongoDB
                  >
                    Timestamp{getSortIndicator('createdAt')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {order.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={classNames(
                        'font-medium',
                        order.type === 'buy' ? 'text-green-600' : 'text-red-600'
                      )}>
                        {order.type.toUpperCase()} ({order.orderType || 'N/A'})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                      {order.price ? `₹${order.price.toFixed(2)}` : 'Market'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      ₹{(order.quantity * (order.price || 0)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={classNames(
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                        getStatusClasses(order.status)
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
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

export default Orders;