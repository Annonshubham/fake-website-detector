import React, { useState, useEffect } from 'react';
import { getStats } from '../services/api';
import './Statistics.css';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getStats();
      setStats(data.stats);
      setError('');
    } catch (err) {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="stats-container">
        <div className="loading">
          <div className="spinner-large"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-container">
        <div className="error-message">
          <span>⚠️</span>
          {error}
        </div>
      </div>
    );
  }

  const totalScans = stats?.total_scans || 0;
  const fakePercentage = totalScans > 0 
    ? ((stats.fake_sites / totalScans) * 100).toFixed(1) 
    : 0;

  return (
    <div className="stats-container">
      <div className="stats-header">
        <h1>📊 Statistics Dashboard</h1>
        <p>Overview of all scanned websites and risk analysis</p>
        <button onClick={loadStats} className="refresh-button">
          🔄 Refresh
        </button>
      </div>

      {totalScans === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📈</span>
          <h3>No data available yet</h3>
          <p>Start scanning URLs to see statistics</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">🔍</div>
              <div className="stat-content">
                <h3>Total Scans</h3>
                <p className="stat-number">{totalScans.toLocaleString()}</p>
                <span className="stat-label">URLs analyzed</span>
              </div>
            </div>

            <div className="stat-card danger">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <h3>Fake Sites Detected</h3>
                <p className="stat-number">{stats.fake_sites || 0}</p>
                <span className="stat-label">{fakePercentage}% of total</span>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>Safe Sites</h3>
                <p className="stat-number">{(totalScans - (stats.fake_sites || 0)).toLocaleString()}</p>
                <span className="stat-label">{(100 - fakePercentage).toFixed(1)}% of total</span>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Average Risk Score</h3>
                <p className="stat-number">{(stats.avg_risk_score || 0).toFixed(1)}</p>
                <span className="stat-label">out of 100</span>
              </div>
            </div>
          </div>

          <div className="risk-distribution">
            <h2>Risk Level Distribution</h2>
            <div className="distribution-grid">
              <div className="distribution-card high">
                <div className="distribution-header">
                  <span className="distribution-icon">🔴</span>
                  <h3>High Risk</h3>
                </div>
                <p className="distribution-number">{stats.high_risk || 0}</p>
                <div className="distribution-bar">
                  <div 
                    className="distribution-fill high"
                    style={{ 
                      width: `${totalScans > 0 ? (stats.high_risk / totalScans * 100) : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="distribution-percentage">
                  {totalScans > 0 ? ((stats.high_risk / totalScans) * 100).toFixed(1) : 0}%
                </span>
              </div>

              <div className="distribution-card medium">
                <div className="distribution-header">
                  <span className="distribution-icon">🟡</span>
                  <h3>Medium Risk</h3>
                </div>
                <p className="distribution-number">{stats.medium_risk || 0}</p>
                <div className="distribution-bar">
                  <div 
                    className="distribution-fill medium"
                    style={{ 
                      width: `${totalScans > 0 ? (stats.medium_risk / totalScans * 100) : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="distribution-percentage">
                  {totalScans > 0 ? ((stats.medium_risk / totalScans) * 100).toFixed(1) : 0}%
                </span>
              </div>

              <div className="distribution-card low">
                <div className="distribution-header">
                  <span className="distribution-icon">🟢</span>
                  <h3>Low Risk</h3>
                </div>
                <p className="distribution-number">{stats.low_risk || 0}</p>
                <div className="distribution-bar">
                  <div 
                    className="distribution-fill low"
                    style={{ 
                      width: `${totalScans > 0 ? (stats.low_risk / totalScans * 100) : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="distribution-percentage">
                  {totalScans > 0 ? ((stats.low_risk / totalScans) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="insights-section">
            <h2>💡 Insights</h2>
            <div className="insights-grid">
              <div className="insight-card">
                <h3>Detection Rate</h3>
                <p>
                  {fakePercentage}% of scanned websites were flagged as potentially fake or high-risk.
                  {parseFloat(fakePercentage) > 30 
                    ? ' This is higher than average - stay vigilant!' 
                    : ' Most sites appear legitimate.'}
                </p>
              </div>
              <div className="insight-card">
                <h3>Risk Assessment</h3>
                <p>
                  The average risk score is {(stats.avg_risk_score || 0).toFixed(1)}.
                  {stats.avg_risk_score > 50 
                    ? ' Be cautious when browsing.' 
                    : ' Overall risk level is relatively low.'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Statistics;
