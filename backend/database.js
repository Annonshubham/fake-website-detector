const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'website_detector.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Scans table - stores all URL scan results
  db.run(`
    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      domain TEXT NOT NULL,
      risk_score INTEGER NOT NULL,
      risk_level TEXT NOT NULL,
      is_fake BOOLEAN NOT NULL,
      ssl_valid BOOLEAN,
      domain_age_days INTEGER,
      suspicious_keywords INTEGER,
      redirect_count INTEGER,
      analysis_details TEXT,
      scan_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Risk indicators table - stores specific flags found
  db.run(`
    CREATE TABLE IF NOT EXISTS risk_indicators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scan_id INTEGER NOT NULL,
      indicator_type TEXT NOT NULL,
      indicator_description TEXT NOT NULL,
      severity TEXT NOT NULL,
      FOREIGN KEY (scan_id) REFERENCES scans(id)
    )
  `);

  // Reported websites table - user reports
  db.run(`
    CREATE TABLE IF NOT EXISTS reported_websites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      domain TEXT NOT NULL,
      report_reason TEXT,
      reported_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database initialized successfully');
});

module.exports = db;
