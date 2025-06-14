import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from './Navbar'; // Assuming Navbar is in the same directory or adjust path

// --- Professional React Component for Support Page ---

const SupportPage = () => {
  // State for Contact Form
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for FAQ expansion
  const [expandedFAQ, setExpandedFAQ] = useState(null); // Stores the index of the expanded FAQ

  // Mock FAQ data
  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "You can reset your password by navigating to the 'Account Security' page and using the 'Change Password' section. If you've forgotten your password, please use the 'Forgot Password' link on the login page."
    },
    {
      question: "What are the trading hours?",
      answer: "Our platform generally follows standard market trading hours. For specific asset classes (e.g., stocks, commodities), please refer to the market schedule available in your dashboard or the specific asset's detail page."
    },
    {
      question: "How can I deposit funds into my account?",
      answer: "To deposit funds, go to the 'Funds' section of your account. Select 'Add Funds' and follow the instructions for your preferred deposit method. Please ensure your bank account is linked if required."
    },
    {
      question: "Is there a minimum deposit amount?",
      answer: "Yes, the minimum deposit amount is typically ₹100. However, this may vary based on the payment method. Please check the deposit section for the most up-to-date information."
    },
    {
      question: "How long does it take for withdrawals to process?",
      answer: "Withdrawals are typically processed within 1-3 business days, depending on your bank and the withdrawal method chosen. You will receive a notification once the transaction is complete."
    }
  ];

  // Toggle FAQ visibility
  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  // Handle Contact Form Submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in both subject and message fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call to submit support ticket
      // In a real application, you would send this data to your backend:
      // const token = localStorage.getItem('authToken');
      // await axios.post('http://localhost:5000/api/support/ticket',
      //   { subject, message },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      toast.success('Your support request has been submitted successfully! We will get back to you soon.');
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Support request failed:', error);
      toast.error('Failed to submit support request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-12 mb-8">🛠️ Support Center</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-6 text-gray-700">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <button
                    className="flex justify-between items-center w-full text-left font-medium text-lg text-gray-800 hover:text-blue-600 transition-colors"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span>{faq.question}</span>
                    <span>{expandedFAQ === index ? '▲' : '▼'}</span>
                  </button>
                  {expandedFAQ === index && (
                    <p className="mt-3 text-gray-600 leading-relaxed animate-fade-in-down">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support & Channels Section */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Contact Support Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Contact Support</h2>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Issue with login"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    id="message"
                    rows="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-y"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    disabled={isSubmitting}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-md hover:bg-blue-700 transition shadow-sm disabled:bg-blue-300 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>

            {/* Support Channels */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Other Ways to Get Help</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <span className="mr-3 text-blue-500">📧</span>
                  <span>Email: <a href="mailto:support@yourcompany.com" className="text-blue-600 hover:underline">support@yourcompany.com</a></span>
                </li>
                <li className="flex items-center">
                  <span className="mr-3 text-green-500">📞</span>
                  <span>Phone: <a href="tel:+911234567890" className="text-blue-600 hover:underline">+91 12345 67890</a> (Mon-Fri, 9 AM - 6 PM IST)</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-3 text-purple-500">💬</span>
                  <span>Live Chat: Available on our website during business hours.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Optional: Knowledge Base Search (UI only) */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Search Knowledge Base</h2>
          <div className="flex">
            <input
              type="text"
              placeholder="Search for articles or topics..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="bg-blue-600 text-white font-bold py-2 px-4 rounded-r-md hover:bg-blue-700 transition shadow-sm">
              Search
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            (Note: Search functionality requires backend integration.)
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
