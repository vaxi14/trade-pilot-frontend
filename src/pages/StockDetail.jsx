import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Chart } from 'chart.js/auto'; // Import Chart.js directly
import { toast } from 'react-hot-toast'; // Import toast for snackbar messages
import Navbar from '../pages/Navbar';

// IMPORTANT: Using your Financial Modeling Prep API Key for StockDetail
const API_KEY = 'I36Mtj9GXIUz9dNjIh5SpJRYITZ6DpXb'; // Your FMP API Key

const StockDetail = () => {
  const { symbol } = useParams();
  const [stockData, setStockData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderType, setOrderType] = useState('Market');
  const [limitPrice, setLimitPrice] = useState('');
  const [walletBalance, setWalletBalance] = useState(null); // Will be fetched from backend
  const [watchlist, setWatchlist] = useState([]); // State to manage user's watchlist symbols from backend

  // Function to fetch wallet balance from backend
  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('authToken'); // Get the authentication token
      if (!token) {
        console.warn("No auth token found. Cannot fetch wallet balance.");
        setWalletBalance(0); // Set to 0 or handle unauthenticated state
        return;
      }
      const response = await axios.get('http://localhost:5000/api/wallet', { // Ensure full URL
        headers: {
          Authorization: `Bearer ${token}`, // Send token in Authorization header
        },
      });
      setWalletBalance(response.data.walletBalance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error.response ? error.response.data : error.message);
      setWalletBalance(0); // Default to 0 on error
    }
  };

  // Function to fetch user's watchlist from backend
  const fetchWatchlist = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn("No auth token found. Cannot fetch watchlist.");
        setWatchlist([]);
        return;
      }
      const response = await axios.get('http://localhost:5000/api/watchlist', { // New API endpoint
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // IMPORTANT: Ensure response.data is an array before setting state
      if (Array.isArray(response.data)) {
        setWatchlist(response.data); // Assuming response.data is an array of symbols
      } else {
        console.error("Backend watchlist response was not an array:", response.data);
        setWatchlist([]); // Default to empty array if not an array
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error.response ? error.response.data : error.message);
      setWatchlist([]); // Default to empty array on error
    }
  };

  useEffect(() => {
    fetchWalletBalance(); // Fetch wallet balance on component mount
    fetchWatchlist();     // Fetch watchlist on component mount
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    const fetchStockDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch quote data from Financial Modeling Prep
        const quoteRes = await axios.get(
          `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${API_KEY}`
        );

        if (quoteRes.data && quoteRes.data.length > 0) {
          const data = quoteRes.data[0];
          setStockData({
            symbol: data.symbol,
            name: data.name,
            price: parseFloat(data.price),
            change: parseFloat(data.change),
            changesPercentage: parseFloat(data.changesPercentage),
            exchange: data.exchange,
            open: parseFloat(data.open),
            dayHigh: parseFloat(data.dayHigh),
            dayLow: parseFloat(data.dayLow),
            previousClose: parseFloat(data.previousClose),
            volume: parseInt(data.volume),
            marketCap: parseFloat(data.marketCap),
            yearHigh: parseFloat(data.yearHigh),
            yearLow: parseFloat(data.yearLow),
          });
        } else {
          console.warn("FMP (quote) response missing data or has API limit message:", quoteRes.data);
          setError('Failed to load real-time stock data. This might be due to FMP API limits or invalid symbol.');
          setStockData(null);
        }

        // Fetch historical data for chart from Financial Modeling Prep
        const historicalRes = await axios.get(
          `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=${API_KEY}`
        );

        if (historicalRes.data && historicalRes.data.historical) {
          // FMP historical data is usually newest to oldest, so reverse to get chronological order
          const historicalDataFormatted = historicalRes.data.historical.slice(0, 30).reverse();
          setHistoricalData(historicalDataFormatted);
        } else {
          console.warn("FMP (historical-price-full) response missing data or has API limit message:", historicalRes.data);
          // If historical data fails, don't set a global error unless stockData also failed
          setHistoricalData(null);
        }

      } catch (err) {
        console.error(`Error fetching details for ${symbol}:`, err);
        setError('Failed to load stock data. Please check your FMP API key, rate limits, or try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchStockDetails();
    }
  }, [symbol]); // Re-run effect if symbol changes

  // Effect for Chart.js initialization and updates
  useEffect(() => {
    if (historicalData && historicalData.length > 0 && chartRef.current) {
      const labels = historicalData.map(data => data.date);
      const prices = historicalData.map(data => data.close);

      // Destroy existing chart instance before creating a new one
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Create new Chart.js instance
      chartInstance.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: `${symbol} Price`,
            data: prices,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `${symbol} Last 30 Days Price`
            },
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              // FMP historical data is already reversed to be chronological in fetchStockDetails
            }
          }
        }
      });
    }

    // Cleanup function: destroy chart instance when component unmounts or data changes
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [historicalData, symbol]); // Include symbol in dependency array for chart updates

  // Function to calculate the required amount based on quantity and price
  const calculateAmount = () => {
    if (!stockData || orderQuantity <= 0) return 0;

    let priceToUse = stockData.price;
    // If limit price is set and valid, use it for calculation
    if (orderType === 'Limit' && parseFloat(limitPrice) > 0) {
      priceToUse = parseFloat(limitPrice);
    }

    return orderQuantity * priceToUse;
  };

  // Functions to open/close modals and handle order placement
  const openBuyModal = () => {
    setShowBuyModal(true);
    setOrderQuantity(1); // Reset quantity
    setOrderType('Market'); // Reset order type
    setLimitPrice(''); // Reset limit price
  };

  const closeBuyModal = () => {
    setShowBuyModal(false);
  };

  const openSellModal = () => {
    setShowSellModal(true);
    setOrderQuantity(1); // Reset quantity
    setOrderType('Market'); // Reset order type
    setLimitPrice(''); // Reset limit price
  };

  const closeSellModal = () => {
    setShowSellModal(false);
  };

  // Check if the current stock is already in the watchlist
  // Add a console log here to inspect `watchlist` before `includes` is called
  console.log("Watchlist state:", watchlist, "Type:", typeof watchlist, "Is Array:", Array.isArray(watchlist));
  const isStockInWatchlist = Array.isArray(watchlist) && watchlist.includes(symbol);


  // Function to add/remove stock from watchlist (now interacts with backend)
  const handleToggleWatchlist = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error("You must be logged in to manage your watchlist.");
      return;
    }

    try {
      if (isStockInWatchlist) {
        // Remove from watchlist
        await axios.post('http://localhost:5000/api/watchlist/remove', { symbol }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWatchlist(prevWatchlist => prevWatchlist.filter(s => s !== symbol));
        toast.success(`${symbol} removed from watchlist.`);
      } else {
        // Add to watchlist
        await axios.post('http://localhost:5000/api/watchlist/add', { symbol }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWatchlist(prevWatchlist => [...prevWatchlist, symbol]);
        toast.success(`${symbol} added to watchlist!`);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error.response ? error.response.data : error.message);
      toast.error(`Failed to update watchlist: ${error.response?.data?.msg || error.message || 'Server error'}`);
    }
  };


  const handleBuyOrder = async () => {
    if (stockData) {
      const price = orderType === 'Limit' && limitPrice ? parseFloat(limitPrice) : stockData.price;
      if (isNaN(price) || price <= 0) {
        toast.error('Please enter a valid price for Limit order.'); // Replaced alert
        return;
      }
      if (orderQuantity <= 0) {
        toast.error('Quantity must be at least 1.'); // Replaced alert
        return;
      }
      const requiredAmount = calculateAmount();
      if (walletBalance === null) {
        toast.error('Wallet balance not loaded yet. Please wait or refresh.'); // Replaced alert
        return;
      }
      if (walletBalance >= requiredAmount) {
        const orderData = {
          stock: stockData.symbol,
          quantity: orderQuantity,
          type: 'buy', // Explicitly set type to 'buy'
          price: price,
        };
        try {
          const token = localStorage.getItem('authToken'); // Get the authentication token
          if (!token) {
            toast.error("You must be logged in to place an order."); // Replaced alert
            return;
          }
          const response = await axios.post('http://localhost:5000/api/orders', orderData, { // Ensure full URL
            headers: {
              Authorization: `Bearer ${token}`, // Send token in Authorization header
            },
          });
          // Replaced alert with toast.success
          toast.success(`Buy Order Placed for ${stockData.symbol}! Quantity: ${orderQuantity}, Price: ${orderType === 'Limit' ? '$' + price.toFixed(2) + ' (Limit)' : 'Market Price'}`);
          fetchWalletBalance(); // Refetch wallet balance after successful order
          closeBuyModal();
          // Orders and Holdings will be updated automatically by the backend
          // The Orders and Holdings components will need to refetch their data
        } catch (error) {
          console.error('Error placing buy order:', error.response ? error.response.data : error.message);
          toast.error(`Failed to place buy order: ${error.response?.data?.msg || error.message || 'Server error'}`); // Replaced alert
        }
      } else {
        toast.error('Insufficient balance.'); // Replaced alert
      }
    } else {
      toast.error('Stock data not loaded yet.'); // Replaced alert
    }
  };

  const handleSellOrder = async () => {
    if (stockData) {
      const price = orderType === 'Limit' && limitPrice ? parseFloat(limitPrice) : stockData.price;
      if (isNaN(price) || price <= 0) {
        toast.error('Please enter a valid price for Limit order.'); // Replaced alert
        return;
      }
      if (orderQuantity <= 0) {
        toast.error('Quantity must be at least 1.'); // Replaced alert
        return;
      }

      const orderData = {
        stock: stockData.symbol,
        quantity: orderQuantity,
        type: 'sell', // Explicitly set type to 'sell'
        price: price,
      };
      try {
        const token = localStorage.getItem('authToken'); // Get the authentication token
        if (!token) {
          toast.error("You must be logged in to place an order."); // Replaced alert
          return;
        }
        const response = await axios.post('http://localhost:5000/api/orders', orderData, { // Ensure full URL
          headers: {
            Authorization: `Bearer ${token}`, // Send token in Authorization header
          },
        });
        // Replaced alert with toast.success
        toast.success(`Sell Order Placed for ${stockData.symbol}! Quantity: ${orderQuantity}, Price: ${orderType === 'Limit' ? '$' + price.toFixed(2) + ' (Limit)' : 'Market Price'}`);
        fetchWalletBalance(); // Refetch wallet balance after successful order
        closeSellModal();
        // Orders and Holdings will be updated automatically by the backend
        // The Orders and Holdings components will need to refetch their data
      } catch (error) {
        console.error('Error placing sell order:', error.response ? error.response.data : error.message);
        toast.error(`Failed to place sell order: ${error.response?.data?.msg || error.message || 'Server error'}`); // Replaced alert
      }
    } else {
      toast.error('Stock data not loaded yet.'); // Replaced alert
    }
  };

  // Loading, error, and no data states
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow flex items-center justify-center">
          <p>Loading stock details...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow flex items-center justify-center text-red-500">
          <p className="text-center max-w-md">{error}</p>
        </main>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow flex items-center justify-center">
          <p>No data found for {symbol}.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8">
          {/* Stock Header */}
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {stockData.name || stockData.symbol} ({stockData.symbol})
          </h2>
          <p className="text-xl text-gray-700 mb-4">Current Price: ${stockData.price.toFixed(2)}</p>
          <p className={`text-lg ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'} mb-6`}>
            Change: {stockData.change.toFixed(2)} ({stockData.changesPercentage.toFixed(2)}%)
          </p>

          {/* Stock Chart Section */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Price Chart</h3>
            {historicalData && historicalData.length > 0 ? (
              <div className="h-96 rounded-lg border border-gray-200 flex items-center justify-center">
                <canvas ref={chartRef} width="400" height="300"></canvas>
              </div>
            ) : (
              <p className="text-gray-500">{historicalData === null ? 'Loading historical chart data...' : 'No historical data available.'}</p>
            )}
          </div>

          {/* Buy, Sell, and Add/Remove from Watchlist Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition duration-300"
              onClick={openBuyModal}
              disabled={!stockData}
            >
              Buy
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition duration-300"
              onClick={openSellModal}
              disabled={!stockData}
            >
              Sell
            </button>
            <button
              className={`py-2 px-6 rounded-lg shadow-lg transition duration-300 font-bold
                ${isStockInWatchlist ? 'bg-gray-400 text-gray-700 hover:bg-gray-500' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              onClick={handleToggleWatchlist} // Changed to toggle function
              disabled={!stockData} // Only disable if stockData is not loaded
            >
              {isStockInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            </button>
          </div>

          {/* Buy Modal */}
          {showBuyModal && stockData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-sm">
                <h3 className="text-xl font-semibold text-green-700 mb-4">Buy {stockData.symbol}</h3>
                <div className="mb-2">
                  <p className="text-gray-700">Wallet Balance: <span className="font-bold">${walletBalance !== null ? walletBalance.toFixed(2) : 'Loading...'}</span></p>
                </div>
                <div className="mb-4">
                  <label htmlFor="orderQuantity" className="block text-gray-700 text-sm font-bold mb-2">
                    Quantity:
                  </label>
                  <input
                    type="number"
                    id="orderQuantity"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter quantity"
                    min="1"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Order Type:</label>
                  <label className="inline-flex items-center mr-4">
                    <input type="radio" className="form-radio text-blue-600" name="orderType" value="Market" checked={orderType === 'Market'} onChange={(e) => setOrderType(e.target.value)} />
                    <span className="ml-2">Market</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="radio" className="form-radio text-blue-600" name="orderType" value="Limit" checked={orderType === 'Limit'} onChange={(e) => setOrderType(e.target.value)} />
                    <span className="ml-2">Limit</span>
                  </label>
                  {orderType === 'Limit' && (
                    <input
                      type="number"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
                      placeholder="Limit Price"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                    />
                  )}
                </div>
                <div className="mb-2">
                  <p className="text-gray-700 font-semibold">Current Price: <span className="font-normal">${stockData.price?.toFixed(2)}</span></p>
                  <p className="text-gray-700 font-semibold">Required Amount: <span className="font-bold">${calculateAmount().toFixed(2)}</span></p>
                </div>
                <div className="flex justify-end gap-4 mt-4">
                  <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={closeBuyModal}>
                    Cancel
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={handleBuyOrder}>
                    Place Buy Order
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sell Modal */}
          {showSellModal && stockData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-sm">
                <h3 className="text-xl font-semibold text-red-700 mb-4">Sell {stockData.symbol}</h3>
                <div className="mb-2">
                  <p className="text-gray-700">Wallet Balance: <span className="font-bold">${walletBalance !== null ? walletBalance.toFixed(2) : 'Loading...'}</span></p>
                </div>
                <div className="mb-4">
                  <label htmlFor="orderQuantity" className="block text-gray-700 text-sm font-bold mb-2">
                    Quantity:
                  </label>
                  <input
                    type="number"
                    id="orderQuantity"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter quantity"
                    min="1"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Order Type:</label>
                  <label className="inline-flex items-center mr-4">
                    <input type="radio" className="form-radio text-blue-600" name="orderType" value="Market" checked={orderType === 'Market'} onChange={(e) => setOrderType(e.target.value)} />
                    <span className="ml-2">Market</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="radio" className="form-radio text-blue-600" name="orderType" value="Limit" checked={orderType === 'Limit'} onChange={(e) => setOrderType(e.target.value)} />
                    <span className="ml-2">Limit</span>
                  </label>
                  {orderType === 'Limit' && (
                    <input
                      type="number"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
                      placeholder="Limit Price"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                    />
                  )}
                </div>
                <div className="mb-2">
                  <p className="text-gray-700 font-semibold">Current Price: <span className="font-normal">${stockData.price?.toFixed(2)}</span></p>
                  <p className="text-gray-700 font-semibold">Estimated Amount: <span className="font-bold">${calculateAmount().toFixed(2)}</span></p>
                </div>
                <div className="flex justify-end gap-4 mt-4">
                  <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={closeSellModal}>
                    Cancel
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={handleSellOrder}>
                    Place Sell Order
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Additional Stock Details */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-md mt-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Stock Data</h3>
            {stockData && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-700 font-semibold">Symbol:</p>
                  <p className="text-gray-600">{stockData.symbol}</p>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Name:</p>
                  <p className="text-gray-600">{stockData.name || 'N/A'}</p> {/* Added N/A fallback */}
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Exchange:</p>
                  <p className="text-gray-600">{stockData.exchange}</p>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Open:</p>
                  <p className="text-gray-600">${stockData.open?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">High:</p>
                  <p className="text-gray-600">${stockData.dayHigh?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Low:</p>
                  <p className="text-gray-600">${stockData.dayLow?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Previous Close:</p>
                  <p className="text-gray-600">${stockData.previousClose?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Volume:</p>
                  <p className="text-gray-600">{stockData.volume?.toLocaleString()}</p>
                </div>
                {/* Market Cap, Year High/Low are available from FMP quote endpoint */}
                <div>
                  <p className="text-gray-700 font-semibold">Market Cap:</p>
                  <p className="text-gray-600">${(stockData.marketCap / 1_000_000_000)?.toFixed(2)}B</p>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Year High:</p>
                  <p className="text-gray-600">${stockData.yearHigh?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Year Low:</p>
                  <p className="text-gray-600">${stockData.yearLow?.toFixed(2)}</p>
                </div>
              </div>
            )}
            {!stockData && <p className="text-gray-500">Loading stock details...</p>}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StockDetail;
