import React from 'react';
import Navbar from '../components/Navbar'; // Assuming Navbar is in the same directory or adjust path

// --- Professional React Component for About Us Page ---

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">About Us</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Empowering Your Financial Journey
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              We are dedicated to providing you with the tools and resources you need to navigate the world of finance with confidence. Our platform is built with a focus on clarity, security, and user empowerment.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    {/* Heroicon name: outline/light-bulb */}
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 15v2m-6.364-3.636l.707-7.071a1.414 1.414 0 012.828 0l.707 7.071m-8.485 2.242l.707-7.071M15.657 5.343l.707 7.071M12 7v8m0 0l3.905-3.905M12 15l-3.905-3.905M16.5 18h-1.5m-4.5 0H7.5" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Our Mission</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  To democratize access to financial markets and provide intuitive tools that enable everyone, from beginners to experienced traders, to achieve their financial goals.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    {/* Heroicon name: outline/shield-check */}
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Security First</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  We prioritize the security of your data and funds. Our platform employs industry-leading security measures to ensure a safe and reliable trading environment.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    {/* Heroicon name: outline/users */}
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.891M21 12c0 5.631-4.5 10.295-9 10.295S3 17.631 3 12c0-4.63 4.5-8.485 9-8.485S21 7.37 21 12z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">User-Centric Approach</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Our design and development are driven by the needs of our users. We strive to create an intuitive and accessible platform for everyone.
                </dd>
              </div>

              {/* Optional: Team Section (Add more divs like these for team members) */}
              {/* <div className="relative mt-10 md:mt-0">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 text-white">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Our Team</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Meet the passionate individuals behind our platform... (You can expand on this)
                </dd>
              </div> */}
            </dl>
          </div>
        </div>
      </div>

      {/* Optional: Call to Action Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Ready to Get Started?</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Join Our Community Today
            </p>
            <div className="mt-6">
              <a
                href="/signup" // Replace with your signup page link
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
