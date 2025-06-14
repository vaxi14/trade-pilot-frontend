import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const mockPositions = {
  intraday: [
    { symbol: 'TATAMOTORS', qty: 20, avgPrice: 920 },
    { symbol: 'INFY', qty: 10, avgPrice: 1420 }
  ],
  futures: [
    { symbol: 'NIFTY24MAYFUT', qty: 1, avgPrice: 22350 },
    { symbol: 'BANKNIFTY24MAYFUT', qty: 2, avgPrice: 48000 }
  ],
  options: [
    { symbol: 'RELIANCE24MAY2500CE', qty: 3, avgPrice: 32 },
    { symbol: 'TCS24MAY3600PE', qty: 5, avgPrice: 45 }
  ]
};

const PositionTab = ({ data, livePrices }) => {
  const calculatePnL = (symbol, avg, qty) => {
    const ltp = livePrices[symbol] || avg; // fallback to avg
    const pnl = (ltp - avg) * qty;
    const pnlPercent = ((ltp - avg) / avg) * 100;
    return {
      pnl: pnl.toFixed(2),
      pnlPercent: pnlPercent.toFixed(2),
      ltp: ltp.toFixed(2)
    };
  };

  return (
    
    <table className="min-w-full text-sm text-left">
        
      <thead className="border-b font-medium">
        
        <tr>
          <th className="px-4 py-2">Symbol</th>
          <th className="px-4 py-2">Qty</th>
          <th className="px-4 py-2">Avg Price</th>
          <th className="px-4 py-2">LTP</th>
          <th className="px-4 py-2">P&L</th>
          <th className="px-4 py-2">P&L %</th>
          <th className="px-4 py-2">Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map(pos => {
          const { pnl, pnlPercent, ltp } = calculatePnL(pos.symbol, pos.avgPrice, pos.qty);
          return (
            
            <tr key={pos.symbol} className="border-b hover:bg-gray-50">
                
              <td className="px-4 py-2">{pos.symbol}</td>
              <td className="px-4 py-2">{pos.qty}</td>
              <td className="px-4 py-2">₹{pos.avgPrice}</td>
              <td className="px-4 py-2 text-blue-600">₹{ltp}</td>
              <td className={`px-4 py-2 ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{pnl}</td>
              <td className={`px-4 py-2 ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>{pnlPercent}%</td>
              <td className="px-4 py-2">
                <button className="bg-red-500 text-white px-3 py-1 rounded">Exit</button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const Positions = () => {
  const [selectedTab, setSelectedTab] = useState('intraday');
  const [livePrices, setLivePrices] = useState({});

  useEffect(() => {
    const fetchLivePrices = async () => {
      const symbols = Object.values(mockPositions).flat().map(p => p.symbol).join(',');
      try {
        const res = await axios.get(`https://financialmodelingprep.com/api/v3/quote/${symbols}?apikey=demo`);
        const prices = {};
        res.data.forEach(stock => {
          prices[stock.symbol] = stock.price;
        });
        setLivePrices(prices);
      } catch (err) {
        console.error('Live price fetch error', err);
      }
    };
    fetchLivePrices();
  }, []);

  return (
    <div className="p-6">
        <Navbar/>
      <h1 className="text-2xl mt-10 font-bold mb-4">Your Positions</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b pb-2">
        {['intraday', 'futures', 'options'].map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`capitalize px-4 py-1 ${
              selectedTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                : 'text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Position Table */}
      <div className="bg-white p-4 rounded shadow overflow-x-auto">
        <PositionTab data={mockPositions[selectedTab]} livePrices={livePrices} />
      </div>
    </div>
  );
};

export default Positions;
