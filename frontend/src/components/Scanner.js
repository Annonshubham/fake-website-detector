import React, { useState } from 'react';
import { scanURL } from '../services/api';
import './Scanner.css';

const Scanner = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await scanURL(url);
      setResult(response.result);
    } catch (err) {
      setError(err.error || 'Failed to scan URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch(level) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRiskGradient = (score) => {
    if (score >= 70) return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    if (score >= 40) return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  };

  return (
    <div className="scanner-container">
      <div className="scanner-header">
        <h1>🛡️ Fake Website Detector</h1>
        <p>Analyze URLs for potential security threats and phishing attempts</p>
      </div>

      <form onSubmit={handleScan} className="scanner-form">
        <div className="input-group">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to scan (e.g., https://example.com)"
            className="url-input"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="scan-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Scanning...
              </>
            ) : (
              <>
                <span>🔍</span>
                Scan URL
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-message">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {result && (
        <div className="result-container">
          <div className="result-header" style={{ background: getRiskGradient(result.riskScore) }}>
            <div className="risk-score">
              <div className="score-circle">
                <svg width="120" height="120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8"/>
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="54" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="8"
                    strokeDasharray={`${result.riskScore * 3.39} 339`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="score-text">
                  <span className="score-number">{result.riskScore}</span>
                  <span className="score-label">Risk Score</span>
                </div>
              </div>
            </div>
            <div className="risk-info">
              <h2>{result.isFake ? '⚠️ High Risk - Likely Fake' : '✅ Analysis Complete'}</h2>
              <div className="risk-badge" style={{ background: getRiskColor(result.riskLevel) }}>
                {result.riskLevel} RISK
              </div>
              <p className="analyzed-url">{result.url}</p>
            </div>
          </div>

          <div className="result-body">
            <div className="details-section">
              <h3>📊 Analysis Summary</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Domain:</span>
                  <span className="detail-value">{result.domain}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">SSL/HTTPS:</span>
                  <span className="detail-value">
                    {result.details.sslValid ? '✅ Secure' : '❌ Not Secure'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Redirects:</span>
                  <span className="detail-value">{result.details.redirectCount || 0}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Suspicious Keywords:</span>
                  <span className="detail-value">{result.details.suspiciousKeywords || 0}</span>
                </div>
              </div>
            </div>

            {result.indicators && result.indicators.length > 0 && (
              <div className="indicators-section">
                <h3>🚩 Risk Indicators Found</h3>
                <div className="indicators-list">
                  {result.indicators.map((indicator, index) => (
                    <div 
                      key={index} 
                      className={`indicator-item severity-${indicator.severity.toLowerCase()}`}
                    >
                      <div className="indicator-header">
                        <span className="indicator-type">{indicator.type.replace(/_/g, ' ')}</span>
                        <span className={`severity-badge ${indicator.severity.toLowerCase()}`}>
                          {indicator.severity}
                        </span>
                      </div>
                      <p className="indicator-description">{indicator.description}</p>
                      {indicator.impact && (
                        <span className="indicator-impact">
                          Impact: {indicator.impact > 0 ? '+' : ''}{indicator.impact} points
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="recommendation-section">
              <h3>💡 Recommendation</h3>
              <div className={`recommendation ${result.isFake ? 'danger' : 'safe'}`}>
                {result.riskScore >= 70 ? (
                  <>
                    <strong>⚠️ DO NOT PROCEED</strong>
                    <p>This website shows multiple signs of being a fake or phishing site. Do not enter any personal information, credentials, or payment details.</p>
                  </>
                ) : result.riskScore >= 40 ? (
                  <>
                    <strong>⚠️ PROCEED WITH CAUTION</strong>
                    <p>This website has some suspicious characteristics. Verify the domain is correct and be cautious about sharing sensitive information.</p>
                  </>
                ) : (
                  <>
                    <strong>✅ APPEARS SAFE</strong>
                    <p>This website shows minimal risk indicators. However, always remain vigilant when sharing personal information online.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;
