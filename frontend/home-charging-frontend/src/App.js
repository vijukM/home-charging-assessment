import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Assessment from "./Assesstment.js";

function Navbar() {
  return (
    <nav className="navbar" id="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">🔋 EV Charge</Link>
        <ul className="nav-menu">
          <li className="nav-item"><Link to="/" className="nav-link">Home</Link></li>
          <li className="nav-item"><Link to="/assessment" className="nav-link">Assessment</Link></li>
          <li className="nav-item"><a href="#features" className="nav-link">Features</a></li>
          <li className="nav-item"><a href="#process" className="nav-link">Process</a></li>
          <li className="nav-item"><a href="#contact" className="nav-link">Contact</a></li>
        </ul>
        <Link to="/assessment" className="cta-button">Start Assessment</Link>
      </div>
    </nav>
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
