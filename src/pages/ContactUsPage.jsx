import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar'; // Assuming Navbar is in the same directory or adjust path

// --- Professional React Component for Contact Us Page ---

const ContactUsPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    // Basic email format validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call to send contact form data
      // In a real application, you would send this data to your backend:
      // await axios.post('http://localhost:5000/api/contact', { name, email, subject, message });
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

      toast.success('Your message has been sent successfully! We will get back to you soon.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Contact form submission failed:', error);
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Contact Us</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Get In Touch
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              We're here to help! Whether you have a question, feedback, or need support, feel free to reach out to us.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information Section */}
            <div className="bg-white p-8 rounded-lg shadow-sm border">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Details</h3>
              <div className="space-y-6 text-gray-700">
                <div>
                  <p className="font-semibold text-lg">Email Support:</p>
                  <a href="mailto:support@yourcompany.com" className="text-blue-600 hover:underline">support@yourcompany.com</a>
                  <p className="text-sm text-gray-500">For general inquiries and technical support.</p>
                </div>
                <div>
                  <p className="font-semibold text-lg">Phone Support:</p>
                  <a href="tel:+911234567890" className="text-blue-600 hover:underline">+91 12345 67890</a>
                  <p className="text-sm text-gray-500">Available Monday - Friday, 9:00 AM - 6:00 PM IST.</p>
                </div>
                <div>
                  <p className="font-semibold text-lg">Registered Office:</p>
                  <address className="not-italic">
                    [Your Company Name] <br />
                    123, Financial District, <br />
                    Cyberabad, Hyderabad - 500081, <br />
                    Telangana, India.
                  </address>
                </div>
                <div>
                  <p className="font-semibold text-lg">Connect With Us:</p>
                  <div className="flex space-x-4 mt-2">
                    {/* Social Media Icons (placeholders) */}
                    <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.37-.83.49-1.75.85-2.72 1.04-1.65-1.76-4.51-1.01-5.12.92-.85.34-1.66.67-2.43.95-2.06.82-3.88 2.05-5.12 3.63-.3.4-.57.82-.82 1.25-.43.7-.78 1.46-1.04 2.26-.22.68-.39 1.38-.5 2.1-.08.6-.1 1.2-.06 1.8.04.6.14 1.2.3 1.8.18.6.4 1.2.66 1.8.28.6.6 1.2.98 1.7.4.5.85.95 1.35 1.35.5.5 1.05.9 1.65 1.2.6.3 1.25.5 1.9.6.65.1 1.3.1 1.95.1.65 0 1.3-.02 1.95-.06.65-.04 1.3-.14 1.9-.3.6-.18 1.2-.4 1.8-.66.6-.28 1.2-.6 1.7-.98.5-.4.95-.85 1.35-1.35.4-.5.75-1.05 1.05-1.65.3-.6.5-1.25.66-1.9.18-.65.28-1.3.3-1.95.04-.65.02-1.3-.06-1.95-.1-1.4-.5-2.7-.9-3.9-.4-1.2-.9-2.3-1.5-3.4-.6-1.1-1.3-2.1-2.1-3-.8-.9-1.7-1.7-2.7-2.4zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                    </a>
                    <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.776-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.247 0-1.625.776-1.625 1.572V12h2.77l-.44 2.89h-2.33v6.989C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg>
                    </a>
                    <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M.057 2.057a1.999 1.999 0 012.828 0l18.043 18.043a1.999 1.999 0 01-2.828 2.828L.057 4.885a1.999 1.999 0 010-2.828zm11.314 11.314a1.999 1.999 0 012.828 0l6.364 6.364a1.999 1.999 0 01-2.828 2.828L11.371 14.185a1.999 1.999 0 010-2.828zM19.071 4.929a1.999 1.999 0 012.828 0l.707.707a1.999 1.999 0 01-2.828 2.828l-.707-.707a1.999 1.999 0 010-2.828zM4.929 19.071a1.999 1.999 0 010 2.828l-.707.707a1.999 1.999 0 01-2.828-2.828l.707-.707a1.999 1.999 0 012.828 0z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Section */}
            <div className="bg-white p-8 rounded-lg shadow-sm border">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Regarding my account..."
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    id="message"
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-y"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    disabled={isSubmitting}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-md hover:bg-blue-700 transition shadow-sm disabled:bg-blue-300 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Optional: Map Section (Placeholder) */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Find Us on the Map
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Visit our office during business hours.
          </p>
          <div className="mt-6 bg-gray-200 h-64 rounded-lg flex items-center justify-center text-gray-600 text-xl">
            [Placeholder for Google Maps Embed or similar]
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
