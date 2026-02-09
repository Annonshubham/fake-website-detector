# 🛡️ Fake Website Detector

A full-stack web application for detecting fake websites and phishing attempts. This system analyzes URLs using multiple security indicators and provides a detailed risk assessment.

## 🌟 Features

### Core Features
- **URL Analysis**: Comprehensive scanning of URLs for security threats
- **Risk Scoring**: 0-100 risk score based on multiple indicators
- **Real-time Detection**: Instant analysis with detailed results
- **Scan History**: Track all previously scanned URLs
- **Statistics Dashboard**: Analytics and insights on scanned websites
- **SSL Verification**: Check for HTTPS encryption
- **Domain Analysis**: Evaluate domain characteristics and patterns
- **Redirect Detection**: Identify suspicious redirect chains
- **Keyword Detection**: Flag phishing-related keywords

### Security Checks
- ✅ SSL/HTTPS validation
- ✅ Suspicious TLD detection
- ✅ Brand impersonation detection
- ✅ IP address URL detection
- ✅ Excessive hyphens/numbers in domain
- ✅ Suspicious keyword analysis
- ✅ Multiple redirect detection
- ✅ URL structure anomalies
- ✅ Port number validation

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Custom styling with gradients and animations

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **SQLite3** - Lightweight database
- **Axios** - External URL requests

## 📁 Project Structure

```
fake-website-detector/
├── backend/
│   ├── server.js           # Express server & API routes
│   ├── database.js         # SQLite database setup
│   ├── urlDetector.js      # URL analysis logic
│   ├── package.json        # Backend dependencies
│   └── website_detector.db # SQLite database (auto-generated)
│
├── frontend/
│   ├── public/
│   │   └── index.html      # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Scanner.js       # URL scanning interface
│   │   │   ├── Scanner.css
│   │   │   ├── History.js       # Scan history view
│   │   │   ├── History.css
│   │   │   ├── Statistics.js    # Analytics dashboard
│   │   │   ├── Statistics.css
│   │   │   ├── Navigation.js    # Navigation bar
│   │   │   └── Navigation.css
│   │   ├── services/
│   │   │   └── api.js           # API service layer
│   │   ├── App.js               # Main app component
│   │   ├── App.css
│   │   ├── index.js             # Entry point
│   │   └── index.css
│   └── package.json        # Frontend dependencies
│
└── README.md               # This file
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm start
```

The backend API will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## 📡 API Endpoints

### Scan URLs
- **POST** `/api/scan`
  - Body: `{ "url": "https://example.com" }`
  - Returns: Detailed analysis with risk score

### Get Scan History
- **GET** `/api/scans?limit=50&offset=0`
  - Returns: List of previous scans

### Get Scan Details
- **GET** `/api/scans/:id`
  - Returns: Detailed scan with risk indicators

### Get Statistics
- **GET** `/api/stats`
  - Returns: Aggregate statistics

### Report Website
- **POST** `/api/report`
  - Body: `{ "url": "https://example.com", "reason": "Phishing attempt" }`

### Get Reports
- **GET** `/api/reports`
  - Returns: List of reported websites

### Delete Scan
- **DELETE** `/api/scans/:id`
  - Deletes a scan from history

## 🎯 Usage Guide

### Scanning a URL

1. Navigate to the Scanner page (home)
2. Enter a complete URL (e.g., `https://example.com`)
3. Click "Scan URL"
4. Review the detailed analysis:
   - Risk score (0-100)
   - Risk level (LOW, MEDIUM, HIGH)
   - SSL/HTTPS status
   - Number of redirects
   - Suspicious keywords found
   - List of risk indicators
   - Safety recommendation

### Viewing History

1. Click "History" in the navigation
2. Browse all previously scanned URLs
3. View quick overview of each scan
4. Delete unwanted scan records

### Checking Statistics

1. Click "Statistics" in the navigation
2. View aggregate data:
   - Total scans performed
   - Fake sites detected
   - Safe sites found
   - Average risk score
   - Risk level distribution
   - Detection insights

## 🔍 How It Works

### URL Analysis Process

1. **URL Validation**: Ensures the URL is properly formatted
2. **SSL Check**: Verifies HTTPS encryption
3. **Domain Analysis**: 
   - Checks against whitelist of legitimate domains
   - Detects suspicious TLDs (.tk, .ml, .ga, etc.)
   - Analyzes domain length and structure
   - Counts hyphens and numbers
4. **Pattern Detection**:
   - Scans for phishing keywords
   - Detects brand impersonation attempts
5. **Structure Analysis**:
   - Checks for @ symbols
   - Detects IP addresses in URLs
   - Validates port numbers
   - Counts subdomains
6. **Redirect Analysis**: Tests for excessive redirects
7. **Risk Calculation**: Aggregates all indicators into a final score

### Risk Scoring

- **0-39**: LOW risk - Website appears safe
- **40-69**: MEDIUM risk - Proceed with caution
- **70-100**: HIGH risk - Likely fake/phishing site

Each security indicator adds points to the risk score based on severity.

## 🎨 Features Overview

### Scanner Component
- Real-time URL analysis
- Beautiful risk score visualization with circular progress
- Color-coded risk levels
- Detailed indicator breakdown
- Actionable recommendations

### History Component
- Card-based layout of all scans
- Quick status overview
- Delete functionality
- Timestamp tracking
- Filtering options

### Statistics Component
- Beautiful data visualizations
- Risk distribution charts
- Key performance indicators
- Insight generation
- Trend analysis

## 🛡️ Security Considerations

This tool is designed for educational purposes and basic phishing detection. It should not be the only security measure used. Always:

- Keep your browser and operating system updated
- Use reputable antivirus software
- Enable two-factor authentication
- Verify URLs manually when in doubt
- Never enter credentials on suspicious sites

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

For production, update this to your production API URL.

### Database

The SQLite database is automatically created when the backend starts. To reset the database:

```bash
cd backend
rm website_detector.db
npm start
```

## 📊 Database Schema

### scans table
- id (PRIMARY KEY)
- url
- domain
- risk_score
- risk_level
- is_fake
- ssl_valid
- domain_age_days
- suspicious_keywords
- redirect_count
- analysis_details (JSON)
- scan_timestamp

### risk_indicators table
- id (PRIMARY KEY)
- scan_id (FOREIGN KEY)
- indicator_type
- indicator_description
- severity

### reported_websites table
- id (PRIMARY KEY)
- url
- domain
- report_reason
- reported_at

## 🚀 Deployment

### Backend Deployment
1. Set environment variable: `PORT=5000`
2. Use a process manager like PM2
3. Configure CORS for your frontend domain

### Frontend Deployment
1. Update `REACT_APP_API_URL` in `.env`
2. Build the production bundle:
   ```bash
   npm run build
   ```
3. Deploy the `build` folder to your hosting service

## 🤝 Contributing

This is an educational project. Feel free to fork and enhance!

## 📝 License

MIT License - Feel free to use this project for learning and development.

## ⚠️ Disclaimer

This tool provides basic website analysis and should not be solely relied upon for security decisions. Always use multiple verification methods and exercise caution when browsing unfamiliar websites.

## 🎓 Educational Purpose

This project demonstrates:
- Full-stack web development
- RESTful API design
- Database integration
- Real-time data analysis
- Modern React patterns
- Security awareness

---

**Built with ❤️ for safer web browsing**
