import "./App.css";
import "./Navbar.css";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Assessment from "./Assesstment.js";
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import AuthModal from './components/AuthModal';
import EmailVerification from './components/EmailVerification';
import PasswordReset from './components/PasswordReset';
import authService from './services/authService';

function Navbar() {
  const [isHomeDropdownOpen, setIsHomeDropdownOpen] = useState(false);
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    if (authService.isLoggedIn()) {
      setUser(authService.getUser());
    }
  }, []);

  // NOVA FUNKCIJA - Provera pre odlaska na Assessment
  const handleAssessmentClick = (e) => {
    e.preventDefault(); // Spreči default link behavior
    
    if (!authService.isLoggedIn()) {
      // Prikaži SweetAlert2 ako nije ulogovan
      showLoginAlert();
    } else {
      // Ako jeste ulogovan, idi na Assessment
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
        // Otvori login modal
        setIsLoginModalOpen(true);
      }
      // Ako Cancel ili X - ostani na trenutnoj strani
    });
  };

  const closeModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleLoginSuccess = (userData) => {
    setUser(authService.getUser());
    setIsLoginModalOpen(false);
    
    // Prikaži success poruku i automatski idi na Assessment
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
      // Nakon success poruke, idi na Assessment
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

  return (
    <>
      <nav className="navbar" id="navbar">
        <div className="nav-container">
          {/* Logo and Title */}
          <div className="logo-section">
            <Link to="/" className="logo">
              <span className="logo-icon"></span>
              <span className="logo-text"
                style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700 }}>EV Charge</span>
            </Link>
          </div>

          {/* Search Bar */}
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

          {/* Navigation Menu */}
          <div className="nav-menu-section">
            <ul className="nav-menu">
              {/* Home Dropdown */}
              <li 
                className="nav-item dropdown"
                onMouseEnter={() => setIsHomeDropdownOpen(true)}
                onMouseLeave={() => setIsHomeDropdownOpen(false)}
              >
                <a href="/" className="nav-link dropdown-toggle">
                  Home
                  <svg className="dropdown-arrow" viewBox="0 0 24 24">
                    <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
                  </svg>
                </a>
                {isHomeDropdownOpen && (
                  <div className="dropdown-menu">
                    <Link to="/" className="dropdown-item">Dashboard</Link>
                    <Link to="/features" className="dropdown-item">Features</Link>
                    <Link to="/pricing" className="dropdown-item">Pricing</Link>
                    <Link to="/about" className="dropdown-item">About Us</Link>
                  </div>
                )}
              </li>

              {/* Assessment Link - IZMENJENO */}
              <li className="nav-item">
                <a 
                  href="/assessment" 
                  className="nav-link"
                  onClick={handleAssessmentClick}
                >
                  Assessment
                </a>
              </li>

              <li className="nav-item">
                <Link to="/blog" className="nav-link">Blog</Link>
              </li>

              {/* Contact Dropdown */}
              <li 
                className="nav-item dropdown"
                onMouseEnter={() => setIsContactDropdownOpen(true)}
                onMouseLeave={() => setIsContactDropdownOpen(false)}
              >
                <a href="#" className="nav-link dropdown-toggle">
                  Contact
                  <svg className="dropdown-arrow" viewBox="0 0 24 24">
                    <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
                  </svg>
                </a>
                {isContactDropdownOpen && (
                  <div className="dropdown-menu">
                    <Link to="/contact" className="dropdown-item">Contact Form</Link>
                    <Link to="/support" className="dropdown-item">Support</Link>
                    <Link to="/faq" className="dropdown-item">FAQ</Link>
                    <a href="tel:+1234567890" className="dropdown-item">Call Us</a>
                  </div>
                )}
              </li>
            </ul>
          </div>

          {/* Right Side Buttons */}
          <div className="nav-actions">
            {user ? (
              // UPDATED User Dropdown Menu
              <div className="user-dropdown-container">
                <button 
                  className="action-button profile-button user-dropdown-trigger"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                >
                  <svg className="profile-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21M16 7C16 9.2 14.2 11 12 11C9.8 11 8 9.2 8 7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {isUserDropdownOpen && (
                  <div className="user-dropdown-menu">
                    {/* User Greeting */}
                    <div className="user-dropdown-header">
                      <span className="user-greeting">Hi, {user.username}!</span>
                      {!user.emailVerified && (
                        <span className="verification-warning">⚠️ Verify email</span>
                      )}
                    </div>

                    <div className="dropdown-divider"></div>

                    {/* Menu Items */}
                    <Link to="/profile" className="user-dropdown-item">
                      <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21M16 7C16 9.2 14.2 11 12 11C9.8 11 8 9.2 8 7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      My Profile
                    </Link>

                    <Link to="/my-assessments" className="user-dropdown-item">
                      <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12L11 14L15 10M21 12C21 16.971 16.971 21 12 21C7.029 21 3 16.971 3 12C3 7.029 7.029 3 12 3C16.971 3 21 7.029 21 12Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      My Assessments
                    </Link>

                    <Link to="/settings" className="user-dropdown-item">
                      <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M10.325 4.317C10.751 2.561 13.249 2.561 13.675 4.317C13.7389 4.5808 13.8642 4.82578 14.0407 5.032C14.2172 5.23822 14.4399 5.39985 14.6907 5.50375C14.9414 5.60764 15.2132 5.65085 15.4838 5.62987C15.7544 5.60889 16.0162 5.52418 16.248 5.383C17.791 4.443 19.558 6.209 18.618 7.753C18.4769 7.98466 18.3924 8.24634 18.3715 8.51677C18.3506 8.78721 18.3938 9.05877 18.4975 9.30938C18.6013 9.55999 18.7627 9.78258 18.9687 9.95905C19.1747 10.1355 19.4194 10.2609 19.683 10.325C21.439 10.751 21.439 13.249 19.683 13.675C19.4192 13.7389 19.1742 13.8642 18.968 14.0407C18.7618 14.2172 18.6001 14.4399 18.4963 14.6907C18.3924 14.9414 18.3491 15.2132 18.3701 15.4838C18.3911 15.7544 18.4758 16.0162 18.617 16.248C19.557 17.791 17.791 19.558 16.247 18.618C16.0153 18.4769 15.7537 18.3924 15.4832 18.3715C15.2128 18.3506 14.9412 18.3938 14.6906 18.4975C14.44 18.6013 14.2174 18.7627 14.041 18.9687C13.8645 19.1747 13.7391 19.4194 13.675 19.683C13.249 21.439 10.751 21.439 10.325 19.683C10.2611 19.4192 10.1358 19.1742 9.95929 18.968C9.7828 18.7618 9.56011 18.6001 9.30935 18.4963C9.05859 18.3924 8.78683 18.3491 8.51621 18.3701C8.24559 18.3911 7.98375 18.4758 7.752 18.617C6.209 19.557 4.442 17.791 5.382 16.247C5.5231 16.0153 5.60755 15.7537 5.62848 15.4832C5.64942 15.2128 5.60624 14.9412 5.50247 14.6906C5.3987 14.44 5.23726 14.2174 5.03127 14.041C4.82529 13.8645 4.58056 13.7391 4.317 13.675C2.561 13.249 2.561 10.751 4.317 10.325C4.5808 10.2611 4.82578 10.1358 5.032 9.95929C5.23822 9.7828 5.39985 9.56011 5.50375 9.30935C5.60764 9.05859 5.65085 8.78683 5.62987 8.51621C5.60889 8.24559 5.52418 7.98375 5.383 7.752C4.443 6.209 6.209 4.442 7.753 5.382C7.98466 5.5231 8.24634 5.60755 8.51677 5.62848C8.78721 5.64942 9.05877 5.60624 9.30938 5.50247C9.55999 5.3987 9.78258 5.23726 9.95905 5.03127C10.1355 4.82529 10.2609 4.58056 10.325 4.317Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Settings
                    </Link>

                    <Link to="/help" className="user-dropdown-item">
                      <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M8.228 9C8.43686 8.4174 8.80434 7.91067 9.29113 7.54026C9.77793 7.16986 10.3618 6.95479 10.9663 6.92125C11.5709 6.88771 12.1726 7.03721 12.6955 7.35052C13.2184 7.66384 13.6395 8.12513 13.9056 8.67751C14.1717 9.22988 14.2711 9.84713 14.1914 10.4529C14.1117 11.0587 13.8573 11.6259 13.4615 12.0886C13.0658 12.5513 12.5459 12.8885 11.9647 13.0575C11.3835 13.2265 10.7668 13.2198 10.189 13.038" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Help & Support
                    </Link>

                    <div className="dropdown-divider"></div>

                    {/* Logout */}
                    <button className="user-dropdown-item logout-item" onClick={handleLogout}>
                      <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Login button for non-logged in users
              <button 
                className="action-button profile-button"
                onClick={() => setIsLoginModalOpen(true)}
              >
                <svg className="profile-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21M16 7C16 9.2 14.2 11 12 11C9.8 11 8 9.2 8 7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}

            {/* Cart Button */}
            <button className="action-button cart-button">
              <svg className="cart-icon" viewBox="0 0 24 24" fill="none">
                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 17.9 19 19 19C20.1 19 21 18.1 21 17C21 15.9 20.1 15 19 15C17.9 15 17 15.9 17 17ZM9 19C10.1 19 11 18.1 11 17C11 15.9 10.1 15 9 15C7.9 15 7 15.9 7 17C7 18.1 7.9 19 9 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
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

function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  // NOVA FUNKCIJA za Assessment dugmad u Hero sekciji
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

  return (
    <div>
      {/* Hero and other sections remain the same */}
      <section className="hero" id="home">
        <div className="hero-container">
          <div className="hero-content">
            <h1>
              Smart <span className="highlight">EV Charging</span> Assessment for Your Home
            </h1>
            <p>
              Discover if your home is ready for electric vehicle charging with our
              comprehensive assessment tool. Get personalized recommendations and
              professional guidance.
            </p>

            <div className="hero-buttons">
              {/* IZMENJENO - dodao handleAssessmentClick */}
              <a 
                href="/assessment" 
                className="btn-primary"
                onClick={handleAssessmentClick}
              >
                Start Free Assessment
              </a>    
              <a href="#features" className="btn-secondary">Learn More</a>
            </div>

            <div className="stats">
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Assessments Completed</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">98%</span>
                <span className="stat-label">Accuracy Rate</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Expert Support</span>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://sydneyevchargers.com.au/wp-content/uploads/2023/09/ev.webp"
              alt="EV Charging Station"
            />
            <div className="floating-card floating-card-1">
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div className="icon-circle green">
                  <i className="fas fa-check"></i>
                </div>
                <div>
                  <strong style={{ color: "#2d5a2d" }}>Compatible</strong>
                  <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>
                    Ready for installation
                  </p>
                </div>
              </div>
            </div>

            <div className="floating-card floating-card-2">
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div className="icon-circle orange">
                  <i className="fas fa-bolt"></i>
                </div>
                <div>
                  <strong style={{ color: "#2d5a2d" }}>Fast Charging</strong>
                  <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>
                    Up to 22kW
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Our Assessment?</h2>
            <p className="section-subtitle">
              Comprehensive analysis of your home's electrical system and charging requirements
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>Detailed Analysis</h3>
              <p>
                Thorough evaluation of your electrical panel, wiring, and infrastructure to
                determine charging compatibility.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Cost Estimation</h3>
              <p>
                Accurate cost breakdown for installation, including equipment, labor, and
                potential electrical upgrades.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Safety First</h3>
              <p>
                Comprehensive safety assessment to ensure your charging installation meets all
                safety standards and codes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content">
            <h2>Ready to Go Electric?</h2>
            <p>
              Start your free home EV charging assessment today and take the first step towards
              sustainable transportation.
            </p>
            {/* IZMENJENO - dodao handleAssessmentClick */}
            <a 
              href="/assessment" 
              className="btn-white"
              onClick={handleAssessmentClick}
            >
              Start Your Free Assessment
            </a>
          </div>
        </div>
      </section>

      <footer className="footer" id="contact">
        <div className="section-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>🔋 EV Charge Assessment</h3>
              <p>
                Making electric vehicle adoption simple and accessible for everyone. Professional
                home charging assessments by certified experts.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal za Home komponentu */}
      <AuthModal 
        isOpen={isLoginModalOpen} 
        onClose={closeModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/reset-password" element={<PasswordReset />} />
      </Routes>
    </Router>
  );
}