import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { User, Link as LinkIcon, Settings, ShieldCheck, LogOut, Wallet, Bell, LifeBuoy } from 'lucide-react';
import axios from 'axios';
import Navbar from '../pages/Navbar.jsx'; // Corrected import path for Navbar
import { toast } from 'react-hot-toast'; // Import toast for snackbar messages

const UserProfilePage = () => {
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({ name: '', email: '', phone: '', accountId: '', kycStatus: '0' });
    const [accountSummary, setAccountSummary] = useState({ totalBalance: '₹0', availableBalance: '₹0', investedAmount: '₹0' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notificationPreferences, setNotificationPreferences] = useState({ tradeUpdates: true, marketNews: false, accountAlerts: true });

    // Effect hook to fetch user profile, wallet balance, and holdings data
    useEffect(() => {
        const fetchUserProfileData = async () => {
            setLoading(true); // Set loading to true while fetching data
            setError(null); // Clear any previous errors

            // Retrieve authentication token from local storage
            const token = localStorage.getItem('authToken');
            console.log('UserProfilePage - Auth Token on load:', token ? "Present" : "Missing");

            // If no token is found, redirect to the login page
            if (!token) {
                console.log('UserProfilePage - No authToken found, navigating to /login');
                navigate('/login');
                setLoading(false); // Stop loading if no token
                return;
            }

            // Set up authorization headers for API requests
            const headers = { Authorization: `Bearer ${token}` };

            try {
                // Fetch user profile data from the dashboard API
                const userRes = await axios.get('http://localhost:5000/api/dashboard/user', { headers });
                console.log('UserProfilePage - User Profile Response:', userRes.data);

                // Update profile data state if response is successful
                if (userRes.data) {
                    setProfileData({
                        name: userRes.data.name || 'Unknown User',
                        email: userRes.data.email || 'No email provided',
                        phone: userRes.data.mobileNumber || 'Not set',
                        accountId: userRes.data.accountId || generateAccountId(), // Generate if not provided by backend
                        kycStatus: String(userRes.data.kycStatus || '0'), // Ensure KYC status is a string
                    });
                }

                // Fetch wallet balance from the wallet API
                const walletRes = await axios.get('http://localhost:5000/api/wallet', { headers });
                console.log('UserProfilePage - Wallet Response:', walletRes.data);
                const walletBalance = walletRes.data?.walletBalance || 0;

                // Fetch holdings data to calculate the invested amount
                const holdingsRes = await axios.get('http://localhost:5000/api/holdings', { headers });
                console.log('UserProfilePage - Holdings Response:', holdingsRes.data);
                let investedAmount = 0;
                // Calculate invested amount by summing the (average buy price * net quantity) for all active holdings
                if (holdingsRes.data && Array.isArray(holdingsRes.data)) {
                    investedAmount = holdingsRes.data.reduce((sum, holding) => {
                        const netQty = (holding.buyQty || 0) - (holding.sellQty || 0);
                        if (netQty > 0) {
                            const avgBuyPrice = (holding.buyQty > 0) ? (holding.buyCost / holding.buyQty) : 0;
                            return sum + (avgBuyPrice * netQty);
                        }
                        return sum;
                    }, 0);
                }

                // Update account summary state with fetched and calculated values
                setAccountSummary({
                    totalBalance: `₹${walletBalance.toFixed(2)}`,
                    availableBalance: `₹${(walletBalance - investedAmount).toFixed(2)}`, // Available is wallet minus invested
                    investedAmount: `₹${investedAmount.toFixed(2)}`,
                });

            } catch (err) {
                // Log and set error message if API call fails
                console.error('UserProfilePage - Error fetching data:', err);
                setError('Failed to load profile information.');

                // If a 401 Unauthorized error occurs, remove token and redirect to login
                if (err.response?.status === 401) {
                    console.log('UserProfilePage - 401 error, removing authToken and navigating to /login');
                    localStorage.removeItem('authToken');
                    navigate('/login');
                }
            } finally {
                setLoading(false); // Always set loading to false after fetch attempt
            }
        };

        fetchUserProfileData(); // Call the fetch function when the component mounts
    }, [navigate, setUser]); // Dependencies for useEffect: re-run if navigate or setUser changes

    // Function to generate a unique account ID if not provided by the backend
    const generateAccountId = () => {
        const prefix = 'TP'; // TradePilot prefix
        const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
        const timestamp = Date.now().toString(36).substring(0, 5).toUpperCase();
        return `${prefix}-${randomPart}-${timestamp}`;
    };

    // Handler for user logout
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setUser(null); // Clear user context
        navigate('/'); // Redirect to the home/hero page
        toast.success('Logged out successfully!'); // Toast notification
        console.log('Logout clicked and redirected to Hero.');
    };

    // Handler for changing notification preferences
    const handleNotificationChange = (event) => {
        const { name, checked } = event.target;
        setNotificationPreferences(prev => ({ ...prev, [name]: checked }));
        // In a real application, you would typically send this update to your backend
        toast.success(`Notification preference for ${name} updated!`); // Toast notification
    };

    // Display loading state
    if (loading) {
        return <div className="min-h-screen bg-gray-100 flex justify-center items-center">Loading profile...</div>;
    }

    // Display error state
    if (error) {
        return <div className="min-h-screen bg-gray-100 flex justify-center items-center text-red-500">{error}</div>;
    }

    // Main component render
    return (
        <div className="min-h-screen bg-gray-100 font-inter"> {/* Added font-inter class */}
            <Navbar/> {/* Renders the Navbar component */}
            <div className="container mx-auto p-6">
                {/* Profile Banner Section */}
                <div className="bg-indigo-100 py-6 rounded-lg shadow-md mb-6">
                    <div className="container mx-auto text-center">
                        <User className="h-16 w-16 text-indigo-700 mx-auto mb-2" />
                        <h2 className="text-2xl font-semibold text-indigo-800">{profileData.name}</h2>
                        <p className="text-gray-600">{profileData.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profile Information Card */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 bg-gray-50">
                            <h3 className="text-lg font-medium text-gray-800">Profile Information</h3>
                        </div>
                        <div className="border-t border-gray-200">
                            <dl>
                                <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Account ID</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profileData.accountId}</dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profileData.phone}</dd>
                                </div>
                                <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">KYC Progress</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        <div className="relative pt-1">
                                            <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-indigo-200">
                                                <div style={{ width: `${profileData.kycStatus}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"></div>
                                            </div>
                                            <span className="text-xs text-gray-500">({profileData.kycStatus}% complete)</span>
                                        </div>
                                    </dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Linked Accounts</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        <div className="flex items-center space-x-2">
                                            <LinkIcon className="h-4 w-4 text-gray-500" />
                                            <span>No accounts linked yet. <Link to="/link-account" className="text-indigo-600 hover:underline">Link now</Link></span>
                                        </div>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Account Summary Card */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 bg-gray-50">
                            <h3 className="text-lg font-medium text-gray-800 flex items-center">
                                <Wallet className="h-5 w-5 mr-2 text-yellow-600" />
                                Account Summary
                            </h3>
                        </div>
                        <div className="px-4 py-5 sm:px-6">
                            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Total Balance</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">{accountSummary.totalBalance}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Available Balance</dt>
                                    <dd className="mt-1 text-lg font-semibold text-green-600">{accountSummary.availableBalance}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Invested Amount</dt>
                                    <dd className="mt-1 text-lg font-semibold text-blue-600">{accountSummary.investedAmount}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>

                {/* Notification Preferences Card */}
                <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50">
                        <h3 className="text-lg font-medium text-gray-800 flex items-center">
                            <Bell className="h-5 w-5 mr-2 text-blue-600" />
                            Notification Preferences
                        </h3>
                    </div>
                    <div className="px-4 py-5 sm:px-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">Trade Updates</label>
                                <input name="tradeUpdates" type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" checked={notificationPreferences.tradeUpdates} onChange={handleNotificationChange} />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">Market News</label>
                                <input name="marketNews" type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" checked={notificationPreferences.marketNews} onChange={handleNotificationChange} />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">Account Alerts</label>
                                <input name="accountAlerts" type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" checked={notificationPreferences.accountAlerts} onChange={handleNotificationChange} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Actions Card */}
                <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50">
                        <h3 className="text-lg font-medium text-gray-800 flex items-center">
                            <Settings className="h-5 w-5 mr-2 text-gray-700" />
                            Account Actions
                        </h3>
                    </div>
                    <div className="px-4 py-5 sm:px-6">
                        <div className="space-y-2">
                            <Link to="/settings" className="w-full flex items-center justify-start px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none">
                                <Settings className="h-5 w-5 mr-2" />
                                <span>Settings</span>
                            </Link>
                            <Link to="/security" className="w-full flex items-center justify-start px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none">
                                <ShieldCheck className="h-5 w-5 mr-2" />
                                <span>Security</span>
                            </Link>
                            <button onClick={handleLogout} className="w-full flex items-center justify-start px-4 py-2 rounded-md text-red-600 hover:bg-red-50 focus:outline-none">
                                <LogOut className="h-5 w-5 mr-2" />
                                <span>Logout</span>
                            </button>
                            <Link to="/support" className="w-full flex items-center justify-start px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none">
                                <LifeBuoy className="h-5 w-5 mr-2" />
                                <span>Support</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
