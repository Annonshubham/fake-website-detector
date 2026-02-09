# 🏗️ System Architecture

## Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│                     http://localhost:3000                    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ HTTP Requests
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   REACT FRONTEND                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐    │
│  │  Scanner   │  │  History   │  │    Statistics      │    │
│  │ Component  │  │ Component  │  │    Component       │    │
│  └─────┬──────┘  └─────┬──────┘  └─────────┬──────────┘    │
│        │                │                    │                │
│        └────────────────┴────────────────────┘                │
│                         │                                     │
│                  ┌──────▼───────┐                            │
│                  │  API Service │                            │
│                  │  (Axios)     │                            │
│                  └──────┬───────┘                            │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          │ REST API Calls
                          │ (JSON)
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   EXPRESS BACKEND                            │
│                  http://localhost:5000                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Routes (server.js)                  │   │
│  │  POST /api/scan       │ GET /api/scans              │   │
│  │  GET /api/stats       │ POST /api/report            │   │
│  │  DELETE /api/scans/:id│ GET /api/reports            │   │
│  └────────────┬──────────────────────┬──────────────────┘   │
│               │                      │                       │
│     ┌─────────▼─────────┐  ┌────────▼────────┐             │
│     │   URL Detector    │  │   Database      │             │
│     │  (urlDetector.js) │  │  (database.js)  │             │
│     │                   │  │                 │             │
│     │ • SSL Check       │  │  ┌───────────┐  │             │
│     │ • Domain Analysis │  │  │   Scans   │  │             │
│     │ • Pattern Match   │  │  │   Table   │  │             │
│     │ • Risk Scoring    │  │  └───────────┘  │             │
│     │ • Redirect Check  │  │  ┌───────────┐  │             │
│     │                   │  │  │ Indicators│  │             │
│     └───────────────────┘  │  │   Table   │  │             │
│                            │  └───────────┘  │             │
│                            │  ┌───────────┐  │             │
│                            │  │  Reports  │  │             │
│                            │  │   Table   │  │             │
│                            │  └───────────┘  │             │
│                            └─────────────────┘             │
└─────────────────────────────────────────────────────────────┘
                                    │
                                    │
                          ┌─────────▼─────────┐
                          │  SQLite Database  │
                          │ website_detector  │
                          │       .db         │
                          └───────────────────┘
```

## Data Flow

### 1. URL Scan Flow

```
User Input (URL)
    │
    ▼
Scanner Component
    │
    ▼
API Service (POST /api/scan)
    │
    ▼
Express Server
    │
    ▼
URL Detector Module
    │
    ├──► Check SSL/HTTPS
    ├──► Analyze Domain
    ├──► Detect Patterns
    ├──► Check Redirects
    ├──► Calculate Risk Score
    │
    ▼
Analysis Result
    │
    ▼
Save to Database
    │
    ▼
Return JSON Response
    │
    ▼
Display to User
```

### 2. History Retrieval Flow

```
User Clicks History
    │
    ▼
History Component
    │
    ▼
API Service (GET /api/scans)
    │
    ▼
Express Server
    │
    ▼
Query Database
    │
    ▼
Return Scan Records
    │
    ▼
Format & Display
```

## Technology Stack Details

### Frontend Technologies
- **React 18.2.0** - UI Framework
- **React Router 6.20.0** - Routing
- **Axios 1.6.0** - HTTP Client
- **CSS3** - Styling

### Backend Technologies
- **Node.js** - Runtime
- **Express 4.18.2** - Web Framework
- **SQLite3 5.1.6** - Database
- **Axios 1.6.0** - External Requests
- **url-parse 1.5.10** - URL Parsing

### Database Schema

```sql
-- Scans Table
scans
├── id (INTEGER, PRIMARY KEY)
├── url (TEXT)
├── domain (TEXT)
├── risk_score (INTEGER)
├── risk_level (TEXT)
├── is_fake (BOOLEAN)
├── ssl_valid (BOOLEAN)
├── domain_age_days (INTEGER)
├── suspicious_keywords (INTEGER)
├── redirect_count (INTEGER)
├── analysis_details (TEXT/JSON)
└── scan_timestamp (DATETIME)

-- Risk Indicators Table
risk_indicators
├── id (INTEGER, PRIMARY KEY)
├── scan_id (INTEGER, FOREIGN KEY)
├── indicator_type (TEXT)
├── indicator_description (TEXT)
└── severity (TEXT)

-- Reported Websites Table
reported_websites
├── id (INTEGER, PRIMARY KEY)
├── url (TEXT)
├── domain (TEXT)
├── report_reason (TEXT)
└── reported_at (DATETIME)
```

## Component Hierarchy

```
App
 ├── Navigation
 └── Routes
      ├── Scanner (/)
      │    └── Scan Result Display
      ├── History (/history)
      │    └── History Card Grid
      └── Statistics (/statistics)
           ├── Stats Grid
           ├── Risk Distribution
           └── Insights Section
```

## Security Analysis Process

```
Input URL
    │
    ▼
┌───────────────────────────┐
│   Validation & Parsing    │
└───────────┬───────────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌────────┐    ┌──────────┐
│  SSL   │    │  Domain  │
│ Check  │    │ Analysis │
└────┬───┘    └─────┬────┘
     │              │
     │    ┌─────────┴──────────┐
     │    │                    │
     ▼    ▼                    ▼
┌──────────────┐        ┌────────────┐
│   Pattern    │        │  Redirect  │
│  Detection   │        │   Check    │
└──────┬───────┘        └─────┬──────┘
       │                      │
       └──────────┬───────────┘
                  │
                  ▼
         ┌────────────────┐
         │  Risk Scoring  │
         │  Aggregation   │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │ Final Analysis │
         │   & Report     │
         └────────────────┘
```

## Deployment Architecture

### Development
```
Frontend Dev Server (localhost:3000)
           │
           │ Proxy to
           ▼
Backend Dev Server (localhost:5000)
           │
           ▼
SQLite Database (local file)
```

### Production
```
Static Frontend (CDN/Web Server)
           │
           │ HTTPS
           ▼
Backend API (Cloud Server/VPS)
           │
           ▼
SQLite Database (persistent storage)
```

## Key Design Decisions

1. **SQLite for Database**: Lightweight, no setup required, perfect for learning
2. **React for Frontend**: Modern, component-based, excellent developer experience
3. **Express for Backend**: Minimal, flexible, widely adopted
4. **REST API**: Standard, well-understood, easy to test
5. **Component Architecture**: Reusable, maintainable, scalable

## Performance Considerations

- Frontend: React's virtual DOM for efficient updates
- Backend: Async/await for non-blocking operations
- Database: Indexed columns for fast queries
- API: Pagination support for large datasets
- Caching: Could be added for repeated URL scans

## Future Enhancements

1. **Redis Cache**: For faster repeated scans
2. **PostgreSQL**: For production deployments
3. **User Authentication**: Personal scan history
4. **Machine Learning**: Advanced pattern detection
5. **Real-time Updates**: WebSocket support
6. **API Rate Limiting**: Prevent abuse
7. **Advanced Analytics**: More detailed statistics
8. **Export Features**: PDF/CSV reports
