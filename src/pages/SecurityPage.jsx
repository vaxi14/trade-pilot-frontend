import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from './Navbar'; // Assuming Navbar is in the same directory or adjust path
import axios from 'axios';

// --- Professional React Component for Security Management ---

const SecurityPage = () => {
  // State for Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // State for Two-Factor Authentication (2FA)
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(''); // To store QR code for 2FA setup
  const [twoFACode, setTwoFACode] = useState(''); // For entering 2FA code during setup/verification
  const [is2FASetupMode, setIs2FASetupMode] = useState(false); // Controls visibility of 2FA setup steps
  const [is2FAToggling, setIs2FAToggling] = useState(false);

  // State for Recent Activity/Login History
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // State for Session Management
  const [activeSessions, setActiveSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  // --- Data Fetching ---
  const fetchSecuritySettings = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        // Handle unauthenticated state
        console.warn("No auth token found, cannot fetch security settings.");
        setLoadingActivity(false);
        setLoadingSessions(false);
        setRecentActivity([]); // Clear data if not authenticated
        setActiveSessions([]); // Clear data if not authenticated
        return;
      }

      setLoadingActivity(true);
      setLoadingSessions(true);

      try {
        // Fetch 2FA status
        const twoFAResponse = await axios.get('http://localhost:5000/api/user/2fa-status', { headers: { Authorization: `Bearer ${token}` } });
        setIs2FAEnabled(twoFAResponse.data.enabled);
      } catch (err) {
        console.error('Error fetching 2FA status:', err.response?.data?.msg || err.message);
        setIs2FAEnabled(false); // Default to disabled on error
      }

      try {
        // Fetch recent activity
        const activityResponse = await axios.get('http://localhost:5000/api/user/recent-activity', { headers: { Authorization: `Bearer ${token}` } });
        setRecentActivity(activityResponse.data);
      } catch (err) {
        console.error('Error fetching recent activity:', err.response?.data?.msg || err.message);
        setRecentActivity([]); // Clear data on error
      } finally {
        setLoadingActivity(false);
      }

      try {
        // Fetch active sessions
        const sessionsResponse = await axios.get('http://localhost:5000/api/user/active-sessions', { headers: { Authorization: `Bearer ${token}` } });
        setActiveSessions(sessionsResponse.data);
      } catch (err) {
        console.error('Error fetching active sessions:', err.response?.data?.msg || err.message);
        setActiveSessions([]); // Clear data on error
      } finally {
        setLoadingSessions(false);
      }

    } catch (err) {
      // This catch block is for general errors during the initial token check or if any of the above
      // individual fetches don't have their own specific catch blocks.
      // Given the structure, individual fetches handle their own errors, so this might be less critical.
      console.error('General error during security settings fetch:', err.response?.data?.msg || err.message);
      toast.error('Failed to load security settings.');
    }
  }, []);

  useEffect(() => {
    fetchSecuritySettings();
    // Optional: Refresh activity/sessions periodically
    const intervalId = setInterval(fetchSecuritySettings, 120000); // Every 2 minutes
    return () => clearInterval(intervalId);
  }, [fetchSecuritySettings]);

  // --- Handlers for Password Change ---
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setIsChangingPassword(true);
    if (newPassword !== confirmNewPassword) {
      toast.error('New password and confirm password do not match.');
      setIsChangingPassword(false);
      return;
    }
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('All password fields are required.');
      setIsChangingPassword(false);
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      setIsChangingPassword(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.post('http://localhost:5000/api/user/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error('Password change failed:', error.response?.data?.msg || error.message);
      toast.error(`Password change failed: ${error.response?.data?.msg || 'Server error'}`);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // --- Handlers for Two-Factor Authentication (2FA) ---
  const handleToggle2FA = async () => {
    setIs2FAToggling(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!is2FAEnabled) {
        // Initiate 2FA setup (backend would generate QR code and secret)
        const response = await axios.post('http://localhost:5000/api/2fa/generate', {}, { headers: { Authorization: `Bearer ${token}` } });
        setQrCodeUrl(response.data.qrCodeUrl); // Backend should return QR code URL
        setIs2FASetupMode(true);
        toast('Scan QR code and enter verification code to enable 2FA.', { icon: '🔑' });
      } else {
        // Disable 2FA
        await axios.post('http://localhost:5000/api/2fa/disable', {}, { headers: { Authorization: `Bearer ${token}` } });
        setIs2FAEnabled(false);
        setQrCodeUrl('');
        setTwoFACode('');
        setIs2FASetupMode(false);
        toast.success('Two-Factor Authentication disabled.');
      }
    } catch (error) {
      console.error('2FA toggle failed:', error.response?.data?.msg || error.message);
      toast.error(`2FA action failed: ${error.response?.data?.msg || 'Server error'}`);
    } finally {
      setIs2FAToggling(false);
    }
  };

  const handleVerify2FA = async () => {
    setIs2FAToggling(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post('http://localhost:5000/api/2fa/verify',
        { code: twoFACode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.verified) { // Backend should return a 'verified' status
        setIs2FAEnabled(true);
        setIs2FASetupMode(false);
        setTwoFACode('');
        toast.success('Two-Factor Authentication enabled successfully!');
      } else {
        toast.error('Invalid 2FA code. Please try again.');
      }
    } catch (error) {
      console.error('2FA verification failed:', error.response?.data?.msg || error.message);
      toast.error(`2FA verification failed: ${error.response?.data?.msg || 'Server error'}`);
    } finally {
      setIs2FAToggling(false);
    }
  };

  // --- Handlers for Session Management ---
  const handleLogoutAllDevices = async () => {
    // Use a custom modal or toast for confirmation instead of window.confirm
    // For now, keeping window.confirm as per original code, but note for improvement.
    if (!window.confirm('Are you sure you want to log out from all other devices?')) {
      return;
    }
    setIsLoggingOutAll(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('http://localhost:5000/api/user/logout-all-sessions', {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Successfully logged out from all other devices.');
      // Refresh sessions list after logout
      fetchSecuritySettings();
    } catch (error) {
      console.error('Logout all devices failed:', error.response?.data?.msg || error.message);
      toast.error(`Logout failed: ${error.response?.data?.msg || 'Server error'}`);
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  // --- Loading States ---
  if (loadingActivity || loadingSessions) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading security settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-12 mb-8">🔒 Account Security</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Change Password Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  id="current-password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isChangingPassword}
                  required
                />
              </div>
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  id="new-password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isChangingPassword}
                  required
                />
              </div>
              <div>
                <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  id="confirm-new-password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  disabled={isChangingPassword}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-md hover:bg-blue-700 transition shadow-sm disabled:bg-blue-300 disabled:cursor-not-allowed"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Two-Factor Authentication Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Two-Factor Authentication (2FA)</h2>
            <p className="text-gray-600 mb-4">
              2FA adds an extra layer of security to your account by requiring a verification code from your phone in addition to your password.
            </p>
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-gray-800">Status:</span>
              <span className={`font-bold ${is2FAEnabled ? 'text-green-600' : 'text-red-600'}`}>
                {is2FAEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {!is2FASetupMode && (
              <button
                onClick={handleToggle2FA}
                className={`w-full font-bold py-2.5 px-4 rounded-md transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${is2FAEnabled ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                disabled={is2FAToggling}
              >
                {is2FAToggling ? 'Processing...' : (is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA')}
              </button>
            )}

            {is2FASetupMode && (
              <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                <h3 className="font-semibold text-gray-800 mb-3">Setup 2FA</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Scan the QR code with your authenticator app (e.g., Google Authenticator) and enter the 6-digit code.
                </p>
                {qrCodeUrl && (
                  <div className="flex justify-center mb-4">
                    <img src={qrCodeUrl} alt="2FA QR Code" className="w-36 h-36 border border-gray-300 p-1 rounded-md" />
                  </div>
                )}
                <div>
                  <label htmlFor="2fa-code" className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                  <input
                    type="text"
                    id="2fa-code"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-wider"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))} // Allow only digits, max 6
                    placeholder="XXXXXX"
                    maxLength="6"
                    disabled={is2FAToggling}
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleVerify2FA}
                    className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition shadow-sm disabled:bg-blue-300 disabled:cursor-not-allowed"
                    disabled={is2FAToggling || twoFACode.length !== 6}
                  >
                    {is2FAToggling ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                  <button
                    onClick={() => { setIs2FASetupMode(false); setQrCodeUrl(''); setTwoFACode(''); }}
                    className="flex-1 text-gray-600 hover:text-gray-900 py-2 px-4 rounded-md"
                    disabled={is2FAToggling}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Recent Account Activity</h2>
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device/Browser</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {recentActivity.map((activity) => (
                      <tr key={activity.id}>
                        <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-800">{activity.type}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-600">{new Date(activity.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-600">{activity.ip}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-600">{activity.device}</td>
                        <td className={`px-4 py-4 whitespace-nowrap font-semibold ${activity.status === 'Success' ? 'text-green-600' : 'text-red-600'}`}>
                          {activity.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Session Management Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Active Sessions</h2>
            <p className="text-gray-600 mb-4">
              Review where you are currently logged in. You can log out from all other devices here.
            </p>
            {activeSessions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active sessions found.</p>
            ) : (
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {activeSessions.map((session) => (
                      <tr key={session.id}>
                        <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-800">{session.device}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-600">{session.ip}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-600">{new Date(session.lastActive).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button
              onClick={handleLogoutAllDevices}
              className="w-full bg-red-600 text-white font-bold py-2.5 px-4 rounded-md hover:bg-red-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoggingOutAll || activeSessions.length <= 1} // Disable if only current session or processing
            >
              {isLoggingOutAll ? 'Logging Out...' : 'Log Out From All Other Devices'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
