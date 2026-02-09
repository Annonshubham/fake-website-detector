# 🚀 Quick Start Guide

## Getting Started in 3 Steps

### Step 1: Install Dependencies

**Option A - Using the setup script (Linux/Mac):**
```bash
chmod +x setup.sh
./setup.sh
```

**Option B - Manual installation:**
```bash
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Start the Backend

Open a terminal and run:
```bash
cd backend
npm start
```

You should see:
```
🚀 Fake Website Detector API running on port 5000
📊 API Endpoints:
   - POST /api/scan - Scan a URL
   - GET  /api/scans - Get scan history
   ...
```

### Step 3: Start the Frontend

Open a **new terminal** and run:
```bash
cd frontend
npm start
```

The application will automatically open in your browser at `http://localhost:3000`

## 🎯 First Scan

1. You'll see the Scanner page
2. Enter a URL to test (e.g., `https://google.com`)
3. Click "Scan URL"
4. View the detailed analysis!

## 📱 Try These URLs

**Safe URLs (Low Risk):**
- `https://google.com`
- `https://github.com`
- `https://amazon.com`

**Test URLs (Higher Risk - for demonstration):**
- `http://192.168.1.1` (IP address)
- `http://verify-account-login.tk` (suspicious TLD + keywords)
- `http://paypa1-secure.com` (brand impersonation)

## 🔍 Features to Explore

1. **Scanner** - Analyze any URL
2. **History** - View all your previous scans
3. **Statistics** - See analytics and trends

## ⚙️ Troubleshooting

**Backend won't start?**
- Make sure port 5000 is not in use
- Check if all dependencies installed: `cd backend && npm install`

**Frontend won't start?**
- Make sure port 3000 is not in use
- Check if all dependencies installed: `cd frontend && npm install`

**Can't connect to backend?**
- Ensure backend is running on port 5000
- Check the browser console for errors

## 📚 Learn More

See the full [README.md](README.md) for:
- Complete API documentation
- Detailed feature explanations
- Security considerations
- Deployment guides

---

**Need help?** Check the README.md or review the code comments.
