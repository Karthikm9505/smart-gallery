import React from 'react';
import { Link } from 'react-router-dom';
import '../LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">

      {/* Navbar */}
      <nav className="glass-nav">
        <div className="nav-container">

          <div className="logo">SecureCloud</div>

          <div className="nav-actions">
            <Link to="/login" className="login-btn">Login</Link>
            <Link to="/login" className="btn-primary">Get Started</Link>
          </div>

        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">

        <div className="hero-content">
          <h1 className="hero-title">Smart Gallery</h1>
          <p className="hero-subtitle">
            Automate your media workflow with AI-powered tagging and secure,
            zero-trust infrastructure.
          </p>
        </div>

        <div className="hero-actions">
        </div>

        <div className="hero-visual">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpThR34bPI51hTeQ0BKs8XTUad32Ra1-_1PQJDHjL4_L3P3awUKN6i4PajofTeiN__r00Bz3GZNQXQrQZf6uTHB043wiLuZpsp4Vlu2nGURDgUsYGZXQy7NxHmRr2l4l-i4Gc5GZ7vbjuUaILk9N0jfru2vLgvJkCfE0BKl0_UZDWGf2OIc64JzWXCEzZ-zXuoqhEoYYn2fPs2Rvl3kQF__Z9jqsk-2KgjUAhuT7ghjvKjlpsdl9gYy-uyPcvnnSqWpnG2bpQ2i7zGacE"
            alt="Dashboard"
          />
          <div className="hero-visual-overlay" />
          <div className="hero-visual-icon">
            <span className="material-symbols-outlined">cloud_sync</span>
          </div>
        </div>

      </section>

      {/* Features Bento Grid */}
      <section className="features-section">
        <div className="bento-grid">

          {/* Feature 1: AI Tagging (Large) */}
          <div className="bento-card feature-1">
            <div className="bento-card-gradient" />
            <div className="bento-card-content">
              <div className="bento-icon-wrapper">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <h3 className="bento-title">Intelligent AI Tagging</h3>
              <p className="bento-desc" style={{ maxWidth: '28rem' }}>
                Leverage Amazon Rekognition to automatically generate metadata
                for every asset. Remove manual entry and boost searchability by 40%.
              </p>
            </div>
            <div className="bento-visual visual-tags">
              <div className="visual-tags-bg" />
              <span className="tag">Mountain</span>
              <span className="tag">Blue Sky</span>
              <span className="tag">Sunset</span>
            </div>
          </div>

          {/* Feature 2: Smart Search */}
          <div className="bento-card feature-2">
            <div className="bento-card-gradient" />
            <div className="bento-card-content">
              <div className="bento-icon-wrapper">
                <span className="material-symbols-outlined">manage_search</span>
              </div>
              <h3 className="bento-title">Smart Natural Language Search</h3>
              <p className="bento-desc">
                Data discoverability at your fingertips. Use natural language queries
                to filter through complex AI-generated metadata instantly.
              </p>
            </div>
            <div className="bento-visual visual-search">
              <div className="search-bar">
                <span className="material-symbols-outlined">search</span>
                <span>search with tags</span>
              </div>
              <div className="search-results">
                <div className="search-result-line" style={{ width: '100%' }} />
                <div className="search-result-line" style={{ width: '75%' }} />
                <div className="search-result-line" style={{ width: '83%' }} />
              </div>
            </div>
          </div>

          {/* Feature 3: Zero-Trust Security (Full Width) */}
          <div className="bento-card feature-3 horizontal">
            <div className="bento-card-gradient" />
            <div className="bento-card-content">
              <div className="bento-icon-wrapper">
                <span className="material-symbols-outlined">security</span>
              </div>
              <h3 className="bento-title">Zero-Trust Infrastructure</h3>
              <p className="bento-desc">
                100% data privacy with Amazon S3 Presigned URLs and AWS Cognito
                for industry-standard multi-tenant isolation.
              </p>
            </div>
            <div className="bento-visual visual-security">
              <span className="material-symbols-outlined">enhanced_encryption</span>
            </div>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to secure your media workflow?</h2>
        <div>
          <Link to="/login" className="btn-primary lg">Get Started Now</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-links">
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;