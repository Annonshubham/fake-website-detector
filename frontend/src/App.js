import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Scanner from './components/Scanner';
import History from './components/History';
import Statistics from './components/Statistics';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Scanner />} />
            <Route path="/history" element={<History />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>🛡️ Fake Website Detector - Stay Safe Online</p>
          <p className="footer-note">
            Always verify URLs before entering personal information
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
