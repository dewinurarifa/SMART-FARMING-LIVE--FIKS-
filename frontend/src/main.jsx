// File: main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import Login from './Login.jsx';
import Home from './Home.jsx';
import KMeans from './KMeans.jsx';
import Akurasi from './Akurasi.jsx';

// Komponen untuk melindungi route berdasarkan role
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  return token && allowedRoles.includes(role) ? children : <Navigate to="/login" replace />;
};

// PENTING: `createRoot(...).render(...)` harus membungkus semua komponen React
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={['petani']}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kmeans"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <KMeans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/akurasi"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Akurasi />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
