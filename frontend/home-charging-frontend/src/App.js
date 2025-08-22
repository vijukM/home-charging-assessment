// App.js
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Assessment from "./Assesstment.js";
import AuthModal from './components/AuthModal';
import EmailVerification from './components/EmailVerification';
import PasswordReset from './components/PasswordReset';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoutes from './routes/AdminRoutes';
import authService from './services/authService';

function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  // Assessment click handler for Hero section
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
      timer: 2000,
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
      {/* Hero Section */}
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

      {/* Features Section */}
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

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content">
            <h2>Ready to Go Electric?</h2>
            <p>
              Start your free home EV charging assessment today and take the first step towards
              sustainable transportation.
            </p>
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

      {/* Auth Modal for Home component */}
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
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/reset-password" element={<PasswordReset />} />
        
        {/* Protected Assessment Route */}
        <Route 
          path="/assessment" 
          element={
            <ProtectedRoute>
              <Assessment />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes - Protected and require Admin role */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminRoutes />
            </ProtectedRoute>
          } 
        />
        
        {/* User Routes - Add other protected user routes here */}
        {/* Example:
        <Route 
          path="/my-assessments" 
          element={
            <ProtectedRoute>
              <MyAssessments />
            </ProtectedRoute>
          } 
        />
        */}
        
      </Routes>
      <Footer />
    </Router>
  );
}