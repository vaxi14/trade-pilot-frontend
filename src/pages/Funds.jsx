import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from '../pages/Navbar.jsx'; // Corrected path: Assuming Navbar.jsx is in src/components/
import axios from 'axios';
import { toast } from 'react-hot-toast'; // Import toast for professional notifications

// --- Professional React Component for Managing Funds ---

const Funds = () => {
  const [action, setAction] = useState(null);
  const [amount, setAmount] = useState('');
  const [orders, setOrders] = useState([]); // Still fetched for other potential uses, but not for fund statement
  const [fundTransactions, setFundTransactions] = useState([]);
  const [walletBalance, setWalletBalance] = useState(null); // Wallet balance fetched from backend
  const [backendHoldings, setBackendHoldings] = useState([]); // NEW: State to store raw holdings from backend

  // State for managing loading and errors
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // For button loading state
  const [error, setError] = useState(null);

  // Function to fetch wallet balance from backend
  const fetchWalletBalance = useCallback(async (token) => {
    try {
      if (!token) {
        setWalletBalance(0);
        console.log("fetchWalletBalance: No auth token found, setting balance to 0.");
        return;
      }
      const response = await axios.get('http://localhost:5000/api/wallet', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Ensure walletBalance is a number, default to 0 if not
      const fetchedBalance = typeof response.data.walletBalance === 'number'
                             ? response.data.walletBalance
                             : 0;
      setWalletBalance(fetchedBalance);
      console.log("fetchWalletBalance: Fetched wallet balance:", fetchedBalance);
    } catch (err) {
      console.error('Error fetching wallet balance:', err.response ? err.response.data : err.message);
      setWalletBalance(0); // Default to 0 on error
      console.log("fetchWalletBalance: Error fetching balance, setting to 0.");
    }
  }, []);

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setError(null);
    setLoading(true); // Set loading to true at the start of fetch
    console.log("fetchData: Starting data fetch...");
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Please log in to manage your funds.');
        setLoading(false);
        setFundTransactions([]);
        setOrders([]);
        setBackendHoldings([]); // Reset holdings too
        setWalletBalance(0); // This sets it to 0 if no token
        console.log("fetchData: No auth token, unable to fetch data.");
        return;
      }

      // Fetch fund transactions, orders, and holdings concurrently for efficiency
      const [fundRes, ordersRes, holdingsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/funds/transactions', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/holdings', { headers: { Authorization: `Bearer ${token}` } }) // NEW: Fetch holdings
      ]);

      setFundTransactions(Array.isArray(fundRes.data?.transactions) ? fundRes.data.transactions : []);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setBackendHoldings(Array.isArray(holdingsRes.data) ? holdingsRes.data : []); // NEW: Set raw holdings

      console.log("fetchData: Fund transactions fetched:", fundRes.data);
      console.log("fetchData: Orders fetched:", ordersRes.data);
      console.log("fetchData: Holdings fetched:", holdingsRes.data);


      // Also fetch wallet balance after other data is loaded
      await fetchWalletBalance(token);
      console.log("fetchData: Completed data fetch.");

    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load data. Please try again.');
      setFundTransactions([]);
      setOrders([]);
      setBackendHoldings([]); // Reset holdings on error
      setWalletBalance(0);
      console.error("fetchData: Error during data fetch:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchWalletBalance]); // fetchData depends on fetchWalletBalance

  useEffect(() => {
    fetchData();
    // Set up an interval to refresh data periodically
    const intervalId = setInterval(fetchData, 30000); // 30 seconds
    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [fetchData]);

  // --- Balance Calculations (Dynamic Logic) ---
  // The opening balance is the net sum of all deposits and withdrawals.
  const openingBalance = useMemo(() => {
    if (!Array.isArray(fundTransactions)) return 0;
    return fundTransactions.reduce((acc, transaction) => {
      if (transaction.type === 'deposit') {
        return acc + (transaction.amount || 0);
      }
      if (transaction.type === 'withdraw') {
        return acc - (transaction.amount || 0);
      }
      return acc;
    }, 0);
  }, [fundTransactions]);

  // UPDATED: Used Margin is now calculated as the total "Amount Invested" in current stock holdings.
  const usedMargin = useMemo(() => {
    if (!Array.isArray(backendHoldings)) return 0;
    let totalAmountInvestedInHoldings = 0;
    backendHoldings.forEach(holding => {
      // Calculate net quantity for each holding
      const netQty = (holding.buyQty || 0) - (holding.sellQty || 0);
      // Only consider holdings with a positive net quantity (i.e., shares currently held)
      if (netQty > 0) {
        // Calculate the average buy price for the stock across all buys
        // This is (total buy cost for this stock) / (total buy quantity for this stock)
        const avgBuyPrice = (holding.buyQty > 0) ? (holding.buyCost / holding.buyQty) : 0;
        // The amount invested in currently held shares is avgBuyPrice * netQty
        totalAmountInvestedInHoldings += (avgBuyPrice * netQty);
      }
    });
    return totalAmountInvestedInHoldings;
  }, [backendHoldings]);


  const availableBalance = useMemo(() => {
    // Ensure walletBalance is treated as a number, defaulting to 0 if null
    const currentWalletBalance = typeof walletBalance === 'number' ? walletBalance : 0;
    const calculatedBalance = currentWalletBalance - usedMargin;
    return Math.max(0, calculatedBalance); // Ensure balance is never negative
  }, [walletBalance, usedMargin]); // Depend on walletBalance and the NEW usedMargin calculation

  // --- UI Handlers ---
  const handleAction = (type) => {
    setAction(type);
    setAmount('');
    setError(null);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Regex to allow numbers and a single decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  // --- Transaction Handlers (Direct API Calls) ---
  const handleDeposit = async () => {
    setIsSubmitting(true);
    setError(null);
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid, positive amount.');
      toast.error('Please enter a valid, positive amount.'); // Also show toast
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      console.log("handleDeposit: Sending deposit request...");
      await axios.post('http://localhost:5000/api/funds/deposit', { amount: parsedAmount }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Deposit of ₹${parsedAmount.toFixed(2)} successful.`);
      console.log("handleDeposit: Deposit successful, re-fetching data...");
      await fetchData(); // Refresh data to show new balance and updated summary
      setAmount(''); // Clear amount after successful transaction
      setAction(null); // Close the action box
    } catch (err) {
      setError(err.response?.data?.msg || 'Deposit failed. Please try again.');
      toast.error(`Deposit failed: ${err.response?.data?.msg || 'Server error'}`);
      console.error("handleDeposit: Deposit failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawal = async () => {
    setIsSubmitting(true);
    setError(null);
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid, positive amount.');
      toast.error('Please enter a valid, positive amount.'); // Also show toast
      setIsSubmitting(false);
      return;
    }

    // --- Added Logging for Withdrawal Debugging ---
    console.log("handleWithdrawal: Attempting to withdraw:", parsedAmount);
    console.log("handleWithdrawal: Current Wallet Balance (from state):", walletBalance);
    console.log("handleWithdrawal: Calculated Used Margin:", usedMargin);
    console.log("handleWithdrawal: Calculated Available Balance (frontend):", availableBalance);


    if (parsedAmount > availableBalance) {
      setError('Withdrawal amount exceeds your available balance.');
      toast.error('Withdrawal amount exceeds your available balance.'); // Also show toast
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      console.log("handleWithdrawal: Sending withdrawal request...");
      await axios.post('http://localhost:5000/api/funds/withdraw', { amount: parsedAmount }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Withdrawal of ₹${parsedAmount.toFixed(2)} successful.`);
      console.log("handleWithdrawal: Withdrawal successful, re-fetching data...");
      await fetchData(); // Refresh data
      setAmount(''); // Clear amount after successful transaction
      setAction(null); // Close the action box
    } catch (err) {
      setError(err.response?.data?.msg || 'Withdrawal failed. Please try again.');
      toast.error(`Withdrawal failed: ${err.response?.data?.msg || 'Server error'}`);
      console.error("handleWithdrawal: Withdrawal failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATED: Combined History for Statement - ONLY fund transactions
  const allHistory = useMemo(() => {
    const fundHistory = (fundTransactions || []).map(ft => ({
      ...ft,
      category: 'fund',
      timestamp: ft.createdAt, // Ensure timestamp is used for sorting
      // Add a unique key if _id is not always present for some reason, though it should be.
      _id: ft._id || `${ft.type}-${ft.createdAt}-${ft.amount}`
    }));

    return fundHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [fundTransactions]);


  // --- Render Logic ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Loading Funds...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-12 mb-8">💰 Funds</h1>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          {/* Left Column: Summary & Actions */}
          <div className="lg:col-span-1 flex flex-col gap-6 lg:gap-8">
            {/* Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Account Summary</h2>
              <div className="space-y-3 text-sm sm:text-base">
                <p className="flex justify-between text-gray-600"><span>Wallet Balance:</span> <span className="font-bold text-gray-800">₹{typeof walletBalance === 'number' ? walletBalance.toFixed(2) : 'Loading...'}</span></p>
                <p className="flex justify-between text-gray-600"><span>Available Margin:</span> <span className="font-bold text-green-600">₹{availableBalance.toFixed(2)}</span></p>
                <p className="flex justify-between text-gray-600"><span>Used Margin:</span> <span className="font-bold text-red-600">₹{usedMargin.toFixed(2)}</span></p>
                <hr className="my-2" />
                <p className="flex justify-between text-gray-800 font-semibold"><span>Opening Balance:</span> <span>₹{openingBalance.toFixed(2)}</span></p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Manage Funds</h2>
              <div className="flex flex-col space-y-3">
                <button onClick={() => handleAction('deposit')} className="w-full bg-green-600 text-white font-bold py-2.5 px-4 rounded-md hover:bg-green-700 transition shadow-sm">Add Funds</button>
                <button onClick={() => handleAction('withdraw')} className="w-full bg-red-600 text-white font-bold py-2.5 px-4 rounded-md hover:bg-red-700 transition shadow-sm">Withdraw Funds</button>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Content */}
          <div className="lg:col-span-2">
            {/* Deposit/Withdraw Box */}
            {action && (
              <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {action === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
                </h3>
                {error && <p className="text-red-600 bg-red-50 p-3 rounded-md mb-4 text-sm">{error}</p>}
                <div className="mb-4">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-600 mb-1">Amount (₹)</label>
                  <input
                    type="text"
                    id="amount"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={amount}
                    onChange={handleInputChange}
                    placeholder="e.g., 5000"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex gap-4 items-center">
                  <button
                    onClick={action === 'deposit' ? handleDeposit : handleWithdrawal}
                    disabled={isSubmitting || !amount}
                    className={`px-6 py-2 font-semibold text-white rounded-md transition shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed ${action === 'deposit' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    {isSubmitting ? 'Processing...' : (action === 'deposit' ? 'Deposit' : 'Withdraw')}
                  </button>
                  <button onClick={() => setAction(null)} className="text-gray-600 hover:text-gray-900">Cancel</button>
                </div>
              </div>
            )}

            {/* History Table */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Fund Statement</h2>
              <div className="overflow-x-auto">
                {allHistory.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (₹)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                      {allHistory.map((item) => (
                        <tr key={item._id}> {/* Use item._id for key */}
                          <td className="px-4 py-4 whitespace-nowrap font-semibold">
                            {item.category === 'fund' ? (
                              <span className={item.type === 'deposit' ? 'text-green-600' : 'text-red-500'}>{item.type.toUpperCase()}</span>
                            ) : (
                              // This block will ideally not be reached if allHistory only contains fund transactions
                              <span className={item.type === 'buy' ? 'text-blue-600' : 'text-orange-500'}>{item.type.toUpperCase()}</span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                            {item.category === 'fund' ? (
                              `Funds ${item.type}`
                            ) : (
                              // This block will ideally not be reached
                              `${item.quantity} shares of ${item.stock} (${item.status})`
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right font-medium text-gray-800">
                            ₹{item.amount?.toFixed(2) || '0.00'} {/* Direct amount from fund transactions */}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                            {new Date(item.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 text-center py-8">Your fund transaction history will appear here.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Funds;
