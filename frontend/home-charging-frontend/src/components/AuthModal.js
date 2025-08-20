import React, { useState } from 'react';
import authService from '../services/authService';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Form states
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  
  const [signupForm, setSignupForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: ''
  });

  const resetForms = () => {
    setLoginForm({ username: '', password: '' });
    setSignupForm({ username: '', email: '', password: '', confirmPassword: '' });
    setForgotPasswordForm({ email: '' });
    setMessage('');
    setMessageType('');
  };

  const closeMessage = () => {
    setMessage('');
    setMessageType('');
  };

  const closeModal = () => {
    resetForms();
    setIsSignUp(false);
    setShowForgotPassword(false);
    onClose();
  };

  const switchToSignUp = () => {
    resetForms();
    setIsSignUp(true);
    setShowForgotPassword(false);
  };

  const switchToLogin = () => {
    resetForms();
    setIsSignUp(false);
    setShowForgotPassword(false);
  };

  const switchToForgotPassword = () => {
    resetForms();
    setShowForgotPassword(true);
    setIsSignUp(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await authService.login(loginForm);
      
      if (!response.emailVerified) {
        setMessage('Please verify your email before logging in. Check your inbox for verification email.');
        setMessageType('info');
        setIsLoading(false);
        return;
      }

      setMessage('Login successful!');
      setMessageType('success');
      
      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess(response);
      }
      
      setTimeout(() => {
        closeModal();
        window.location.reload(); // Refresh to update UI
      }, 1000);
      
    } catch (error) {
      setMessage(error.message || 'Login failed');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Validate passwords match
    if (signupForm.password !== signupForm.confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.register(signupForm);
      setMessage('Registration successful! Please check your email to verify your account.');
      setMessageType('success');
      
      // Clear form and switch to login after a delay
      setTimeout(() => {
        resetForms();
        setIsSignUp(false);
      }, 4000);
      
    } catch (error) {
      setMessage(error.message || 'Registration failed');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      await authService.forgotPassword(forgotPasswordForm.email);
      setMessage('Password reset email sent! Check your inbox.');
      setMessageType('success');
      
      setTimeout(() => {
        setShowForgotPassword(false);
        switchToLogin();
      }, 4000);
      
    } catch (error) {
      setMessage(error.message || 'Failed to send reset email');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Independent Message Display - positioned above modal */}
      {message && (
        <div className="auth-message-overlay">
          <div className={`auth-message ${messageType}`}>
            <span className="auth-message-text">{message}</span>
            <button className="auth-message-close" onClick={closeMessage}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6L18 18"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <div className="modal-overlayy" onClick={closeModal}>
        <div className="modal-contentt" onClick={(e) => e.stopPropagation()}>
          <button className="modal-closee" onClick={closeModal} disabled={isLoading}>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {showForgotPassword ? (
            // Forgot Password Form
            <div className="auth-form">
              <h2>Reset Password</h2>
              <form onSubmit={handleForgotPassword}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={forgotPasswordForm.email}
                    onChange={(e) => setForgotPasswordForm({...forgotPasswordForm, email: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>
                <button type="submit" className="auth-button" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Email'}
                </button>
              </form>
              <p className="auth-switch">
                Remember your password?
                <button onClick={switchToLogin} className="switch-button" disabled={isLoading}>
                  Back to Login
                </button>
              </p>
            </div>
          ) : !isSignUp ? (
            // Login Form
            <div className="auth-form">
              <h2>Login</h2>
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Username"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>
                <button type="submit" className="auth-button" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>
              <p className="auth-switch">
                Don't have an account?
                <button onClick={switchToSignUp} className="switch-button" disabled={isLoading}>
                  Sign Up
                </button>
              </p>
              <p className="auth-switch">
                <button onClick={switchToForgotPassword} className="switch-button" disabled={isLoading}>
                  Forgot Password?
                </button>
              </p>
            </div>
          ) : (
            // Sign Up Form
            <div className="auth-form">
              <h2>Sign Up</h2>
              <form onSubmit={handleSignUp}>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Username"
                    value={signupForm.username}
                    onChange={(e) => setSignupForm({...signupForm, username: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    placeholder="Password (min 6 characters)"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                    required
                    minLength="6"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>
                <button type="submit" className="auth-button" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>
              <p className="auth-switch">
                Already have an account?
                <button onClick={switchToLogin} className="switch-button" disabled={isLoading}>
                  Login
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthModal;