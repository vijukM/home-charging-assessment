import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import authService from '../services/authService';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      verifyEmail(token);
    } else {
      setMessage('Invalid verification link');
      setMessageType('error');
      setIsLoading(false);
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      await authService.verifyEmail(token);
      setMessage('Email verified successfully! You can now log in.');
      setMessageType('success');
    } catch (error) {
      setMessage(error.message || 'Email verification failed');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        {/* Header Section */}
        <div className="verification-header">
          <div className="verification-icon">
            {isLoading ? (
              <div className="loading-spinner">
                <svg className="spinner" viewBox="0 0 50 50">
                  <circle
                    className="spinner-path"
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    strokeWidth="4"
                  />
                </svg>
              </div>
            ) : messageType === 'success' ? (
              <svg className="success-icon" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#10b981"/>
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg className="error-icon" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#ef4444"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          
          <h2 className="verification-title">
            {isLoading ? 'Verifying Email...' : 'Email Verification'}
          </h2>
        </div>

        {/* Content Section */}
        <div className="verification-content">
          {isLoading ? (
            <div className="loading-content">
              <p>Please wait while we verify your email address.</p>
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          ) : (
            <div className={`verification-result ${messageType}`}>
              <p className="result-message">{message}</p>
              
              {messageType === 'success' && (
                <div className="success-details">
                  <div className="success-checkmarks">
                    <div className="checkmark-item">
                      <span className="checkmark">✓</span>
                      <span>Email verified</span>
                    </div>
                    <div className="checkmark-item">
                      <span className="checkmark">✓</span>
                      <span>Account activated</span>
                    </div>
                    <div className="checkmark-item">
                      <span className="checkmark">✓</span>
                      <span>Ready to log in</span>
                    </div>
                  </div>
                </div>
              )}

              {messageType === 'error' && (
                <div className="error-details">
                  <div className="error-reasons">
                    <h4>Possible reasons:</h4>
                    <ul>
                      <li>The verification link has expired</li>
                      <li>The link has already been used</li>
                      <li>The link is invalid or corrupted</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Section */}
        {!isLoading && (
          <div className="verification-actions">
            {messageType === 'success' ? (
              <div className="success-actions">
                <a href="/" className="btn btn-primary">
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4m-5-4l4-4-4-4m5 8H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Go to Login
                </a>
                <p className="action-note">You can now log in with your credentials</p>
              </div>
            ) : (
              <div className="error-actions">
                <a href="/" className="btn btn-secondary">
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back to Home
                </a>
                <button className="btn btn-outline" onClick={() => window.location.reload()}>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Try Again
                </button>
                <p className="action-note">If the problem persists, contact support</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;