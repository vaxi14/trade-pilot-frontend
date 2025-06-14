import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Bell, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goToCart = () => {
    navigate('/cart');
  };

  const goToNotifications = () => {
    navigate('/notifications');
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="bg-white shadow-lg py-4 px-8 flex items-center justify-between sticky top-0 z-10 border-b border-gray-200">
      {/* Left Section: Brand and Navigation */}
      <div className="flex items-center space-x-8">
        <Link to="/dashboard" className="text-xl font-bold text-indigo-700 tracking-tight focus:outline-none">
          📈 TradePilot
        </Link>
        <nav className="flex space-x-6">
          <Link
            to="/dashboard"
            className={`text-gray-700 hover:text-indigo-600 transition duration-200 font-medium focus:outline-none ${location.pathname === '/dashboard' ? 'underline' : 'hover:underline'}`}
          >
            Dashboard
          </Link>
          <Link
            to="/orders"
            className={`text-gray-700 hover:text-indigo-600 transition duration-200 font-medium focus:outline-none ${location.pathname === '/orders' ? 'underline' : 'hover:underline'}`}
          >
            Orders
          </Link>
          <Link
            to="/holdings"
            className={`text-gray-700 hover:text-indigo-600 transition duration-200 font-medium focus:outline-none ${location.pathname === '/holdings' ? 'underline' : 'hover:underline'}`}
          >
            Holdings
          </Link>
          <Link
            to="/positions"
            className={`text-gray-700 hover:text-indigo-600 transition duration-200 font-medium focus:outline-none ${location.pathname === '/positions' ? 'underline' : 'hover:underline'}`}
          >
            Positions
          </Link>
          <Link
            to="/bids"
            className={`text-gray-700 hover:text-indigo-600 transition duration-200 font-medium focus:outline-none ${location.pathname === '/bids' ? 'underline' : 'hover:underline'}`}
          >
            Bids
          </Link>
          <Link
            to="/funds"
            className={`text-gray-700 hover:text-indigo-600 transition duration-200 font-medium focus:outline-none ${location.pathname === '/funds' ? 'underline' : 'hover:underline'}`}
          >
            Funds
          </Link>
        </nav>
      </div>

      {/* Right Section: Icons */}
      <div className="flex items-center space-x-6">
        <button onClick={goToCart} className="focus:outline-none relative">
          <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-indigo-600 transition duration-200" />
          {/* Optional: Cart badge */}
          {/* <span className="absolute top-[-8px] right-[-8px] bg-indigo-500 text-white text-xs rounded-full px-1.5 py-0.5">3</span> */}
        </button>
        <button onClick={goToNotifications} className="focus:outline-none relative">
          <Bell className="h-6 w-6 text-gray-700 hover:text-indigo-600 transition duration-200" />
          {/* Optional: Notification badge */}
          {/* <span className="absolute top-[-8px] right-[-8px] bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">1</span> */}
        </button>
        <button onClick={goToProfile} className="focus:outline-none">
          <User className="h-6 w-6 text-gray-700 hover:text-indigo-600 transition duration-200" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;