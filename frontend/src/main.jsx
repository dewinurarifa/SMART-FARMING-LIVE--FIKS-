// index.jsx atau main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Home from './Home.jsx';
import KMeans from './KMeans.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kmeans" element={<KMeans />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
