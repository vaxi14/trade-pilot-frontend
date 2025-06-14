import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import Navbar from '../pages/Navbar'; // Assuming Navbar is in components
import { toast } from 'react-hot-toast'; // For professional notifications
import ConfirmationModal from '../components/ConfirmationModal'; // Import the new modal component
import {
    User,
    Phone,
    Mail,
    Key,
    Bell,
    ShieldCheck,
    Lock,
    EyeOff,
    Trash2,
    Settings,
    ArrowLeftRight,
    Info,
    Globe
} from 'lucide-react';

const SettingsPage = () => {
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    // State for user profile data
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    // State for form fields
    const [newPhoneNumber, setNewPhoneNumber] = useState('');
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [dataSharingConsent, setDataSharingConsent] = useState(true); // Default to true

    // Modal States
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [passwordForConfirmation, setPasswordForConfirmation] = useState('');
    const [modalLoading, setModalLoading] = useState(false); // Loading state for modal actions

    // UI states
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('general'); // Default active section

    // Effect hook to fetch user profile data on component mount
    useEffect(() => {
        const fetchSettingsData = async () => {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            if (!token) {
                toast.error('Authentication required. Please log in.');
                navigate('/login');
                setLoading(false);
                return;
            }

            try {
                // Fetch user profile and settings
                const userRes = await axios.get('http://localhost:5000/api/dashboard/user', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (userRes.data) {
                    setProfileData({
                        name: userRes.data.name || 'N/A',
                        email: userRes.data.email || 'N/A',
                        phone: userRes.data.mobileNumber || '', // Use mobileNumber from backend
                    });
                    setNewPhoneNumber(userRes.data.mobileNumber || '');
                    setTwoFactorEnabled(userRes.data.twoFactorEnabled || false); // Assuming backend sends this
                    setDataSharingConsent(userRes.data.dataSharingConsent !== undefined ? userRes.data.dataSharingConsent : true);
                }

            } catch (err) {
                console.error('Error fetching settings data:', err);
                toast.error('Failed to load settings. Please try again.');
                if (err.response?.status === 401) {
                    localStorage.removeItem('authToken');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSettingsData();
    }, [navigate, setUser]);

    // Handler for updating phone number
    const handleSavePhone = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast.error('Authentication required.');
            navigate('/login');
            return;
        }

        if (!newPhoneNumber || !/^\d{10}$/.test(newPhoneNumber)) {
            toast.error('Please enter a valid 10-digit phone number.');
            return;
        }

        try {
            // Assuming an API endpoint to update phone number
            await axios.put('http://localhost:5000/api/user/settings/phone',
                { mobileNumber: newPhoneNumber }, // Ensure this matches your backend's expected field name
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProfileData(prev => ({ ...prev, phone: newPhoneNumber }));
            setIsEditingPhone(false);
            toast.success('Phone number updated successfully!');
        } catch (err) {
            console.error('Error updating phone number:', err);
            toast.error('Failed to update phone number. Please try again.');
        }
    };

    // Handler for changing password
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast.error('Authentication required.');
            navigate('/login');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            toast.error('New password and confirm password do not match.');
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            toast.error('New password must be at least 6 characters long.');
            return;
        }

        try {
            // Assuming an API endpoint to update password
            await axios.put('http://localhost:5000/api/user/settings/password',
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            console.error('Error updating password:', err);
            toast.error('Failed to update password. Please check your current password.');
        }
    };

    // Handler for toggling Two-Factor Authentication
    const handleToggleTwoFactor = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast.error('Authentication required.');
            navigate('/login');
            return;
        }

        try {
            // Assuming an API endpoint to toggle 2FA
            await axios.put('http://localhost:5000/api/user/settings/two-factor',
                { enable: !twoFactorEnabled },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTwoFactorEnabled(prev => !prev);
            toast.success(`Two-Factor Authentication ${twoFactorEnabled ? 'disabled' : 'enabled'}!`);
        } catch (err) {
            console.error('Error toggling 2FA:', err);
            toast.error('Failed to update 2FA setting.');
        }
    };

    // Handler for data sharing consent
    const handleDataSharingChange = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast.error('Authentication required.');
            navigate('/login');
            return;
        }

        try {
            // Assuming an API endpoint to update privacy settings
            await axios.put('http://localhost:5000/api/user/settings/privacy',
                { dataSharingConsent: !dataSharingConsent },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDataSharingConsent(prev => !prev);
            toast.success('Data sharing preference updated!');
        } catch (err) {
            console.error('Error updating data sharing consent:', err);
            toast.error('Failed to update data sharing preference.');
        }
    };

    // --- Deactivate Account Logic ---
    const handleDeactivateAccountClick = () => {
        setPasswordForConfirmation(''); // Clear password field
        setShowDeactivateModal(true);
    };

    const confirmDeactivateAccount = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast.error('Authentication required.');
            navigate('/login');
            return;
        }

        if (!passwordForConfirmation) {
            toast.error('Please enter your password to confirm deactivation.');
            return;
        }

        setModalLoading(true);
        try {
            // Assuming a POST endpoint for deactivation that requires password
            await axios.post('http://localhost:5000/api/user/deactivate',
                { password: passwordForConfirmation },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Account deactivated for 24 hours. You will be logged out.');
            localStorage.removeItem('authToken'); // Clear token
            setUser(null); // Clear user context
            navigate('/login'); // Redirect to login
        } catch (err) {
            console.error('Error deactivating account:', err);
            if (err.response?.status === 401) {
                toast.error('Incorrect password or unauthorized. Please try again.');
            } else {
                toast.error('Failed to deactivate account. Please try again later.');
            }
        } finally {
            setModalLoading(false);
            setShowDeactivateModal(false); // Close modal regardless of success/failure
            setPasswordForConfirmation(''); // Clear password
        }
    };

    // --- Delete Account Logic ---
    const handleDeleteAccountClick = () => {
        setPasswordForConfirmation(''); // Clear password field
        setShowDeleteModal(true);
    };

    const confirmDeleteAccount = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast.error('Authentication required.');
            navigate('/login');
            return;
        }

        if (!passwordForConfirmation) {
            toast.error('Please enter your password to confirm deletion.');
            return;
        }

        setModalLoading(true);
        try {
            // Assuming a DELETE endpoint for deletion that requires password
            await axios.delete('http://localhost:5000/api/user/delete',
                {
                    data: { password: passwordForConfirmation }, // DELETE requests send body in 'data' field
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('Your account has been permanently deleted.');
            localStorage.removeItem('authToken'); // Clear token
            setUser(null); // Clear user context
            navigate('/login'); // Redirect to login
        } catch (err) {
            console.error('Error deleting account:', err);
            if (err.response?.status === 401) {
                toast.error('Incorrect password or unauthorized. Please try again.');
            } else {
                toast.error('Failed to delete account. Please try again later.');
            }
        } finally {
            setModalLoading(false);
            setShowDeleteModal(false); // Close modal regardless of success/failure
            setPasswordForConfirmation(''); // Clear password
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-100 flex justify-center items-center font-inter">Loading settings...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 font-inter">
            <Navbar />
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar Navigation */}
                    <aside className="w-full md:w-64 bg-white shadow rounded-lg p-4">
                        <nav className="space-y-2">
                            <button
                                className={`w-full text-left flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${activeSection === 'general' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                                onClick={() => setActiveSection('general')}
                            >
                                <User className="h-5 w-5 mr-3" /> General
                            </button>
                            <button
                                className={`w-full text-left flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${activeSection === 'security' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                                onClick={() => setActiveSection('security')}
                            >
                                <ShieldCheck className="h-5 w-5 mr-3" /> Security
                            </button>
                            <button
                                className={`w-full text-left flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${activeSection === 'notifications' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                                onClick={() => setActiveSection('notifications')}
                            >
                                <Bell className="h-5 w-5 mr-3" /> Notifications
                            </button>
                            <button
                                className={`w-full text-left flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${activeSection === 'privacy' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                                onClick={() => setActiveSection('privacy')}
                            >
                                <EyeOff className="h-5 w-5 mr-3" /> Privacy
                            </button>
                            <button
                                className={`w-full text-left flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${activeSection === 'account' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                                onClick={() => setActiveSection('account')}
                            >
                                <Trash2 className="h-5 w-5 mr-3" /> Account Management
                            </button>
                        </nav>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 bg-white shadow rounded-lg p-6">
                        {/* General Settings Section */}
                        {activeSection === 'general' && (
                            <section>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <User className="h-6 w-6 mr-2 text-indigo-600" /> General Settings
                                </h2>
                                <div className="space-y-6">
                                    {/* Name Display */}
                                    <div className="border-b border-gray-200 pb-4">
                                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <p className="mt-1 text-gray-900">{profileData.name}</p>
                                        <span className="text-xs text-gray-500">Contact support to change your name.</span>
                                    </div>

                                    {/* Email Display */}
                                    <div className="border-b border-gray-200 pb-4">
                                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                        <p className="mt-1 text-gray-900">{profileData.email}</p>
                                        <span className="text-xs text-gray-500">Contact support to change your email.</span>
                                    </div>

                                    {/* Phone Number Management */}
                                    <div>
                                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                            Phone Number
                                        </label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            {isEditingPhone || !profileData.phone ? (
                                                <>
                                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                        <Phone className="h-4 w-4" />
                                                    </span>
                                                    <input
                                                        type="tel"
                                                        name="phoneNumber"
                                                        id="phoneNumber"
                                                        className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                                                        placeholder="e.g., 9876543210"
                                                        value={newPhoneNumber}
                                                        onChange={(e) => setNewPhoneNumber(e.target.value)}
                                                        maxLength="10"
                                                    />
                                                    <button
                                                        onClick={handleSavePhone}
                                                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        Save
                                                    </button>
                                                    {isEditingPhone && (
                                                        <button
                                                            onClick={() => {
                                                                setIsEditingPhone(false);
                                                                setNewPhoneNumber(profileData.phone); // Revert to original
                                                            }}
                                                            className="ml-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-between w-full">
                                                    <p className="mt-1 text-gray-900 flex items-center">
                                                        <Phone className="h-4 w-4 mr-2 text-gray-500" /> {profileData.phone}
                                                    </p>
                                                    <button
                                                        onClick={() => setIsEditingPhone(true)}
                                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        Change
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500">
                                            {profileData.phone ? 'This is your registered phone number.' : 'No phone number set. Add one for account security and notifications.'}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Security Settings Section */}
                        {activeSection === 'security' && (
                            <section>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <Lock className="h-6 w-6 mr-2 text-red-600" /> Security Settings
                                </h2>
                                <div className="space-y-6">
                                    {/* Change Password */}
                                    <div className="border-b border-gray-200 pb-6">
                                        <h3 className="text-lg font-medium text-gray-900 flex items-center mb-2">
                                            <Key className="h-5 w-5 mr-2 text-gray-600" /> Change Password
                                        </h3>
                                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                                            <div>
                                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                                                <input
                                                    type="password"
                                                    id="currentPassword"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                                                <input
                                                    type="password"
                                                    id="newPassword"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    id="confirmNewPassword"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                                                    value={confirmNewPassword}
                                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Update Password
                                            </button>
                                        </form>
                                    </div>

                                    {/* Two-Factor Authentication */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <ArrowLeftRight className="h-5 w-5 mr-2 text-gray-600" />
                                            <span className="text-lg font-medium text-gray-900">Two-Factor Authentication (2FA)</span>
                                        </div>
                                        <label htmlFor="twoFactorToggle" className="flex items-center cursor-pointer">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    id="twoFactorToggle"
                                                    className="sr-only"
                                                    checked={twoFactorEnabled}
                                                    onChange={handleToggleTwoFactor}
                                                />
                                                <div className="block bg-gray-300 w-14 h-8 rounded-full"></div>
                                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${twoFactorEnabled ? 'translate-x-full bg-indigo-600' : ''}`}></div>
                                            </div>
                                            <div className="ml-3 text-gray-700 font-medium">
                                                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                            </div>
                                        </label>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Add an extra layer of security to your account by enabling 2FA.
                                    </p>
                                </div>
                            </section>
                        )}

                        {/* Notifications Settings Section */}
                        {activeSection === 'notifications' && (
                            <section>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <Bell className="h-6 w-6 mr-2 text-blue-600" /> Notification Preferences
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="tradeUpdates" className="text-base font-medium text-gray-700">Trade Updates</label>
                                        <input
                                            type="checkbox"
                                            id="tradeUpdates"
                                            name="tradeUpdates"
                                            className="form-checkbox h-5 w-5 text-indigo-600 rounded"
                                            checked={true} // Placeholder: Assume always enabled or fetch from state
                                            onChange={() => toast('Trade updates cannot be disabled.', { icon: 'ℹ️' })}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500">Receive real-time notifications about your trades (orders, executions, etc.).</p>

                                    <div className="flex items-center justify-between mt-4">
                                        <label htmlFor="marketNews" className="text-base font-medium text-gray-700">Market News & Analysis</label>
                                        <input
                                            type="checkbox"
                                            id="marketNews"
                                            name="marketNews"
                                            className="form-checkbox h-5 w-5 text-indigo-600 rounded"
                                            checked={true} // Placeholder: Assume always enabled or fetch from state
                                            onChange={() => toast('Market news cannot be disabled.', { icon: 'ℹ️' })}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500">Stay informed with the latest market news, insights, and expert analysis.</p>

                                    <div className="flex items-center justify-between mt-4">
                                        <label htmlFor="accountAlerts" className="text-base font-medium text-gray-700">Account Alerts</label>
                                        <input
                                            type="checkbox"
                                            id="accountAlerts"
                                            name="accountAlerts"
                                            className="form-checkbox h-5 w-5 text-indigo-600 rounded"
                                            checked={true} // Placeholder: Assume always enabled or fetch from state
                                            onChange={() => toast('Account alerts cannot be disabled.', { icon: 'ℹ️' })}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500">Get important alerts regarding your account, such as login attempts or balance changes.</p>
                                </div>
                            </section>
                        )}

                        {/* Privacy Settings Section */}
                        {activeSection === 'privacy' && (
                            <section>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <EyeOff className="h-6 w-6 mr-2 text-purple-600" /> Privacy Settings
                                </h2>
                                <div className="space-y-6">
                                    {/* Data Sharing Consent */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Info className="h-5 w-5 mr-2 text-gray-600" />
                                            <span className="text-lg font-medium text-gray-900">Share anonymized data for product improvement</span>
                                        </div>
                                        <label htmlFor="dataSharingConsent" className="flex items-center cursor-pointer">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    id="dataSharingConsent"
                                                    className="sr-only"
                                                    checked={dataSharingConsent}
                                                    onChange={handleDataSharingChange}
                                                />
                                                <div className="block bg-gray-300 w-14 h-8 rounded-full"></div>
                                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${dataSharingConsent ? 'translate-x-full bg-green-600' : ''}`}></div>
                                            </div>
                                            <div className="ml-3 text-gray-700 font-medium">
                                                {dataSharingConsent ? 'Allowed' : 'Denied'}
                                            </div>
                                        </label>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Help us improve TradePilot by sharing anonymized usage data. Your personal information will not be shared.
                                    </p>

                                    {/* Data Export (Placeholder) */}
                                    <div className="border-t border-gray-200 pt-6">
                                        <h3 className="text-lg font-medium text-gray-900 flex items-center mb-2">
                                            <Globe className="h-5 w-5 mr-2 text-gray-600" /> Data Export
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Request a copy of your personal data stored on TradePilot.
                                        </p>
                                        <button
                                            onClick={() => toast('Data export feature coming soon!', { icon: '⏳' })}
                                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Request Data
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Account Management Section */}
                        {activeSection === 'account' && (
                            <section>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <Trash2 className="h-6 w-6 mr-2 text-red-600" /> Account Management
                                </h2>
                                <div className="space-y-6">
                                    {/* Deactivate Account */}
                                    <div className="border-b border-gray-200 pb-6">
                                        <h3 className="text-lg font-medium text-gray-900 flex items-center mb-2">
                                            <Info className="h-5 w-5 mr-2 text-gray-600" /> Deactivate Account
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Temporarily disable your account. You can reactivate it by logging back in after 24 hours.
                                        </p>
                                        <button
                                            onClick={handleDeactivateAccountClick}
                                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                        >
                                            Deactivate Account
                                        </button>
                                    </div>

                                    {/* Delete Account (More permanent) */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 flex items-center mb-2">
                                            <Trash2 className="h-5 w-5 mr-2 text-red-600" /> Delete Account
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Permanently delete your account and all associated data. This action cannot be undone.
                                        </p>
                                        <button
                                            onClick={handleDeleteAccountClick}
                                            className="inline-flex justify-center py-2 px-4 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}
                    </main>
                </div>
            </div>

            {/* Deactivate Account Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeactivateModal}
                onClose={() => setShowDeactivateModal(false)}
                onConfirm={confirmDeactivateAccount}
                title="Confirm Account Deactivation"
                message="Deactivating your account will temporarily disable your profile and hide your data for 24 hours. During this period, you will not be able to log in. Your account will automatically reactivate after 24 hours. To proceed, please confirm your password."
                confirmButtonText="Deactivate Anyway"
                isDestructive={false} // Not destructive in the same way as delete
                showPasswordField={true}
                password={passwordForConfirmation}
                onPasswordChange={(e) => setPasswordForConfirmation(e.target.value)}
                loading={modalLoading}
            />

            {/* Delete Account Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDeleteAccount}
                title="Confirm Account Deletion"
                message="Deleting your account is a permanent and irreversible action. All your data, including trading history, wallet balance, and personal information, will be permanently removed from our systems. This action cannot be undone. To proceed, please confirm your password."
                confirmButtonText="Delete Permanently"
                isDestructive={true}
                showPasswordField={true}
                password={passwordForConfirmation}
                onPasswordChange={(e) => setPasswordForConfirmation(e.target.value)}
                loading={modalLoading}
            />
        </div>
    );
};

export default SettingsPage;
