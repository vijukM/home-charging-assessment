import "./App.css";
import "./Navbar.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Assessment from "./Assesstment.js";
import React, { useState } from 'react';

function Navbar() {
  const [isHomeDropdownOpen, setIsHomeDropdownOpen] = useState(false);
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const closeModal = () => {
    setIsLoginModalOpen(false);
    setIsSignUp(false);
  };

  const switchToSignUp = () => setIsSignUp(true);
  const switchToLogin = () => setIsSignUp(false);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Add your search logic here
  };

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

              {/* Assessment Link */}
              <li className="nav-item">
                <Link to="/assessment" className="nav-link">Assessment</Link>
              </li>

                   <li className="nav-item">
                <Link to="/assessment" className="nav-link">Blog</Link>
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

            {/* Profile Button */}
            <button 
              className="action-button profile-button"
              onClick={() => setIsLoginModalOpen(true)}
            >
              <svg className="profile-icon" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21M16 7C16 9.2 14.2 11 12 11C9.8 11 8 9.2 8 7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {/* Cart Button */}
            <button className="action-button cart-button">
              <svg className="cart-icon" viewBox="0 0 24 24" fill="none">
                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 17.9 19 19 19C20.1 19 21 18.1 21 17C21 15.9 20.1 15 19 15C17.9 15 17 15.9 17 17ZM9 19C10.1 19 11 18.1 11 17C11 15.9 10.1 15 9 15C7.9 15 7 15.9 7 17C7 18.1 7.9 19 9 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

        </div>
      </nav>

      {/* Login/SignUp Modal */}
      {isLoginModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            {!isSignUp ? (
              // Login Form
              <div className="auth-form">
                <h2>Login</h2>
                <form>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="Enter your email" required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" placeholder="Enter your password" required />
                  </div>
                  <button type="submit" className="auth-button">Login</button>
                </form>
                <p className="auth-switch">
                  Don't have an account? 
                  <button onClick={switchToSignUp} className="switch-button">Sign Up</button>
                </p>
              </div>
            ) : (
              // Sign Up Form
              <div className="auth-form">
                <h2>Sign Up</h2>
                <form>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" placeholder="Enter your full name" required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="Enter your email" required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" placeholder="Create a password" required />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input type="password" placeholder="Confirm your password" required />
                  </div>
                  <button type="submit" className="auth-button">Sign Up</button>
                </form>
                <p className="auth-switch">
                  Already have an account? 
                  <button onClick={switchToLogin} className="switch-button">Login</button>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}


function Home() {
  return (
    <div>
      {/* HERO SECTION */}
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
              <Link to="/assessment" className="btn-primary">Start Free Assessment</Link>    
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

      {/* FEATURES SECTION */}
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

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content">
            <h2>Ready to Go Electric?</h2>
            <p>
              Start your free home EV charging assessment today and take the first step towards
              sustainable transportation.
            </p>
            <Link to="/assessment" className="btn-white">
              Start Your Free Assessment
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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
      </Routes>
    </Router>
  );
}
