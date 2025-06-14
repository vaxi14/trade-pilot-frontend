import React from 'react';
import { XCircle, AlertTriangle, CheckCircle } from 'lucide-react'; // Icons for modal

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmButtonText,
    isDestructive = false, // To style the button red for destructive actions
    showPasswordField = false,
    password,
    onPasswordChange,
    loading = false // To show loading state on button
}) => {
    if (!isOpen) return null; // Don't render if not open

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 font-inter">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-6 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    aria-label="Close"
                >
                    <XCircle className="h-6 w-6" />
                </button>

                {/* Modal Header */}
                <div className="text-center mb-4">
                    {isDestructive ? (
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                    ) : (
                        <CheckCircle className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                    )}
                    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                </div>

                {/* Modal Body - Message and Password Field */}
                <div className="mb-6 text-center">
                    <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
                    {showPasswordField && (
                        <div className="mt-4">
                            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                placeholder="Enter your password to confirm"
                                value={password}
                                onChange={onPasswordChange}
                                disabled={loading}
                            />
                        </div>
                    )}
                </div>

                {/* Modal Footer - Action Buttons */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-5 py-2 rounded-md text-sm font-medium text-white ${isDestructive ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200`}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
