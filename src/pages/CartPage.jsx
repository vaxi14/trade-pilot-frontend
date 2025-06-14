import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the CSS

// IMPORTANT: Using your Financial Modeling Prep API Key for CartPage
const API_KEY = 'I36Mtj9GXIUz9dNjIh5SpJRYITZ6DpXb'; // Your FMP API Key

const CartPage = () => {
  const [watchlistStocks, setWatchlistStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWatchlistAndPrices = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error("Authentication token not found.");
          setError("Not authenticated. Please log in.");
          setLoading(false);
          return;
        }

        // 1. Fetch the user's watchlist symbols from the backend
        const watchlistResponse = await axios.get('http://localhost:5000/api/watchlist', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const watchlistSymbols = watchlistResponse.data;

        if (watchlistSymbols && watchlistSymbols.length > 0) {
          // 2. Fetch the current quote for each stock in the watchlist
          const pricePromises = watchlistSymbols.map(symbol =>
            axios.get(`https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${API_KEY}`)
              .then(res => res.data[0])
              .catch(err => {
                console.error(`Failed to fetch quote for ${symbol}:`, err);
                return null; // Handle individual fetch errors
              })
          );

          const stockQuotes = await Promise.all(pricePromises);
          // Filter out any null results from failed fetches
          const validStockData = stockQuotes.filter(data => data);
          setWatchlistStocks(validStockData);
        } else {
          setWatchlistStocks([]); // No items in watchlist
        }
      } catch (err) {
        console.error("Error fetching watchlist data:", err);
        setError("Failed to load watchlist.");
        setWatchlistStocks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlistAndPrices();
  }, []);

  const handleStockClick = (symbol) => {
    // Corrected path to match the route in App.jsx (singular 'stock')
    navigate(`/stock/${symbol}`);
  };

  const handleDeleteWatchlistItem = async (symbolToDelete) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error("You must be logged in.");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/watchlist/remove', { symbol: symbolToDelete }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update the frontend state to remove the item
      setWatchlistStocks(prevStocks => prevStocks.filter(stock => stock.symbol !== symbolToDelete));
      toast.success(`${symbolToDelete} removed from watchlist.`);
    } catch (error) {
      console.error('Error removing from watchlist:', error.response ? error.response.data : error.message);
      toast.error(`Failed to remove ${symbolToDelete} from watchlist.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">🛒 Watchlist</h1>
          <p>Loading your watchlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">🛒 Watchlist</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">🛒 Watchlist ({watchlistStocks.length})</h1>
        {watchlistStocks.length === 0 ? (
          <p>Your watchlist is empty.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlistStocks.map(stock => (
              <div key={stock.symbol} className="bg-white shadow rounded-lg p-4 relative">
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteWatchlistItem(stock.symbol)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 focus:outline-none"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
                {/* Clickable Stock Info */}
                <div onClick={() => handleStockClick(stock.symbol)} className="cursor-pointer">
                  <h2 className="text-xl font-semibold text-gray-800">{stock.name || stock.symbol} ({stock.symbol})</h2>
                  <p className="text-gray-600">Price: ${stock.price?.toFixed(2)}</p>
                  <p className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Change: {stock.change?.toFixed(2)} ({stock.changesPercentage?.toFixed(2)}%)
                  </p>
                  {/* Add more details here if you like */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;