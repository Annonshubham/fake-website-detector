const express = require('express');
const cors = require('cors');
const db = require('./database');
const urlDetector = require('./urlDetector');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to save scan to database
function saveScan(analysis, callback) {
  const {
    url,
    domain,
    riskScore,
    riskLevel,
    isFake,
    details,
    indicators
  } = analysis;

  const stmt = db.prepare(`
    INSERT INTO scans (
      url, domain, risk_score, risk_level, is_fake,
      ssl_valid, domain_age_days, suspicious_keywords,
      redirect_count, analysis_details
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    url,
    domain,
    riskScore,
    riskLevel,
    isFake ? 1 : 0,
    details.sslValid ? 1 : 0,
    details.domainAgeDays || null,
    details.suspiciousKeywords || 0,
    details.redirectCount || 0,
    JSON.stringify(details),
    function(err) {
      if (err) {
        callback(err);
        return;
      }

      const scanId = this.lastID;

      // Save risk indicators
      if (indicators && indicators.length > 0) {
        const indicatorStmt = db.prepare(`
          INSERT INTO risk_indicators (scan_id, indicator_type, indicator_description, severity)
          VALUES (?, ?, ?, ?)
        `);

        indicators.forEach(indicator => {
          indicatorStmt.run(
            scanId,
            indicator.type,
            indicator.description,
            indicator.severity
          );
        });

        indicatorStmt.finalize();
      }

      callback(null, scanId);
    }
  );

  stmt.finalize();
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Fake Website Detector API is running' });
});

// Scan a URL
app.post('/api/scan', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log('Scanning URL:', url);

    // Perform analysis
    const analysis = await urlDetector.analyzeURL(url);

    // Save to database
    saveScan(analysis, (err, scanId) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to save scan results' });
      }

      res.json({
        success: true,
        scanId: scanId,
        result: analysis
      });
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ 
      error: 'Failed to scan URL',
      message: error.message 
    });
  }
});

// Get scan history
app.get('/api/scans', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  db.all(
    `SELECT * FROM scans ORDER BY scan_timestamp DESC LIMIT ? OFFSET ?`,
    [limit, offset],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch scan history' });
      }

      // Parse analysis_details JSON for each row
      const scans = rows.map(row => ({
        ...row,
        analysis_details: JSON.parse(row.analysis_details || '{}'),
        is_fake: row.is_fake === 1,
        ssl_valid: row.ssl_valid === 1
      }));

      res.json({ scans });
    }
  );
});

// Get specific scan details with indicators
app.get('/api/scans/:id', (req, res) => {
  const scanId = req.params.id;

  db.get(
    `SELECT * FROM scans WHERE id = ?`,
    [scanId],
    (err, scan) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch scan details' });
      }

      if (!scan) {
        return res.status(404).json({ error: 'Scan not found' });
      }

      // Get risk indicators for this scan
      db.all(
        `SELECT * FROM risk_indicators WHERE scan_id = ?`,
        [scanId],
        (err, indicators) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch indicators' });
          }

          res.json({
            scan: {
              ...scan,
              analysis_details: JSON.parse(scan.analysis_details || '{}'),
              is_fake: scan.is_fake === 1,
              ssl_valid: scan.ssl_valid === 1
            },
            indicators
          });
        }
      );
    }
  );
});

// Get statistics
app.get('/api/stats', (req, res) => {
  db.all(
    `SELECT 
      COUNT(*) as total_scans,
      SUM(CASE WHEN is_fake = 1 THEN 1 ELSE 0 END) as fake_sites,
      SUM(CASE WHEN risk_level = 'HIGH' THEN 1 ELSE 0 END) as high_risk,
      SUM(CASE WHEN risk_level = 'MEDIUM' THEN 1 ELSE 0 END) as medium_risk,
      SUM(CASE WHEN risk_level = 'LOW' THEN 1 ELSE 0 END) as low_risk,
      AVG(risk_score) as avg_risk_score
    FROM scans`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch statistics' });
      }

      res.json({ stats: rows[0] });
    }
  );
});

// Report a website
app.post('/api/report', (req, res) => {
  const { url, reason } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace('www.', '');

    db.run(
      `INSERT INTO reported_websites (url, domain, report_reason) VALUES (?, ?, ?)`,
      [url, domain, reason || 'No reason provided'],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to save report' });
        }

        res.json({
          success: true,
          message: 'Website reported successfully',
          reportId: this.lastID
        });
      }
    );
  } catch (error) {
    res.status(400).json({ error: 'Invalid URL format' });
  }
});

// Get reported websites
app.get('/api/reports', (req, res) => {
  db.all(
    `SELECT * FROM reported_websites ORDER BY reported_at DESC LIMIT 100`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch reports' });
      }

      res.json({ reports: rows });
    }
  );
});

// Delete scan history (optional cleanup)
app.delete('/api/scans/:id', (req, res) => {
  const scanId = req.params.id;

  db.run(
    `DELETE FROM scans WHERE id = ?`,
    [scanId],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to delete scan' });
      }

      // Also delete associated indicators
      db.run(`DELETE FROM risk_indicators WHERE scan_id = ?`, [scanId]);

      res.json({
        success: true,
        message: 'Scan deleted successfully'
      });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Fake Website Detector API running on port ${PORT}`);
  console.log(`📊 API Endpoints:`);
  console.log(`   - POST /api/scan - Scan a URL`);
  console.log(`   - GET  /api/scans - Get scan history`);
  console.log(`   - GET  /api/scans/:id - Get scan details`);
  console.log(`   - GET  /api/stats - Get statistics`);
  console.log(`   - POST /api/report - Report a website`);
  console.log(`   - GET  /api/reports - Get reported websites`);
});

module.exports = app;
