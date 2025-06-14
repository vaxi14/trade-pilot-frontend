import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../pages/Navbar'; // Adjusted path: Assuming Navbar.jsx is in src/components/
import Modal from 'react-modal';

// IMPORTANT: Using your Financial Modeling Prep API Key for Dashboard
const API_KEY = 'I36Mtj9GXIUz9dNjIh5SpJRYITZ6DpXb'; // Your FMP API Key
const API_URL_QUOTE = 'https://financialmodelingprep.com/api/v3/quote/'; // FMP Quote API URL for individual stock quotes

// Set the app element for react-modal to prevent accessibility issues
// You should set this to your app's root element.
// If you are using create-react-app, it's typically 'root'.
// Ensure you have `react-modal` installed: npm install react-modal or yarn add react-modal
Modal.setAppElement('#root');


const Dashboard = () => {
  const [appleData, setAppleData] = useState(null);
  const [microsoftData, setMicrosoftData] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const topStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'BRK-B'];

  // --- States for financial data from backend ---
  const [holdings, setHoldings] = useState([]); // Aggregated holdings from backend
  const [fundTransactions, setFundTransactions] = useState([]); // Kept for consistency, though not directly used in Dashboard UI summary
  const [walletBalance, setWalletBalance] = useState(null); // Wallet balance from backend
  const [loadingFunds, setLoadingFunds] = useState(true); // For backend financial data
  const [fundsError, setFundsError] = useState(null);

  // States for FMP prices of held stocks
  const [currentPrices, setCurrentPrices] = useState({});
  const [previousDayPrices, setPreviousDayPrices] = useState({}); // For 1D P&L simulation if needed

  // States for the AAPL chart (FMP data)
  const [aaplChartData, setAaplChartData] = useState(null);
  const [loadingChart, setLoadingChart] = useState(true); // For FMP chart data
  const [chartError, setChartError] = useState(null);

  // States for FMP stock quotes (for Apple/Microsoft quick look)
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [quotesError, setQuotesError] = useState(null);

  // Custom Notification State
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });

  // Function to show custom notification
  const showNotification = useCallback((message, type) => {
    setNotification({ message, type, visible: true });
    const timer = setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 5000); // Notification visible for 5 seconds
    return () => clearTimeout(timer);
  }, []);

  // --- Data Fetching Callbacks ---

  // Fetch holdings from the backend
  const fetchHoldings = useCallback(async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/holdings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // The backend 'holdings' endpoint returns aggregated holding documents (buyQty, buyCost, sellQty, sellCost)
      setHoldings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching holdings:', error);
      throw new Error(`Failed to fetch holdings: ${error.response?.data?.msg || error.message}`);
    }
  }, []);

  // Fetch fund transactions from the backend
  const fetchFundTransactions = useCallback(async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/funds/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFundTransactions(Array.isArray(response.data?.transactions) ? response.data.transactions : []);
    } catch (error) {
      console.error('Error fetching fund transactions:', error);
      throw new Error(`Failed to fetch fund transactions: ${error.response?.data?.msg || error.message}`);
    }
  }, []);

  // Fetch wallet balance from the backend
  const fetchWalletBalance = useCallback(async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/wallet', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedBalance = typeof response.data.walletBalance === 'number' ? response.data.walletBalance : 0;
      setWalletBalance(fetchedBalance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw new Error(`Failed to fetch wallet balance: ${error.response?.data?.msg || error.message}`);
    }
  }, []);

  // Fetch current prices (and simulate previous day prices) for stocks in user's holdings
  const fetchPricesForHeldStocks = useCallback(async (heldStocks) => {
    const prices = {};
    const prevPrices = {};
    if (heldStocks.length > 0 && API_KEY) {
      // Get unique stock symbols from holdings
      const uniqueStocks = [...new Set(heldStocks.map(h => h.stock))];

      await Promise.all(
        uniqueStocks.map(async (stock) => {
          try {
            const response = await axios.get(`${API_URL_QUOTE}${stock}?apikey=${API_KEY}`);
            const data = response.data;
            if (data && data.length > 0) {
              prices[stock] = data[0].price || 0;
              prevPrices[stock] = data[0].previousClose || (prices[stock] * (0.98 + Math.random() * 0.04)); // Simulate prev close if not available
            } else {
              prices[stock] = 0;
              prevPrices[stock] = 0;
              console.warn(`FMP API for ${stock} returned no data for current/previous prices on Dashboard.`);
            }
          } catch (error) {
            console.error(`Error fetching price for ${stock} on dashboard:`, error.response?.data || error.message);
            prices[stock] = 0;
            prevPrices[stock] = 0;
          }
        })
      );
    }
    setCurrentPrices(prices);
    setPreviousDayPrices(prevPrices);
  }, [API_KEY]);


  // Fetch AAPL historical chart data from FMP
  const fetchAAPLChart = useCallback(async () => {
    setLoadingChart(true);
    setChartError(null);
    try {
      const chartRes = await axios.get(
        `https://financialmodelingprep.com/api/v3/historical-chart/1hour/AAPL?apikey=${API_KEY}&limit=24`
      );
      if (chartRes.data && Array.isArray(chartRes.data)) {
        setAaplChartData(chartRes.data.reverse()); // Oldest to newest for chart
      } else {
        console.warn("FMP (AAPL Chart) response issue:", chartRes.data);
        setAaplChartData([]);
        setChartError('Unexpected AAPL chart data format.');
      }
    } catch (error) {
      console.error('Error fetching AAPL chart data:', error);
      setChartError('Failed to load AAPL chart.');
      setAaplChartData([]);
    } finally {
      setLoadingChart(false);
    }
  }, [API_KEY]);

  // Fetch initial stock data (Apple, Microsoft) from FMP
  const fetchStockQuotes = useCallback(async () => {
    setLoadingQuotes(true);
    setQuotesError(null);
    try {
      const [appleRes, microsoftRes] = await Promise.all([
        axios.get(`${API_URL_QUOTE}AAPL?apikey=${API_KEY}`),
        axios.get(`${API_URL_QUOTE}MSFT?apikey=${API_KEY}`)
      ]);

      if (appleRes.data && appleRes.data.length > 0) {
        setAppleData({
          price: appleRes.data[0].price,
          change: appleRes.data[0].change,
          changePercent: appleRes.data[0].changesPercentage,
        });
      } else {
        console.warn("FMP (AAPL Quote) response issue:", appleRes.data);
        setAppleData(null);
      }

      if (microsoftRes.data && microsoftRes.data.length > 0) {
        setMicrosoftData({
          price: microsoftRes.data[0].price,
          change: microsoftRes.data[0].change,
          changePercent: microsoftRes.data[0].changesPercentage,
        });
      } else {
        console.warn("FMP (MSFT Quote) response issue:", microsoftRes.data);
        setMicrosoftData(null);
      }
    } catch (error) {
      console.error('Error fetching FMP stock quotes:', error);
      if (error.response?.data?.['Error Message']) {
        console.error('FMP API Error:', error.response.data['Error Message']);
        setQuotesError(`FMP API Error: ${error.response.data['Error Message']}`);
      } else {
        setQuotesError('Failed to load stock quotes.');
      }
      setAppleData(null);
      setMicrosoftData(null);
    } finally {
      setLoadingQuotes(false);
    }
  }, [API_KEY]);


  // --- DYNAMIC FINANCIAL CALCULATIONS (Derived from fetched backend data and FMP prices) ---

  // Calculate aggregated portfolio values
  const { totalAmountInvested, totalMarketValue, totalPnl } = useMemo(() => {
    let totalAmountInvested = 0;
    let totalMarketValue = 0;
    let totalPnl = 0;

    holdings.forEach(holding => {
      const netQty = (holding.buyQty || 0) - (holding.sellQty || 0);
      // Only consider holdings with a net positive quantity
      if (netQty > 0) {
        const avgPrice = (holding.buyQty > 0) ? (holding.buyCost / holding.buyQty) : 0;
        const currentPrice = currentPrices[holding.stock] || 0; // Get current price for this stock

        const investedAmountForStock = avgPrice * netQty;
        const marketValueForStock = currentPrice * netQty;
        const pnlForStock = marketValueForStock - investedAmountForStock;

        totalAmountInvested += investedAmountForStock;
        totalMarketValue += marketValueForStock;
        totalPnl += pnlForStock;
      }
    });
    return { totalAmountInvested, totalMarketValue, totalPnl };
  }, [holdings, currentPrices]);


  const marginUsed = useMemo(() => {
    // On the dashboard, 'Margin Used' can be considered as the total capital invested in current positions.
    return totalAmountInvested;
  }, [totalAmountInvested]);


  const currentLiquidBalance = useMemo(() => {
    // This is the raw wallet balance from the backend, representing liquid cash.
    return typeof walletBalance === 'number' ? walletBalance : 0;
  }, [walletBalance]);


  const marginAvailable = useMemo(() => {
    // Calculate available margin based on the current liquid balance minus margin used.
    const calculated = currentLiquidBalance - marginUsed;
    return Math.max(0, calculated); // Ensure it doesn't go negative
  }, [currentLiquidBalance, marginUsed]);

  const numberOfUniqueStocks = useMemo(() => {
    if (!Array.isArray(holdings)) return 0;
    // Count unique stocks where the net quantity held is greater than 0
    const uniqueSymbols = new Set(
      holdings.filter(h => ((h.buyQty || 0) - (h.sellQty || 0)) > 0).map(holding => holding.stock)
    );
    return uniqueSymbols.size;
  }, [holdings]);


  // --- Main Data Fetching Effects ---

  // Effect to fetch backend financial data (holdings, fund transactions, wallet balance)
  useEffect(() => {
    const fetchAllBackendData = async () => {
      setLoadingFunds(true);
      setFundsError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setFundsError('Authentication token not found. Please log in.');
          setLoadingFunds(false);
          return;
        }
        await Promise.all([
          fetchHoldings(token),
          fetchFundTransactions(token),
          fetchWalletBalance(token),
        ]);
      } catch (error) {
        setFundsError(error.message || 'Failed to load financial data.');
        setHoldings([]);
        setFundTransactions([]);
        setWalletBalance(0);
        showNotification(`Dashboard data load error: ${error.message}`, 'error');
      } finally {
        setLoadingFunds(false);
      }
    };

    fetchAllBackendData();
    // Set up interval for refreshing backend data
    const backendDataInterval = setInterval(fetchAllBackendData, 60000); // Every minute

    return () => clearInterval(backendDataInterval);
  }, [fetchHoldings, fetchFundTransactions, fetchWalletBalance, showNotification]);

  // Effect to fetch FMP stock quotes (Apple, Microsoft) and AAPL chart data
  useEffect(() => {
    fetchStockQuotes(); // For quick look stocks
    fetchAAPLChart();  // For Apple chart

    // Set up intervals for refreshing FMP data
    const quoteInterval = setInterval(fetchStockQuotes, 30000); // Every 30 seconds
    const chartInterval = setInterval(fetchAAPLChart, 30000); // Every 30 seconds

    return () => {
      clearInterval(quoteInterval);
      clearInterval(chartInterval);
    };
  }, [fetchStockQuotes, fetchAAPLChart]);

  // Effect to fetch FMP prices specifically for the user's held stocks
  useEffect(() => {
    if (!loadingFunds && holdings.length > 0) {
      fetchPricesForHeldStocks(holdings);
      // Set up interval for refreshing prices of held stocks
      const priceInterval = setInterval(() => fetchPricesForHeldStocks(holdings), 30000); // Every 30 seconds
      return () => clearInterval(priceInterval);
    }
  }, [loadingFunds, holdings, fetchPricesForHeldStocks]); // Depends on holdings and loading status


  // --- Event Handlers ---
  const handleStockClick = (symbol) => {
    navigate(`/stock/${symbol}`);
  };

  const handleMoreStocksClick = () => {
    navigate('/more-stocks');
  };

  const handleStartInvestingClick = () => {
    navigate('/more-stocks'); // Directly navigate to MoreStocks page
  };


  // --- Render Logic ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 font-inter text-gray-800">
      <Navbar />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 text-center animate-fade-in-down">
          Your Investment Hub
        </h1>

        {/* Custom Notification Display */}
        {notification.visible && (
          <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 transition-transform transform ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            'bg-gray-700 text-white'
          } animate-slide-in-right`}>
            {notification.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Quick Stock Look (Left Sidebar) */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-1 border border-gray-200 animate-slide-in-left">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0-10V5a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2zm9 10v-3a2 2 0 00-2-2h-2a2 2 0 00-2 2v3a2 2 0 002 2h2a2 2 0 002-2zm0-10V9a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              Quick Stock Look
            </h2>
            <input
              type="text"
              placeholder="Search stocks (e.g., AAPL)..."
              value={search}
              onChange={(e) => setSearch(e.target.value.toUpperCase())}
              onKeyPress={(e) => { if (e.key === 'Enter' && search) handleStockClick(search); }}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 mb-4 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
            {loadingQuotes && <p className="text-gray-500 text-sm my-2">Loading quotes...</p>}
            {quotesError && <p className="text-red-500 text-sm my-2">{quotesError}</p>}

            {/* Apple Stock Card */}
            <div
              className="mb-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border border-gray-200 transition-all duration-200 transform hover:scale-105"
              onClick={() => handleStockClick('AAPL')}
            >
              <h3 className="font-semibold text-md sm:text-lg text-gray-800 mb-1">Apple (AAPL)</h3>
              {appleData ? (
                <p className={`${appleData.change >= 0 ? 'text-green-600' : 'text-red-600'} text-sm font-medium`}>
                  ${appleData.price?.toFixed(2)} ({appleData.change >= 0 ? '+' : ''}
                  {appleData.change?.toFixed(2)} | {appleData.changePercent?.toFixed(2)}%)
                </p>
              ) : !loadingQuotes && !quotesError && (
                <p className="text-gray-500 text-sm">Apple data not available.</p>
              )}
            </div>
            {/* Microsoft Stock Card */}
            <div
              className="mb-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border border-gray-200 transition-all duration-200 transform hover:scale-105"
              onClick={() => handleStockClick('MSFT')}
            >
              <h3 className="font-semibold text-md sm:text-lg text-gray-800 mb-1">Microsoft (MSFT)</h3>
              {microsoftData ? (
                <p className={`${microsoftData.change >= 0 ? 'text-green-600' : 'text-red-600'} text-sm font-medium`}>
                  ${microsoftData.price?.toFixed(2)} ({microsoftData.change >= 0 ? '+' : ''}
                  {microsoftData.change?.toFixed(2)} | {microsoftData.changePercent?.toFixed(2)}%)
                </p>
              ) : !loadingQuotes && !quotesError && (
                <p className="text-gray-500 text-sm">Microsoft data not available.</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 text-lg sm:text-xl">Top Stocks</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {topStocks.map(stock => (
                  <div
                    key={stock}
                    className="p-3 bg-blue-50 text-blue-800 rounded-lg shadow-sm text-center cursor-pointer hover:bg-blue-100 border border-blue-200 transition-all duration-200 transform hover:scale-105"
                    onClick={() => handleStockClick(stock)}
                  >
                    <span className="font-medium text-sm sm:text-base">{stock}</span>
                  </div>
                ))}
              </div>
              <button
                className="bg-green-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-green-700 transition duration-300 w-full font-semibold text-base sm:text-lg transform hover:translate-y-0.5"
                onClick={handleMoreStocksClick}
              >
                Explore More Stocks
              </button>
            </div>
          </div>

          {/* Equity Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2 lg:col-span-1 border border-gray-200 animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Equity Overview
            </h2>
            {loadingFunds ? (
              <p className="text-gray-500 text-base sm:text-lg">Loading financial data...</p>
            ) : fundsError ? (
              <p className="text-red-500 text-base sm:text-lg">{fundsError}</p>
            ) : (
              <div className="space-y-3 text-sm sm:text-base">
                <p className="text-gray-700 ">
                  Stocks Held: <span className="font-semibold text-indigo-700">{numberOfUniqueStocks}</span>
                </p>
                <p className="text-gray-700 ">
                  Amount Invested: <span className="font-semibold text-blue-600">₹{totalAmountInvested.toFixed(2)}</span>
                </p>
                
                
                <p className="text-gray-700 ">
                  Margin Available: <span className="font-semibold text-green-600">₹{marginAvailable.toFixed(2)}</span>
                </p>
                <hr className="my-2 border-gray-200"/>
                <p className="text-gray-800 font-semibold">
                  Wallet Balance: <span className="font-bold">₹{currentLiquidBalance.toFixed(2)}</span>
                </p>
                <button
                  onClick={handleStartInvestingClick}
                  className="mt-5 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 font-semibold text-base sm:text-lg w-full transform hover:translate-y-0.5"
                >
                  Start Investing
                </button>
              </div>
            )}
          </div>

          {/* Commodity Section (Placeholder) */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2 lg:col-span-1 border border-gray-200 animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 mr-2 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h10M7 20h10M4 3h16M6 9l3-3m-3 3l3 3m5 3l3-3m-3 3l3 3" />
              </svg>
              Commodity Overview
            </h2>
            <div className="space-y-3 text-sm sm:text-base">
              <p className="text-gray-700">Value: <span className="font-semibold">₹0.00</span></p>
              <p className="text-gray-700">Margin Available: <span className="font-semibold">₹0.00</span></p>
              <p className="text-gray-700">Margins Used: <span className="font-semibold">₹0.00</span></p>
              <p className="text-gray-700">Opening Balance: <span className="font-semibold">₹0.00</span></p>
              <button className="mt-5 text-blue-600 hover:text-blue-800 underline font-medium text-base sm:text-lg">View Statement</button>
            </div>
          </div>

          {/* Apple Stock Chart Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-3 border border-gray-200 animate-fade-in-up">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-5 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              AAPL Hourly Performance (Last 24 Hours)
            </h2>
            <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 p-4 overflow-hidden">
              {loadingChart ? (
                <p className="text-gray-600 text-lg sm:text-xl font-medium animate-pulse">Loading AAPL Chart Data...</p>
              ) : chartError ? (
                <p className="text-red-500 text-center text-lg sm:text-xl font-medium p-4">{chartError}</p>
              ) : aaplChartData && aaplChartData.length > 0 ? (
                <div className="w-full h-full flex flex-col justify-between">
                  <div className="flex justify-between items-end h-full">
                    {aaplChartData.slice(0, 24).map((item) => (
                      <div
                        key={item.date}
                        className="flex flex-col items-center justify-end h-full mx-0.5"
                        style={{ width: `${100 / Math.min(aaplChartData.length, 24)}%` }}
                      >
                        <div
                          className="bg-blue-400 rounded-t-sm transition-all duration-300 ease-out hover:bg-blue-600 group relative w-full" // Added w-full for bar width
                          style={{ height: `${(item.close / Math.max(...aaplChartData.slice(0, 24).map(d => d.close))) * 90 + 10}%` }}
                        >
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            ${item.close?.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 text-center transform rotate-45 origin-top-left sm:rotate-0 sm:origin-center whitespace-nowrap truncate w-full">
                          {new Date(item.date).getHours()}:00
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-4 italic text-center">
                    (Simulated bar chart. For interactive graphs, consider libraries like Chart.js or Recharts.)
                  </p>
                </div>
              ) : (
                <p className="text-gray-600 text-lg sm:text-xl font-medium">No AAPL chart data available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal for future enhancements */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          className="p-6 bg-white w-11/12 sm:w-4/5 max-w-md mx-auto mt-20 rounded-lg shadow-xl border border-gray-300"
          overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Information</h2>
            <button className="text-gray-500 hover:text-gray-700" onClick={() => setIsModalOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-700 mb-6">
            This is a placeholder modal. The "Start Investing" button currently navigates directly to the stock exploration page.
          </p>
          <div className="flex justify-end">
            <button className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition duration-150" onClick={() => setIsModalOpen(false)}>
              Close
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;
