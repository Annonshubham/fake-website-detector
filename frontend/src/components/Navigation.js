import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <span className="brand-icon">🛡️</span>
          <span className="brand-name">Fake Website Detector</span>
        </div>
        
        <ul className="nav-menu">
          <li>
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <span>🔍</span>
              Scanner
            </Link>
          </li>
          <li>
            <Link 
              to="/history" 
              className={`nav-link ${isActive('/history') ? 'active' : ''}`}
            >
              <span>📜</span>
              History
            </Link>
          </li>
          <li>
            <Link 
              to="/statistics" 
              className={`nav-link ${isActive('/statistics') ? 'active' : ''}`}
            >
              <span>📊</span>
              Statistics
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
