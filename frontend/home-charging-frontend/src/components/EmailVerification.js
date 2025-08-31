import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import './EmailVerification.css';
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
    <div className="email-verify-container">
      <div className="email-verify-card">
        {/* Header Section */}
        <div className="email-verify-header">
          <div className="email-verify-icon">
            {isLoading ? (
              <div className="email-verify-loading-spinner">
                <svg className="email-verify-spinner" viewBox="0 0 50 50">
                  <defs>
                    <linearGradient id="email-verify-spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor:'#3b82f6', stopOpacity:1}} />
                      <stop offset="50%" style={{stopColor:'#8b5cf6', stopOpacity:1}} />
                      <stop offset="100%" style={{stopColor:'#ec4899', stopOpacity:1}} />
                    </linearGradient>
                  </defs>
                  <circle
                    className="email-verify-spinner-path"
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke="url(#email-verify-spinner-gradient)"
                    strokeWidth="3"
                  />
                </svg>
              </div>
            ) : messageType === 'success' ? (
              <svg className="email-verify-success-icon" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="email-verify-success-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#10b981', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#059669', stopOpacity:1}} />
                  </linearGradient>
                </defs>
                <circle cx="12" cy="12" r="10" fill="url(#email-verify-success-gradient)" />
                <path 
                  d="M9 12l2 2 4-4" 
                  stroke="white" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg className="email-verify-error-icon" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="email-verify-error-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#ef4444', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#dc2626', stopOpacity:1}} />
                  </linearGradient>
                </defs>
                <circle cx="12" cy="12" r="10" fill="url(#email-verify-error-gradient)" />
                <path 
                  d="M15 9l-6 6M9 9l6 6" 
                  stroke="white" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          
          <h2 className="email-verify-title">
            {isLoading ? 'Verifying Email...' : 'Email Verification'}
          </h2>
        </div>

        {/* Content Section */}
        <div className="email-verify-content">
          {isLoading ? (
            <div className="email-verify-loading-content">
              <p>Please wait while we verify your email address.</p>
              <div className="email-verify-loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          ) : (
            <div className={`email-verify-result ${messageType}`}>
              <p className="email-verify-result-message">{message}</p>
              
              {messageType === 'success' && (
                <div className="email-verify-success-details">
                  <div className="email-verify-success-checkmarks">
                    <div className="email-verify-checkmark-item">
                      <span className="email-verify-checkmark">✓</span>
                      <span>Email verified</span>
                    </div>
                    <div className="email-verify-checkmark-item">
                      <span className="email-verify-checkmark">✓</span>
                      <span>Account activated</span>
                    </div>
                    <div className="email-verify-checkmark-item">
                      <span className="email-verify-checkmark">✓</span>
                      <span>Ready to log in</span>
                    </div>
                  </div>
                </div>
              )}

              {messageType === 'error' && (
                <div className="email-verify-error-details">
                  <div className="email-verify-error-reasons">
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
          <div className="email-verify-actions">
            {messageType === 'success' ? (
              <div className="email-verify-success-actions">
                <a href="/" className="email-verify-btn email-verify-btn-primary">
                  <svg className="email-verify-btn-icon" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4m-5-4l4-4-4-4m5 8H3" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                  Go to Login
                </a>
                <p className="email-verify-action-note">You can now log in with your credentials</p>
              </div>
            ) : (
              <div className="email-verify-error-actions">
                <a href="/" className="email-verify-btn email-verify-btn-secondary">
                  <svg className="email-verify-btn-icon" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                  Back to Home
                </a>
                <button className="email-verify-btn email-verify-btn-outline" onClick={() => window.location.reload()}>
                  <svg className="email-verify-btn-icon" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M1 4v6h6M23 20v-6h-6" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                  Try Again
                </button>
                <p className="email-verify-action-note">If the problem persists, contact support</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;