import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Hero() {
  return (
    
    <section className="w-full bg-white px-6 lg:px-20 py-10 space-y-12">
      <Navbar/>
      {/* Top Image */}
      <div className="w-full flex justify-center">
        <img
          src="https://zerodha.com/static/images/landing.png"
          alt="Hero Illustration"
          className="w-full max-w-4xl rounded-xl shadow-md"
        />
      </div>

      {/* Center Headline */}
      <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900">
        Invest in everything
      </h2>
      <h3 className="text-xl md:text-xl font-bold text-center text-gray-900">
        Online platform to invest in stocks, derivatives, mutual funds, ETFs, bonds, and more.
      </h3>

      {/* Two Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Card */}
        <div className="bg-blue-50 p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-3xl font-bold mt-2 text-blue-700">Trust with confidence</h3>

          <div className="mt-6 space-y-6 text-gray-700">
            <div>
              <h2 className="text-2xl font-semibold">Customer-first always</h2>
              <p>
                That's why 1.6+ crore customers trust Zerodha with ~ ₹6 lakh crores of equity investments and contribute to 15% of daily retail exchange volumes in India.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold">No spam or gimmicks</h2>
              <p>
                No gimmicks, spam, "gamification", or annoying push notifications. High quality apps that you use at your pace, the way you like. Our philosophies.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold">The TradePilot universe</h2>
              <p>
                Not just an app, but a whole ecosystem. Our investments in 30+ fintech startups offer you tailored services specific to your needs.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold">Do better with money</h2>
              <p>
                With initiatives like Nudge and Kill Switch, we don't just facilitate transactions, but actively help you do better with your money.
              </p>
            </div>
          </div>
        </div>

        {/* Right Card */}
        <div className="p-6 rounded-xl flex items-center justify-center">
          <img
            src="https://zerodha.com/static/images/ecosystem.png"
            alt="Ecosystem"
            className="w-full max-w-md rounded-xl shadow-md"
          />
        </div>
      </div>

      {/* 🔽 Press Logos Section (Center Aligned) */}
      <div className="w-full flex justify-center mt-16">
        <img
          src="https://zerodha.com/static/images/press-logos.png"
          alt="Press Logos"
          className="w-full max-w-4xl shadow-md"
        />
      </div>

      {/* 🔽 Two Text Cards Below Logos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">

        <div className=" p-6 ">
          <h2 className="text-2xl font-bold text-black mb-2">Unbeatable pricing</h2>
          <h4 className="text-gray-700">
            We pioneered the concept of discount broking and price transparency in India. Flat fees and no hidden charges.
          </h4>
          <a
  href="http://"
  className="flex items-center space-x-2 text-blue-600 font-medium mt-4 hover:underline"
>
  <span>See pricing</span>
  <span>→</span>
</a>

        </div>

        <div className=" p-6 ">
          <div className="w-full flex justify-center">
        <img
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAV0AAACQCAMAAACcV0hbAAAA3lBMVEX"
          alt="Hero Illustration"
          className="w-full h-40 max-w-4xl  shadow-md"
        />
      </div>
      
        </div>
        
      </div>
      <Footer/>
    </section>
  );
}
