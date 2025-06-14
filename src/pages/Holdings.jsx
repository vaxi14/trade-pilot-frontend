import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from './Navbar'; // Adjusted path: Assuming Navbar.jsx is located in the same directory as Holdings.jsx (e.g., both in src/pages/)

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// API details for fetching current prices (Financial Modeling Prep)
const API_KEY = 'I36Mtj9GXIUz9dNjIh5SpJRYITZ6DpXb'; // Your Financial Modeling Prep API Key
const API_URL = 'https://financialmodelingprep.com/api/v3/quote/'; // FMP Quote API URL

const Holdings = () => {
  const [currentPrices, setCurrentPrices] = useState({});
  const [previousDayPrices, setPreviousDayPrices] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'stock', direction: 'asc' });
  const [filterText, setFilterText] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [orders, setOrders] = useState([]); // State to store all orders from backend (for detailed trade history)
  const [backendHoldings, setBackendHoldings] = useState([]); // State to store holdings directly from backend (already aggregated by stock symbol)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // State for Buy Modal
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [buyStockSymbol, setBuyStockSymbol] = useState('');
  const [buyQuantity, setBuyQuantity] = useState(1); // Default buy quantity for modal
  const [buyOrderType, setBuyOrderType] = useState('Market');
  const [buyLimitPrice, setBuyLimitPrice] = useState('');
  const [isPlacingBuyOrder, setIsPlacingBuyOrder] = useState(false);

  // State for Sell Modal
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [sellStockSymbol, setSellStockSymbol] = useState('');
  const [sellQuantity, setSellQuantity] = useState(1); // Default sell quantity for modal
  const [sellOrderType, setSellOrderType] = useState('Market');
  const [sellLimitPrice, setSellLimitPrice] = useState('');
  const [isPlacingSellOrder, setIsPlacingSellOrder] = useState(false);

  const [walletBalance, setWalletBalance] = useState(null); // Wallet balance fetched from backend

  // Function to fetch wallet balance from backend
  const fetchWalletBalance = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setWalletBalance(0); // Set to 0 if not logged in
        return;
      }
      const response = await axios.get('http://localhost:5000/api/wallet', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWalletBalance(response.data.walletBalance);
    } catch (err) {
      console.error('Error fetching wallet balance:', err.response ? err.response.data : err.message);
      setWalletBalance(0); // Default to 0 on error
    }
  }, []);

  // Function to fetch orders and holdings from backend
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError("You are not logged in. Please log in to view holdings.");
        setLoading(false);
        setBackendHoldings([]);
        setOrders([]);
        setWalletBalance(0); // Also reset wallet balance
        return;
      }

      // Fetch holdings (these are already aggregated by userId and stock from backend)
      const holdingsRes = await axios.get('http://localhost:5000/api/holdings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBackendHoldings(holdingsRes.data); // backendHoldings now holds the aggregated Holding documents

      // Fetch orders (needed for detailed trade history within holdings)
      const ordersRes = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(ordersRes.data);

      // Fetch wallet balance
      await fetchWalletBalance();

    } catch (err) {
      console.error('Error fetching holdings/orders/wallet:', err.response ? err.response.data : err.message);
      setError(`Failed to load data: ${err.response?.data?.msg || err.message || 'Server error'}`);
      setBackendHoldings([]);
      setOrders([]);
      setWalletBalance(0);
    } finally {
      setLoading(false);
    }
  }, [fetchWalletBalance]); // fetchData depends on fetchWalletBalance

  useEffect(() => {
    fetchData(); // Fetch data on component mount
    const intervalId = setInterval(fetchData, 60000); // Refresh every 60 seconds
    return () => clearInterval(intervalId); // Clear interval on unmount
  }, [fetchData]); // Re-run when fetchData changes (due to useCallback)

  // Fetch current prices (and simulate previous day prices) for stocks in holdings
  useEffect(() => {
    const fetchPrices = async () => {
      const uniqueStocksInHoldings = [...new Set(backendHoldings.map(h => h.stock))]; // Get unique stock symbols
      const prices = {};
      const prevPrices = {};

      if (uniqueStocksInHoldings.length > 0 && API_KEY) {
        await Promise.all(
          uniqueStocksInHoldings.map(async (stock) => {
            try {
              // Using axios.get for FMP API
              const response = await axios.get(`${API_URL}${stock}?apikey=${API_KEY}`);
              const data = response.data;

              if (data && data.length > 0) {
                prices[stock] = data[0].price || 0; // 'price' is the current price from FMP
                prevPrices[stock] = data[0].previousClose || (prices[stock] * (0.98 + Math.random() * 0.04)); // 'previousClose' from FMP
              } else {
                console.warn(`FMP API for ${stock} returned no data or an empty array.`);
                prices[stock] = 0;
                prevPrices[stock] = 0;
              }

              // Fallback: if no API data, use last completed order price for calculation
              if (!prices[stock]) {
                const lastOrder = orders.filter(o => o.stock === stock && o.status === 'completed').slice(-1)[0];
                prices[stock] = lastOrder ? lastOrder.price : 0;
                prevPrices[stock] = lastOrder ? lastOrder.price * (0.98 + Math.random() * 0.04) : 0;
              }
            } catch (error) {
              console.error(`Error fetching price for ${stock} from FMP:`, error.response ? error.response.data : error.message);
              // Fallback to 0 or last known price if API fails
              const lastOrder = orders.filter(o => o.stock === stock && o.status === 'completed').slice(-1)[0];
              prices[stock] = lastOrder ? lastOrder.price : 0;
              prevPrices[stock] = lastOrder ? lastOrder.price * (0.98 + Math.random() * 0.04) : 0;
            }
          })
        );
      }

      setCurrentPrices(prices);
      setPreviousDayPrices(prevPrices);
    };

    if (!loading) { // Only fetch prices once holdings are loaded
      fetchPrices();
      const intervalId = setInterval(fetchPrices, 30000); // Refresh prices every 30 seconds
      return () => clearInterval(intervalId); // Clear interval on unmount
    }
  }, [backendHoldings, orders, loading, API_KEY]); // Re-run when holdings or orders change

  // Calculate holdings dynamically based on `backendHoldings` and `currentPrices`
  const holdings = useMemo(() => {
    const calculatedHoldings = [];

    // Iterate directly through `backendHoldings` as they are already aggregated Holding documents
    backendHoldings.forEach(holding => {
      // Calculate net quantity (shares currently held)
      const netQty = (holding.buyQty || 0) - (holding.sellQty || 0);

      // Only include holdings with a positive net quantity
      if (netQty > 0) {
        // Calculate average buy price for currently held shares
        // This is crucial for P&L calculation
        const avgPrice = (holding.buyQty > 0) ? (holding.buyCost / holding.buyQty) : 0;
        const currentPrice = currentPrices[holding.stock] || 0;

        // Market Value: Current value of the shares based on current market price
        const marketValue = currentPrice * netQty;

        // Profit/Loss (P&L): Difference between current market value and invested amount
        const pnl = (currentPrice - avgPrice) * netQty;

        // 1-Day P&L
        const prevPrice = previousDayPrices[holding.stock] || 0;
        const oneDayPnl = (currentPrice - prevPrice) * netQty;
        const dayChangePercent = prevPrice > 0 ? ((currentPrice - prevPrice) / prevPrice) * 100 : 0;

        // Amount Invested: The actual capital tied up in the *currently held* shares
        // This is derived from the average buy price and the net quantity.
        const amountInvested = avgPrice * netQty;

        // Filter orders specific to this stock and ensure they are completed
        const stockOrders = orders.filter(o => o.stock === holding.stock && o.status === 'completed'); // Filter by 'completed' status

        calculatedHoldings.push({
          stock: holding.stock,
          quantity: netQty, // Net quantity held
          avgPrice,
          currentPrice,
          pnl,
          oneDayPnl,
          dayChangePercent,
          marketValue,
          amountInvested, // Correctly calculated as avgPrice * netQty
          orders: stockOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), // Sort by latest creation timestamp
          _id: holding._id // Include original _id from holding for potential future use
        });
      }
    });

    return calculatedHoldings;
  }, [backendHoldings, orders, currentPrices, previousDayPrices]);


  // Calculate total summary (these totals will now use the corrected 'amountInvested' from 'holdings')
  const totals = useMemo(() => {
    let totalNumberOfStocks = holdings.length; // Direct count of unique stocks in `holdings`
    let totalMarketValue = 0;
    let totalPnl = 0;
    let totalOneDayPnl = 0;
    let totalAmountInvested = 0;

    holdings.forEach(h => {
      totalMarketValue += h.marketValue;
      totalPnl += h.pnl;
      totalOneDayPnl += h.oneDayPnl;
      totalAmountInvested += h.amountInvested; // This will now sum the corrected 'amountInvested'
    });

    return { totalNumberOfStocks, totalMarketValue, totalPnl, totalOneDayPnl, totalAmountInvested };
  }, [holdings]);

  // Sorting
  const sortedHoldings = useMemo(() => {
    const sorted = [...holdings];
    sorted.sort((a, b) => {
      let compA = a[sortConfig.key];
      let compB = b[sortConfig.key];

      if (typeof compA === 'string') compA = compA.toLowerCase();
      if (typeof compB === 'string') compB = compB.toLowerCase();

      if (compA < compB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (compA > compB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [holdings, sortConfig]);

  // Filtering
  const filteredHoldings = useMemo(() => {
    if (!filterText) return sortedHoldings;
    return sortedHoldings.filter(h => h.stock.toLowerCase().includes(filterText.toLowerCase()));
  }, [sortedHoldings, filterText]);

  // Expand/collapse row
  const toggleRow = (stock) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(stock)) {
      newSet.delete(stock);
    } else {
      newSet.add(stock);
    }
    setExpandedRows(newSet);
  };

  // Change sorting column
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // Handles Buy/Sell button clicks
  const handleTrade = (type, stockSymbol) => {
    if (type === 'Buy') {
      setBuyStockSymbol(stockSymbol);
      setBuyQuantity(1); // Reset quantity for new buy order
      setBuyOrderType('Market'); // Default to Market
      setBuyLimitPrice(''); // Clear limit price
      setIsBuyModalOpen(true);
    } else if (type === 'Sell') {
      setSellStockSymbol(stockSymbol);
      setSellQuantity(1); // Reset quantity for new sell order
      setSellOrderType('Market'); // Default to Market
      setSellLimitPrice(''); // Clear limit price
      setIsSellModalOpen(true);
    }
  };

  // Handles clicking on a stock row to navigate to its detail page
  const handleStockClick = (stockSymbol) => {
    navigate(`/stock/${stockSymbol}`);
  };

  // Buy Modal Handlers
  const closeBuyModal = () => {
    setIsBuyModalOpen(false);
    setBuyStockSymbol('');
    setBuyQuantity(1); // Reset quantity after closing
    setBuyOrderType('Market');
    setBuyLimitPrice('');
  };

  const handleBuyQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setBuyQuantity(value);
    } else {
      setBuyQuantity(1); // Default to 1 if invalid input
    }
  };

  const calculateBuyAmount = () => {
    const priceToUse = buyOrderType === 'Limit' && buyLimitPrice ? parseFloat(buyLimitPrice) : (currentPrices[buyStockSymbol] || 0);
    return buyQuantity * priceToUse;
  };

  const handleBuySubmit = async () => {
    if (!buyStockSymbol || buyQuantity <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }

    const currentPrice = currentPrices[buyStockSymbol] || 0;
    const price = buyOrderType === 'Limit' && buyLimitPrice ? parseFloat(buyLimitPrice) : currentPrice;

    if (buyOrderType === 'Limit' && (isNaN(price) || price <= 0)) {
      toast.error('Please enter a valid limit price.');
      return;
    }

    const requiredAmount = calculateBuyAmount();
    if (walletBalance === null) {
      toast.error('Wallet balance not loaded yet. Please wait or refresh.');
      return;
    }
    if (walletBalance < requiredAmount) {
      toast.error('Insufficient wallet balance.');
      return;
    }

    const orderData = {
      stock: buyStockSymbol,
      quantity: buyQuantity,
      type: 'buy',
      price: price,
      orderType: buyOrderType, // Sending orderType to backend
    };

    setIsPlacingBuyOrder(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error("You must be logged in to place an order.");
        return;
      }

      await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(`Buy Order Placed for ${buyQuantity} shares of ${buyStockSymbol}!`);
      fetchData(); // Re-fetch all data to update holdings, orders, and wallet balance
      closeBuyModal();
    } catch (error) {
      console.error('Error placing buy order:', error.response ? error.response.data : error.message);
      toast.error(`Failed to place buy order: ${error.response?.data?.msg || error.message || 'Server error'}`);
    } finally {
      setIsPlacingBuyOrder(false);
    }
  };

  // Sell Modal Handlers
  const closeSellModal = () => {
    setIsSellModalOpen(false);
    setSellStockSymbol('');
    setSellQuantity(1);
    setSellOrderType('Market');
    setSellLimitPrice('');
  };

  const handleSellQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setSellQuantity(value);
    } else {
      setSellQuantity(1);
    }
  };

  const calculateSellAmount = () => {
    const priceToUse = sellOrderType === 'Limit' && sellLimitPrice ? parseFloat(sellLimitPrice) : (currentPrices[sellStockSymbol] || 0);
    return sellQuantity * priceToUse;
  };

  const handleSellSubmit = async () => {
    if (!sellStockSymbol || sellQuantity <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }

    const currentPrice = currentPrices[sellStockSymbol] || 0;
    const price = sellOrderType === 'Limit' && sellLimitPrice ? parseFloat(sellLimitPrice) : currentPrice;

    if (sellOrderType === 'Limit' && (isNaN(price) || price <= 0)) {
      toast.error('Please enter a valid limit price.');
      return;
    }

    // Check if user has enough shares to sell
    const holdingForSellStock = holdings.find(h => h.stock === sellStockSymbol);
    if (!holdingForSellStock || holdingForSellStock.quantity < sellQuantity) {
      toast.error(`Insufficient shares. You only hold ${holdingForSellStock?.quantity || 0} shares of ${sellStockSymbol}.`);
      return;
    }

    const orderData = {
      stock: sellStockSymbol,
      quantity: sellQuantity,
      type: 'sell',
      price: price,
      orderType: sellOrderType, // Sending orderType to backend
    };

    setIsPlacingSellOrder(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error("You must be logged in to place an order.");
        return;
      }

      await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(`Sell Order Placed for ${sellQuantity} shares of ${sellStockSymbol}!`);
      fetchData(); // Re-fetch all data to update holdings, orders, and wallet balance
      closeSellModal();
    } catch (error) {
      console.error('Error placing sell order:', error.response ? error.response.data : error.message);
      toast.error(`Failed to place sell order: ${error.response?.data?.msg || error.message || 'Server error'}`);
    } finally {
      setIsPlacingSellOrder(false);
    }
  };

  const getDayChangeStyle = (percent) => {
    if (percent > 0) return 'text-green-600';
    if (percent < 0) return 'text-red-600';
    return 'text-gray-700';
  };

  const renderSparkline = (dayChangePercent) => {
    const barCount = 5;
    const scaleFactor = 1.5; // Adjust for visual scaling
    const bars = [];
    const baseHeight = 5; // Minimum height for visibility

    // Normalize change percent to a reasonable range for sparkline height
    const normalizedChange = Math.min(Math.abs(dayChangePercent), 10) / 10; // Cap at 10% for scaling
    const directionFactor = dayChangePercent >= 0 ? 1 : -1;

    for (let i = 0; i < barCount; i++) {
      // Create a slight progression for visual effect
      const currentBarHeight = baseHeight + (normalizedChange * scaleFactor * (i + 1));
      const height = currentBarHeight;
      const colorClass = dayChangePercent >= 0 ? 'bg-green-300' : 'bg-red-300';
      
      // Adjust margin-bottom for negative changes to make bars go "down"
      const marginBottom = directionFactor < 0 ? `${height}px` : '0px';

      bars.push(
        <div 
          key={i} 
          className={`inline-block w-1 rounded-sm ${colorClass}`} 
          style={{ height: `${height}px`, marginBottom: marginBottom }}
        ></div>
      );
      if (i < barCount - 1) {
        bars.push(<span key={`space-${i}`} className="mr-0.5"></span>);
      }
    }
    // For negative changes, reverse the order of bars to make them appear to drop from left to right
    return <div className="inline-flex items-end">{directionFactor < 0 ? bars.reverse() : bars}</div>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading holdings...</p>
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
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">📊 Holdings</h1>

        {/* Summary Bar */}
        <div className="mb-6 flex flex-wrap gap-4 text-sm font-semibold text-gray-700">
          <div className="bg-white p-4 rounded shadow flex-1 min-w-[150px]">
            Total Holdings: <span className="font-bold">{totals.totalNumberOfStocks} Stocks</span>
          </div>
          <div className="bg-white p-4 rounded shadow flex-1 min-w-[150px]">
            Market Value: <span className="font-bold">₹{totals.totalMarketValue.toFixed(2)}</span>
          </div>
          <div className="bg-white p-4 rounded shadow flex-1 min-w-[150px]">
            Amount Invested: <span className="font-bold">₹{totals.totalAmountInvested.toFixed(2)}</span>
          </div>
          <div className="bg-white p-4 rounded shadow flex-1 min-w-[150px]">
            Total P&L: <span className={`font-bold ${totals.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totals.totalPnl >= 0 ? '+' : '-'}₹{Math.abs(totals.totalPnl).toFixed(2)}
            </span>
          </div>
          <div className="bg-white p-4 rounded shadow flex-1 min-w-[150px]">
            1D P&L: <span className={`font-bold ${totals.totalOneDayPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totals.totalOneDayPnl >= 0 ? '+' : '-'}₹{Math.abs(totals.totalOneDayPnl).toFixed(2)}
            </span>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search stock..."
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          className="mb-4 p-2 border rounded w-full max-w-sm"
        />

        {filteredHoldings.length === 0 ? (
          <p className="text-center text-gray-500">No holdings found.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 cursor-pointer select-none">
                <tr>
                  <th onClick={() => requestSort('stock')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock {sortConfig.key === 'stock' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => requestSort('quantity')} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity {sortConfig.key === 'quantity' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => requestSort('avgPrice')} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Price (₹) {sortConfig.key === 'avgPrice' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => requestSort('currentPrice')} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price (₹) {sortConfig.key === 'currentPrice' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    1D Change
                  </th>
                  <th onClick={() => requestSort('marketValue')} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Value (₹) {sortConfig.key === 'marketValue' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => requestSort('pnl')} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P&L (₹) {sortConfig.key === 'pnl' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="px-6 py-3" /> {/* Empty header for buttons */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHoldings.map(({ stock, quantity, avgPrice, currentPrice, pnl, oneDayPnl, dayChangePercent, marketValue, orders }) => (
                  <React.Fragment key={stock}>
                    <tr onClick={() => handleStockClick(stock)} className="cursor-pointer hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">{stock}</td>
                      <td className="px-6 py-4 text-right">{quantity}</td>
                      <td className="px-6 py-4 text-right">{avgPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">{currentPrice.toFixed(2)}</td>
                      <td className={`px-6 py-4 text-right font-semibold ${getDayChangeStyle(dayChangePercent)}`}>
                        <div className="flex items-center justify-end">
                          {renderSparkline(dayChangePercent)}
                          <span className="ml-1">({dayChangePercent >= 0 ? '+' : ''}{dayChangePercent.toFixed(2)}%)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">{marketValue.toFixed(2)}</td>
                      <td className={`px-6 py-4 text-right font-semibold ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {pnl >= 0 ? '+' : '-'}₹{Math.abs(pnl).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleTrade('Buy', stock); }}
                          className="mr-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                          disabled={isPlacingBuyOrder}
                        >
                          Buy
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleTrade('Sell', stock); }}
                          className="px-3 mt-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300"
                          disabled={isPlacingSellOrder}
                        >
                          Sell
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Row with trade history */}
                    {expandedRows.has(stock) && (
                      <tr className="bg-gray-50">
                        <td colSpan={8} className="px-6 py-4">
                          <div>
                            <h3 className="font-semibold mb-2">Trade History for {stock}:</h3>
                            {orders.filter(o => o.stock === stock).length > 0 ? (
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-300">
                                    <th className="py-1 text-left">Order Type</th>
                                    <th className="py-1 text-left">Quantity</th>
                                    <th className="py-1 text-left">Price (₹)</th>
                                    <th className="py-1 text-left">Status</th>
                                    <th className="py-1 text-left">Timestamp</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {orders.filter(o => o.stock === stock).map((orderItem) => (
                                    <tr key={orderItem._id} className="border-b border-gray-200 hover:bg-gray-100">
                                      <td className={`py-1 font-semibold ${orderItem.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>{orderItem.type.toUpperCase()} ({orderItem.orderType})</td>
                                      <td className="py-1">{orderItem.quantity}</td>
                                      <td className="py-1">{orderItem.price?.toFixed(2) || 'N/A'}</td> {/* Handle potential null/undefined price */}
                                      <td className="py-1">{orderItem.status}</td>
                                      <td className="py-1">{new Date(orderItem.createdAt).toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="text-gray-500">No trade history for this stock.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Buy Order Modal */}
      {isBuyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Buy {buyStockSymbol}</h2>
            <div className="mb-2">
              <p className="text-gray-700">Wallet Balance: <span className="font-bold">₹{walletBalance !== null ? walletBalance.toFixed(2) : 'Loading...'}</span></p>
            </div>
            <div className="mb-4">
              <label htmlFor="buyQuantity" className="block text-gray-700 text-sm font-bold mb-2">
                Quantity:
              </label>
              <input
                type="number"
                id="buyQuantity"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter quantity"
                min="1"
                value={buyQuantity}
                onChange={handleBuyQuantityChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Order Type:</label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={buyOrderType}
                onChange={(e) => setBuyOrderType(e.target.value)}
              >
                <option value="Market">Market</option>
                <option value="Limit">Limit</option>
              </select>
              {buyOrderType === 'Limit' && (
                <input
                  type="number"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
                  placeholder="Limit Price"
                  value={buyLimitPrice}
                  onChange={(e) => setBuyLimitPrice(e.target.value)}
                />
              )}
            </div>
            <div className="mb-4">
              <p className="text-gray-700 text-sm font-bold">Current Price:</p>
              <p className="text-lg font-semibold">₹{currentPrices[buyStockSymbol]?.toFixed(2) || 'N/A'}</p>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 text-sm font-bold">Total Amount:</p>
              <p className="text-xl font-bold text-blue-600">
                ₹{calculateBuyAmount().toFixed(2)}
              </p>
            </div>
            <div className="flex justify-end gap-4">
              <button onClick={closeBuyModal} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Cancel
              </button>
              <button
                onClick={handleBuySubmit}
                className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isPlacingBuyOrder ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isPlacingBuyOrder}
              >
                {isPlacingBuyOrder ? 'Processing...' : 'Place Buy Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sell Order Modal */}
      {isSellModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Sell {sellStockSymbol}</h2>
            <div className="mb-2">
              <p className="text-gray-700">Wallet Balance: <span className="font-bold">₹{walletBalance !== null ? walletBalance.toFixed(2) : 'Loading...'}</span></p>
            </div>
            <div className="mb-4">
              <label htmlFor="sellQuantity" className="block text-gray-700 text-sm font-bold mb-2">
                Quantity:
              </label>
              <input
                type="number"
                id="sellQuantity"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter quantity"
                min="1"
                value={sellQuantity}
                onChange={handleSellQuantityChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Order Type:</label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={sellOrderType}
                onChange={(e) => setSellOrderType(e.target.value)}
              >
                <option value="Market">Market</option>
                <option value="Limit">Limit</option>
              </select>
              {sellOrderType === 'Limit' && (
                <input
                  type="number"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
                  placeholder="Limit Price"
                  value={sellLimitPrice}
                  onChange={(e) => setSellLimitPrice(e.target.value)}
                />
              )}
            </div>
            <div className="mb-4">
              <p className="text-gray-700 text-sm font-bold">Current Price:</p>
              <p className="text-lg font-semibold">₹{currentPrices[sellStockSymbol]?.toFixed(2) || 'N/A'}</p>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 text-sm font-bold">Estimated Amount:</p>
              <p className="text-xl font-bold text-red-600">
                ₹{calculateSellAmount().toFixed(2)}
              </p>
            </div>
            <div className="flex justify-end gap-4">
              <button onClick={closeSellModal} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Cancel
              </button>
              <button
                onClick={handleSellSubmit}
                className={`bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isPlacingSellOrder ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isPlacingSellOrder}
              >
                {isPlacingSellOrder ? 'Processing...' : 'Place Sell Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holdings;
