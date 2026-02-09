import React, { useState, useEffect } from 'react';
import { getScanHistory, deleteScan } from '../services/api';
import './History.css';

const History = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getScanHistory(50);
      setScans(data.scans);
      setError('');
    } catch (err) {
      setError('Failed to load scan history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scanId) => {
    if (!window.confirm('Are you sure you want to delete this scan?')) {
      return;
    }

    try {
      await deleteScan(scanId);
      setScans(scans.filter(scan => scan.id !== scanId));
    } catch (err) {
      alert('Failed to delete scan');
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

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading">
          <div className="spinner-large"></div>
          <p>Loading scan history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>📜 Scan History</h1>
        <p>View all previous URL scans and their results</p>
        <button onClick={loadHistory} className="refresh-button">
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {scans.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>No scans yet</h3>
          <p>Start scanning URLs to see your history here</p>
        </div>
      ) : (
        <div className="history-grid">
          {scans.map((scan) => (
            <div key={scan.id} className="history-card">
              <div className="card-header">
                <div className="risk-indicator" style={{ background: getRiskColor(scan.risk_level) }}>
                  <span className="risk-score-small">{scan.risk_score}</span>
                  <span className="risk-level-small">{scan.risk_level}</span>
                </div>
                <button 
                  onClick={() => handleDelete(scan.id)} 
                  className="delete-button"
                  title="Delete scan"
                >
                  🗑️
                </button>
              </div>

              <div className="card-body">
                <div className="scan-status">
                  {scan.is_fake ? (
                    <span className="status-badge danger">⚠️ Likely Fake</span>
                  ) : (
                    <span className="status-badge safe">✅ Appears Safe</span>
                  )}
                </div>

                <div className="scan-url">
                  <strong>URL:</strong>
                  <a href={scan.url} target="_blank" rel="noopener noreferrer" className="url-link">
                    {scan.url}
                  </a>
                </div>

                <div className="scan-domain">
                  <strong>Domain:</strong> {scan.domain}
                </div>

                <div className="scan-details">
                  <div className="detail-badge">
                    {scan.ssl_valid ? '🔒 SSL' : '🔓 No SSL'}
                  </div>
                  <div className="detail-badge">
                    🔄 {scan.redirect_count} redirects
                  </div>
                  <div className="detail-badge">
                    🚩 {scan.suspicious_keywords} keywords
                  </div>
                </div>

                <div className="scan-timestamp">
                  <small>Scanned: {formatDate(scan.scan_timestamp)}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
