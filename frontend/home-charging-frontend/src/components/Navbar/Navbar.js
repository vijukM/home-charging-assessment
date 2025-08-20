// components/Navbar/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import AuthModal from '../AuthModal';
import authService from '../../services/authService';
import './Navbar.css';

function Navbar() {
  // Basic state
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Admin dropdown states
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isAnalyticsDropdownOpen, setIsAnalyticsDropdownOpen] = useState(false);
  const [isSystemDropdownOpen, setIsSystemDropdownOpen] = useState(false);

  // User dropdown states  
  const [isHomeDropdownOpen, setIsHomeDropdownOpen] = useState(false);
  const [isMyDropdownOpen, setIsMyDropdownOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);

  useEffect(() => {
    if (authService.isLoggedIn()) {
      setUser(authService.getUser());
    }
  }, []);

  // Helper functions to check user roles
  const isAdmin = () => {
    return user && user.roles && user.roles.includes('Admin');
  };

  const isRegularUser = () => {
    return user && user.roles && user.roles.includes('User') && !user.roles.includes('Admin');
  };

  // Assessment click handler
  const handleAssessmentClick = (e) => {
    e.preventDefault();
    
    if (!authService.isLoggedIn()) {
      showLoginAlert();
    } else {
      navigate('/assessment');
    }
  };

  const showLoginAlert = () => {
    Swal.fire({
      title: 'Login Required',
      text: 'You need to log in to access the EV charging assessment.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Login',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      showCloseButton: true,
      reverseButtons: true,
      customClass: {
        popup: 'auth-alert-popup',
        confirmButton: 'auth-alert-login-btn',
        cancelButton: 'auth-alert-cancel-btn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setIsLoginModalOpen(true);
      }
    });
  };

  const closeModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleLoginSuccess = (userData) => {
    setUser(authService.getUser());
    setIsLoginModalOpen(false);
    
    Swal.fire({
      title: 'Welcome!',
      text: 'Redirecting to assessment...',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      customClass: {
        popup: 'success-alert-popup'
      }
    }).then(() => {
      navigate('/assessment');
    });
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsUserDropdownOpen(false);
    window.location.reload();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-dropdown-container')) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Render Admin Navigation
  const renderAdminNavigation = () => (
    <div className="nav-menu-section admin-navigation">
      <ul className="nav-menu">
        {/* Dashboard */}
        <li className="nav-item">
          <Link to="/admin/dashboard" className="nav-link">
            Dashboard
          </Link>
        </li>

        {/* Assessment Management */}
        <li className="nav-item">
            <Link to="/admin/assessments" className="nav-link">
            Assessments
          </Link>
        </li>

        {/* Customer Management */}
        <li 
          className="nav-item dropdown"
          onMouseEnter={() => setIsCustomerDropdownOpen(true)}
          onMouseLeave={() => setIsCustomerDropdownOpen(false)}
        >
          <span className="nav-link dropdown-toggle">
            Users
            <svg className="dropdown-arrow" viewBox="0 0 24 24">
              <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
            </svg>
          </span>
          {isCustomerDropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/admin/users/all" className="dropdown-item">
                <i className="fas fa-users"></i>
                All Users
              </Link>
              <Link to="/admin/users/active" className="dropdown-item">
                <i className="fas fa-user-check"></i>
                Active Users
              </Link>
              <Link to="/admin/users/recent" className="dropdown-item">
                <i className="fas fa-user-plus"></i>
                Recent Signups
              </Link>
            </div>
          )}
        </li>

        {/* Analytics */}
        <li 
          className="nav-item dropdown"
          onMouseEnter={() => setIsAnalyticsDropdownOpen(true)}
          onMouseLeave={() => setIsAnalyticsDropdownOpen(false)}
        >
          <span className="nav-link dropdown-toggle">
            Analytics
            <svg className="dropdown-arrow" viewBox="0 0 24 24">
              <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
            </svg>
          </span>
          {isAnalyticsDropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/admin/analytics/completion-rates" className="dropdown-item">
                <i className="fas fa-chart-line"></i>
                Completion Rates
              </Link>
              <Link to="/admin/analytics/drop-off" className="dropdown-item">
                <i className="fas fa-chart-bar"></i>
                Drop-off Analysis
              </Link>
              <Link to="/admin/analytics/reports" className="dropdown-item">
                <i className="fas fa-file-alt"></i>
                Generate Reports
              </Link>
            </div>
          )}
        </li>

        {/* System Management */}
        <li 
          className="nav-item dropdown"
          onMouseEnter={() => setIsSystemDropdownOpen(true)}
          onMouseLeave={() => setIsSystemDropdownOpen(false)}
        >
          <span className="nav-link dropdown-toggle">
            System
            <svg className="dropdown-arrow" viewBox="0 0 24 24">
              <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
            </svg>
          </span>
          {isSystemDropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/admin/system/admins" className="dropdown-item">
                <i className="fas fa-user-shield"></i>
                Admin Management
              </Link>
              <Link to="/admin/system/database" className="dropdown-item">
                <i className="fas fa-database"></i>
                Database Management
              </Link>
              <Link to="/admin/system/logs" className="dropdown-item">
                <i className="fas fa-clipboard-list"></i>
                System Logs
              </Link>
            </div>
          )}
        </li>
      </ul>
    </div>
  );

  // Render Regular User Navigation
  const renderUserNavigation = () => (
    <div className="nav-menu-section user-navigation">
      <ul className="nav-menu">
        {/* Home Dropdown */}
        <li 
          className="nav-item dropdown"
          onMouseEnter={() => setIsHomeDropdownOpen(true)}
          onMouseLeave={() => setIsHomeDropdownOpen(false)}
        >
          <Link to="/" className="nav-link dropdown-toggle">
            Home
            <svg className="dropdown-arrow" viewBox="0 0 24 24">
              <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
            </svg>
          </Link>
          {isHomeDropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/" className="dropdown-item">
                <i className="fas fa-tachometer-alt"></i>
                Dashboard
              </Link>
              <Link to="/features" className="dropdown-item">
                <i className="fas fa-bolt"></i>
                Features
              </Link>
              <Link to="/pricing" className="dropdown-item">
                <i className="fas fa-dollar-sign"></i>
                Pricing
              </Link>
              <Link to="/about" className="dropdown-item">
                <i className="fas fa-info-circle"></i>
                About Us
              </Link>
            </div>
          )}
        </li>

        {/* Assessment Link */}
        <li className="nav-item">
          <a 
            href="/assessment" 
            className="nav-link"
            onClick={handleAssessmentClick}
          >
            Assessment
          </a>
        </li>

        {/* My Account Dropdown */}
        <li 
          className="nav-item dropdown"
          onMouseEnter={() => setIsMyDropdownOpen(true)}
          onMouseLeave={() => setIsMyDropdownOpen(false)}
        >
          <span className="nav-link dropdown-toggle">
            My Account
            <svg className="dropdown-arrow" viewBox="0 0 24 24">
              <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
            </svg>
          </span>
          {isMyDropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/my-assessments" className="dropdown-item">
                <i className="fas fa-check-circle"></i>
                My Assessments
              </Link>
              <Link to="/my-profile" className="dropdown-item">
                <i className="fas fa-user"></i>
                My Profile
              </Link>
              <Link to="/my-recommendations" className="dropdown-item">
                <i className="fas fa-lightbulb"></i>
                My Recommendations
              </Link>
              <Link to="/my-orders" className="dropdown-item">
                <i className="fas fa-shopping-bag"></i>
                My Orders
              </Link>
            </div>
          )}
        </li>

        {/* Services Dropdown */}
        <li 
          className="nav-item dropdown"
          onMouseEnter={() => setIsServicesDropdownOpen(true)}
          onMouseLeave={() => setIsServicesDropdownOpen(false)}
        >
          <span className="nav-link dropdown-toggle">
            Services
            <svg className="dropdown-arrow" viewBox="0 0 24 24">
              <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
            </svg>
          </span>
          {isServicesDropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/installation-booking" className="dropdown-item">
                <i className="fas fa-calendar-alt"></i>
                Book Installation
              </Link>
              <Link to="/find-installers" className="dropdown-item">
                <i className="fas fa-map-marker-alt"></i>
                Find Installers
              </Link>
              <Link to="/charger-shop" className="dropdown-item">
                <i className="fas fa-shopping-cart"></i>
                Buy Chargers
              </Link>
              <Link to="/support" className="dropdown-item">
                <i className="fas fa-headset"></i>
                Support
              </Link>
            </div>
          )}
        </li>

        {/* Contact Dropdown */}
        <li 
          className="nav-item dropdown"
          onMouseEnter={() => setIsContactDropdownOpen(true)}
          onMouseLeave={() => setIsContactDropdownOpen(false)}
        >
          <span className="nav-link dropdown-toggle">
            Contact
            <svg className="dropdown-arrow" viewBox="0 0 24 24">
              <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
            </svg>
          </span>
          {isContactDropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/contact" className="dropdown-item">
                <i className="fas fa-envelope"></i>
                Contact Form
              </Link>
              <a href="tel:+1234567890" className="dropdown-item">
                <i className="fas fa-phone"></i>
                Call Us
              </a>
              <Link to="/faq" className="dropdown-item">
                <i className="fas fa-question-circle"></i>
                FAQ
              </Link>
            </div>
          )}
        </li>
      </ul>
    </div>
  );

  return (
    <>
      <nav className={`navbar ${isAdmin() ? 'admin-theme' : 'user-theme'}`} id="navbar">
        <div className={`nav-container ${isAdmin() ? 'admin-mode' : 'user-mode'}`}>
          {/* Logo and Title */}
          <div className="logo-section">
            <Link to="/" className="logo">
              <span className="logo-icon"></span>
              <span className="logo-text"
                style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700 }}>
                EV Charge
              </span>
            </Link>
          </div>

          {/* Search Bar - Only show for regular users */}
          {!isAdmin() && (
            <div className="search-section">
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <button type="submit" className="search-button">
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none">
                      <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Conditional Navigation Menu */}
          {isAdmin() ? renderAdminNavigation() : renderUserNavigation()}

          {/* Right Side Buttons */}
          <div className="nav-actions">
            {user ? (
              <div className="user-dropdown-container">
                <button 
                  className="action-button profile-button user-dropdown-trigger"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                >
                  <svg className="profile-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21M16 7C16 9.2 14.2 11 12 11C9.8 11 8 9.2 8 7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {isAdmin() && (
                    <span className="admin-badge">
                      <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="3" fill="currentColor"/>
                        <path d="M12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11ZM12 13C9.33 13 4 14.34 4 17V19H20V17C20 14.34 14.67 13 12 13Z" fill="currentColor"/>
                      </svg>
                    </span>
                  )}
                </button>

                {isUserDropdownOpen && (
                  <div className="user-dropdown-menu">
                    <div className="user-dropdown-header">
                      <span className="user-greeting">
                        Hi, {user.username}!
                        {isAdmin() && <span className="admin-label">Admin</span>}
                      </span>
                      {!user.emailVerified && (
                        <span className="verification-warning">⚠️ Verify email</span>
                      )}
                    </div>

                    <div className="dropdown-divider"></div>

                    {/* Conditional Menu Items */}
                    {isAdmin() ? (
                      <>
                        <Link to="/admin/dashboard" className="user-dropdown-item admin-only">
                          <i className="fas fa-tachometer-alt"></i>
                          Admin Dashboard
                        </Link>
                        <Link to="/admin/customers/all" className="user-dropdown-item admin-only">
                          <i className="fas fa-users"></i>
                          Manage Users
                        </Link>
                        <Link to="/admin/system/admins" className="user-dropdown-item admin-only">
                          <i className="fas fa-cog"></i>
                          Admin Settings
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/my-assessments" className="user-dropdown-item user-only">
                          <i className="fas fa-check-circle"></i>
                          My Assessments
                        </Link>
                        <Link to="/my-orders" className="user-dropdown-item user-only">
                          <i className="fas fa-shopping-bag"></i>
                          My Orders
                        </Link>
                      </>
                    )}

                    {/* Common Menu Items */}
                    <Link to="/profile" className="user-dropdown-item">
                      <i className="fas fa-user"></i>
                      My Profile
                    </Link>

                    <Link to="/settings" className="user-dropdown-item">
                      <i className="fas fa-cog"></i>
                      Settings
                    </Link>

                    <Link to="/help" className="user-dropdown-item">
                      <i className="fas fa-question-circle"></i>
                      Help & Support
                    </Link>

                    <div className="dropdown-divider"></div>

                    <button className="user-dropdown-item logout-item" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                className="action-button profile-button"
                onClick={() => setIsLoginModalOpen(true)}
              >
                <svg className="profile-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21M16 7C16 9.2 14.2 11 12 11C9.8 11 8 9.2 8 7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}

            {/* Cart Button - Only for regular users */}
            {!isAdmin() && (
              <button className="action-button cart-button">
                <svg className="cart-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 17.9 19 19 19C20.1 19 21 18.1 21 17C21 15.9 20.1 15 19 15C17.9 15 17 15.9 17 17ZM9 19C10.1 19 11 18.1 11 17C11 15.9 10.1 15 9 15C7.9 15 7 15.9 7 17C7 18.1 7.9 19 9 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isLoginModalOpen} 
        onClose={closeModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default Navbar;