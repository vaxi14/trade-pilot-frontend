// components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="w-full px-6 lg:px-20 py-4 flex items-center justify-between bg-white shadow-sm">
      {/* Left: Logo */}
      <div className="text-2xl font-bold text-blue-600">
        <Link to="/">TradePilot</Link>
      </div>

      {/* Center: Navigation Links */}
      <ul className="hidden md:flex space-x-8 text-gray-700 font-medium">
        <li>
          <Link to="/about" className="hover:text-blue-600 transition-colors">About Us</Link>
        </li>
        <li>
          <Link to="/product" className="hover:text-blue-600 transition-colors">Product</Link>
        </li>
        <li>
          <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link>
        </li>
      </ul>

      {/* Right: Login and Signup Buttons */}
      <div className="space-x-4">
        <Link to="/login">
          <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition">
            Login
          </button>
        </Link>
        <Link to="/signup">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Sign Up
          </button>
        </Link>
      </div>
    </nav>
  );
}
