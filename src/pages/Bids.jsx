import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../pages/Navbar'; // Assuming Navbar is in the components folder

const Bids = () => {
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIpo, setSelectedIpo] = useState(null);
  const [lots, setLots] = useState(1); // Default to 1 lot
  const [bidPrice, setBidPrice] = useState(''); // For potential future use
  const [atCutoffPrice, setAtCutoffPrice] = useState(true); // Default to true

  useEffect(() => {
    const fetchIpos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:5000/api/bids/live-ipos');
        setIpos(response.data);
      } catch (err) {
        console.error('Error fetching IPOs:', err);
        setError('Failed to load IPOs.');
      } finally {
        setLoading(false);
      }
    };

    fetchIpos();
  }, []);

  const openModal = (ipo) => {
    setSelectedIpo(ipo);
    setLots(1);
    // For now, let's take the higher end of the price range as the bid price
    const priceMatch = ipo.priceRange && ipo.priceRange.match(/₹(\d+(\.\d+)?)\s*-\s*₹(\d+(\.\d+)?)/);
    setBidPrice(priceMatch ? priceMatch[3] : (ipo.priceRange && ipo.priceRange.replace('₹', '')));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedIpo(null);
  };

  const incrementLots = () => {
    setLots(lots + 1);
  };

  const decrementLots = () => {
    if (lots > 1) {
      setLots(lots - 1);
    }
  };

  const calculateAmount = () => {
    if (selectedIpo && selectedIpo.minLotSize) {
      const price = parseFloat(bidPrice.replace(/[^0-9.]/g, '')) || 0;
      return lots * price * selectedIpo.minLotSize;
    }
    return 'N/A';
  };

  const handleApply = () => {
    if (selectedIpo) {
      alert(`Applied for ${lots} lot(s) of ${selectedIpo.name} at ₹${bidPrice} (cutoff: ${atCutoffPrice ? 'Yes' : 'No'}). Amount to be blocked: ₹${calculateAmount()}`);
      closeModal();
      console.log('Application Details:', {
        ipoName: selectedIpo.name,
        lots: lots,
        bidPrice: bidPrice,
        atCutoffPrice: atCutoffPrice,
        amount: calculateAmount(),
      });
      // In a real application, you would send this data to your backend
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <Navbar />
        <div className="mt-10 text-center">Loading IPOs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Navbar />
        <div className="mt-10 text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Live IPOs</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ipos.map((ipo, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">{ipo.name}</h2>
                <p className="text-gray-600 mb-2">Open Date: {ipo.openDate}</p>
                <p className="text-gray-600 mb-2">Close Date: {ipo.closeDate}</p>
                <p className="text-gray-600 mb-2">Listing Date: {ipo.listingDate}</p>
                <p className="text-indigo-600 font-medium">Price Range: {ipo.priceRange}</p>
                <button
                  onClick={() => openModal(ipo)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
        {ipos.length === 0 && !loading && !error && (
          <div className="mt-6 text-center text-gray-500">No live IPOs available at the moment.</div>
        )}

        {/* Apply IPO Modal (Styled like the image) */}
        {isModalOpen && selectedIpo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-md shadow-xl w-96 p-6">
              <h2 className="text-lg font-semibold mb-4">{selectedIpo.name}</h2>
              <div className="mb-3">
                <label htmlFor="applyAs" className="block text-gray-700 text-sm font-bold mb-1">Apply as</label>
                <select id="applyAs" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option>Regular</option>
                </select>
              </div>
              <div className="mb-3 flex items-center justify-between">
                <label className="block text-gray-700 text-sm font-bold">Shares Lot of {selectedIpo.minLotSize}</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={decrementLots}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={lots}
                    readOnly
                    className="shadow appearance-none border rounded w-12 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center"
                  />
                  <button
                    onClick={incrementLots}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="bidPrice" className="block text-gray-700 text-sm font-bold mb-1">Bid Price</label>
                <input
                  type="text"
                  id="bidPrice"
                  value={bidPrice ? `₹${bidPrice}` : 'N/A'}
                  readOnly
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="cutoffPrice"
                  checked={atCutoffPrice}
                  onChange={() => setAtCutoffPrice(!atCutoffPrice)}
                  className="mr-2 leading-tight"
                />
                <label htmlFor="cutoffPrice" className="text-sm text-gray-700">At cutoff price</label>
              </div>
              <div className="mb-4 text-sm text-gray-700">
                To Be Blocked <span className="font-semibold">₹{calculateAmount()}</span>
              </div>
              <div className="flex justify-end">
                <button onClick={closeModal} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                  Cancel
                </button>
                <button onClick={handleApply} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bids;