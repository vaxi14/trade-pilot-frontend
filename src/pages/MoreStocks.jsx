import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
// axios import is no longer strictly needed for fetching the list,
// but kept for consistency if you add other API calls later.
// import axios from 'axios';

// Removed API_KEY as we are using a hardcoded list for now

const MoreStocks = () => {
  // Hardcoded list of common stocks for display
  // In a real application with a paid API, this would be fetched dynamically.
  const allAvailableStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', exchange: 'NASDAQ' },
    { symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)', exchange: 'NASDAQ' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
    { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ' },
    { symbol: 'META', name: 'Meta Platforms Inc. (Class A)', exchange: 'NASDAQ' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', exchange: 'NASDAQ' },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc. (Class B)', exchange: 'NYSE' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE' },
    { symbol: 'V', name: 'Visa Inc. (Class A)', exchange: 'NYSE' },
    { symbol: 'UNH', name: 'UnitedHealth Group Inc.', exchange: 'NYSE' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE' },
    { symbol: 'XOM', name: 'Exxon Mobil Corp.', exchange: 'NYSE' },
    { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE' },
    { symbol: 'PG', name: 'Procter & Gamble Co.', exchange: 'NYSE' },
    { symbol: 'HD', name: 'The Home Depot Inc.', exchange: 'NYSE' },
    { symbol: 'MA', name: 'Mastercard Inc. (Class A)', exchange: 'NYSE' },
    { symbol: 'BAC', name: 'Bank of America Corp.', exchange: 'NYSE' },
    { symbol: 'KO', name: 'The Coca-Cola Co.', exchange: 'NYSE' },
    { symbol: 'PFE', name: 'Pfizer Inc.', exchange: 'NYSE' },
    { symbol: 'DIS', name: 'The Walt Disney Co.', exchange: 'NYSE' },
    { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ' },
    { symbol: 'ADBE', name: 'Adobe Inc.', exchange: 'NASDAQ' },
    { symbol: 'CRM', name: 'Salesforce Inc.', exchange: 'NYSE' },
    { symbol: 'INTC', name: 'Intel Corp.', exchange: 'NASDAQ' },
    { symbol: 'CSCO', name: 'Cisco Systems Inc.', exchange: 'NASDAQ' },
    { symbol: 'PEP', name: 'PepsiCo Inc.', exchange: 'NASDAQ' },
    { symbol: 'CMCSA', name: 'Comcast Corp. (Class A)', exchange: 'NASDAQ' },
    { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', exchange: 'NASDAQ' },
    { symbol: 'QCOM', name: 'QUALCOMM Inc.', exchange: 'NASDAQ' },
    { symbol: 'SBUX', name: 'Starbucks Corp.', exchange: 'NASDAQ' },
    { symbol: 'GE', name: 'General Electric Co.', exchange: 'NYSE' },
    { symbol: 'BA', name: 'The Boeing Co.', exchange: 'NYSE' },
    { symbol: 'NKE', name: 'Nike Inc. (Class B)', exchange: 'NYSE' },
    { symbol: 'MCD', name: 'McDonald\'s Corp.', exchange: 'NYSE' },
    { symbol: 'IBM', name: 'International Business Machines Corp.', exchange: 'NYSE' },
    { symbol: 'CAT', name: 'Caterpillar Inc.', exchange: 'NYSE' },
    { symbol: 'MMM', name: '3M Co.', exchange: 'NYSE' },
    { symbol: 'GS', name: 'The Goldman Sachs Group Inc.', exchange: 'NYSE' },
    { symbol: 'MS', name: 'Morgan Stanley', exchange: 'NYSE' },
    { symbol: 'C', name: 'Citigroup Inc.', exchange: 'NYSE' },
    { symbol: 'USB', name: 'U.S. Bancorp', exchange: 'NYSE' },
    { symbol: 'T', name: 'AT&T Inc.', exchange: 'NYSE' },
    { symbol: 'VZ', name: 'Verizon Communications Inc.', exchange: 'NYSE' },
    { symbol: 'KO', name: 'The Coca-Cola Co.', exchange: 'NYSE' },
    { symbol: 'WBA', name: 'Walgreens Boots Alliance Inc.', exchange: 'NASDAQ' },
    { symbol: 'MDLZ', name: 'Mondelez International Inc. (Class A)', exchange: 'NASDAQ' },
    { symbol: 'PYPL', name: 'PayPal Holdings Inc.', exchange: 'NASDAQ' },
    { symbol: 'INTU', name: 'Intuit Inc.', exchange: 'NASDAQ' },
    { symbol: 'AMGN', name: 'Amgen Inc.', exchange: 'NASDAQ' },
  ];

  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false); // No loading as data is hardcoded
  const [error, setError] = useState(null); // No error as data is hardcoded
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API call delay if desired, otherwise just set stocks
    setStocks(allAvailableStocks);
  }, []); // Run once on mount

  const handleStockClick = (symbol) => {
    navigate(`/stock/${symbol}`);
  };

  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Removed loading and error states for hardcoded data, but kept for future dynamic fetching
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 p-6">
        <p className="text-gray-700 text-lg">Loading a universe of stocks for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 p-6">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-6">
        <Navbar/>
      <div className="max-w-7xl mx-auto w-full bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">Explore More Stocks</h1>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by symbol or company name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>

        {/* Stock List Grid */}
        {filteredStocks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredStocks.map(stock => (
              <div
                key={stock.symbol}
                className="bg-white border border-gray-200 rounded-lg shadow-md p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg hover:border-blue-400 transition-all duration-200 ease-in-out"
                onClick={() => handleStockClick(stock.symbol)}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-1">{stock.symbol}</h3>
                <p className="text-sm text-gray-600 truncate w-full">{stock.name}</p>
                <p className="text-xs text-gray-500 mt-1">{stock.exchange}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 text-lg mt-10">No stocks found matching your search.</p>
        )}
      </div>
    </div>
  );
};

export default MoreStocks;