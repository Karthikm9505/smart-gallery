import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import your pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SmartGallery from './pages/SmartGallery';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Authentication Page */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Core Application */}
        <Route path="/app" element={<SmartGallery />} />
        
        {/* Fallback route: If user types a random URL, send them home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;