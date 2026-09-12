import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

// 1. I-import yung ginawa nating DownloadPDF component
import DownloadPDF from './DownloadPDF.jsx'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* 2. Kapag ini-scan ang QR, dito mapupunta */}
        <Route path="/download/:officeKey" element={<DownloadPDF />} />
        
        {/* 3. Kapag normal na gamit sa Kiosk, yung App mo ang lalabas */}
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);