import React from 'react';
import Navbar from '../components/Navbar'; // Assuming Navbar is in the same directory or adjust path

// --- Professional React Component for Products Page ---

const ProductPage = () => {
  const products = [
    {
      id: 'equity',
      name: 'Equity Trading',
      tagline: 'Invest in stocks with ease and confidence.',
      description: 'Access a wide range of Indian and international equities. Our platform provides advanced charting tools, real-time data, and seamless execution for your stock investments. Benefit from low brokerage and transparent pricing.',
      features: [
        'Zero brokerage on equity delivery',
        'Advanced charting with multiple indicators',
        'Real-time market data',
        'Intuitive order placement',
        'Direct mutual fund investments'
      ],
      icon: (
        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c-1.31 0-2.5-1.02-2.5-2.5S7.69 14 9 14s2.5 1.02 2.5 2.5S10.31 19 9 19zm12-3c-1.31 0-2.5-1.02-2.5-2.5S19.69 11 21 11s2.5 1.02 2.5 2.5S22.31 16 21 16zm-9-1c-1.31 0-2.5-1.02-2.5-2.5S10.31 8 9 8s2.5 1.02 2.5 2.5S10.31 13 9 13z" />
        </svg>
      ),
      cta: 'Start Equity Trading'
    },
    {
      id: 'derivatives',
      name: 'Futures & Options',
      tagline: 'Hedge your risks or amplify your gains with derivatives.',
      description: 'Explore the world of Futures and Options trading. Our platform offers comprehensive tools for analyzing derivative contracts, managing margin, and executing complex strategies with precision. Ideal for experienced traders.',
      features: [
        'Low brokerage on F&O',
        'Detailed option chain analysis',
        'Margin calculator',
        'Advanced order types (Bracket, Cover orders)',
        'Real-time pricing for contracts'
      ],
      icon: (
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      ),
      cta: 'Explore Derivatives'
    },
    {
      id: 'mutual-funds',
      name: 'Direct Mutual Funds',
      tagline: 'Invest in mutual funds directly, commission-free.',
      description: 'Build a diversified portfolio with direct mutual funds. Our platform allows you to invest in various schemes without any commissions, helping you maximize your returns. Track your investments and manage your portfolio seamlessly.',
      features: [
        'Zero commission direct mutual funds',
        'SIP and Lumpsum investment options',
        'Comprehensive fund research tools',
        'Portfolio tracking and rebalancing',
        'Tax-saving ELSS funds'
      ],
      icon: (
        <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.592 1L19.5 18H4.5L7.408 10c.512-.598 1.482-1 2.592-1z" />
        </svg>
      ),
      cta: 'Invest in Mutual Funds'
    },
    {
      id: 'bonds',
      name: 'Bonds & Government Securities',
      tagline: 'Secure your portfolio with fixed-income investments.',
      description: 'Diversify your portfolio with a range of bonds and government securities. These fixed-income instruments offer stability and predictable returns, making them an excellent choice for long-term financial planning.',
      features: [
        'Access to various bond types',
        'Government securities (G-Secs)',
        'Fixed and predictable returns',
        'Lower risk investment options',
        'Easy online application process'
      ],
      icon: (
        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
      ),
      cta: 'Explore Bonds'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Our Products</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A Comprehensive Suite for Every Investor
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Whether you're a seasoned trader or just starting your investment journey, our diverse range of products is designed to meet your every financial need.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-2 xl:gap-x-8">
              {products.map((product) => (
                <div key={product.id} className="group relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 mr-4">
                      {product.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {product.name}
                    </h3>
                  </div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">{product.tagline}</p>
                  <p className="mt-3 text-base text-gray-500">{product.description}</p>
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-800 mb-2">Key Features:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-8">
                    <a
                      href="/login" // Changed to redirect to login page
                      className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      {product.cta}
                      <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Optional: Call to Action / Footer Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Open an account today and gain access to our powerful trading and investment tools.
          </p>
          <div className="mt-6">
            <a
              href="/signup" // Replace with your actual signup page link
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Open Account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
