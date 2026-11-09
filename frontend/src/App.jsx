import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicPortal } from './pages/PublicPortal';
import { OrganizerLogin } from './pages/OrganizerLogin';
import { OrganizerWorkspace } from './pages/OrganizerWorkspace';
import { AdminLogin } from './pages/AdminLogin';
import { AdminWorkspace } from './pages/AdminWorkspace';
import { QuickScannerPage } from './pages/QuickScannerPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Sisi Mahasiswa & Umum (Bebas Akses Tanpa Login) */}
        <Route path="/" element={<PublicPortal />} />
        
        {/* 2. Rapid Scanner Panitia Meja Registrasi (Kamera HP) */}
        <Route path="/scan/:eventId" element={<QuickScannerPage />} />

        {/* 3. Sisi Penyelenggara UKM / BEM (Wajib Login & Desain Premium) */}
        <Route path="/penyelenggara/login" element={<OrganizerLogin />} />
        <Route path="/penyelenggara/dashboard" element={<OrganizerWorkspace />} />
        <Route path="/penyelenggara" element={<Navigate to="/penyelenggara/dashboard" replace />} />

        {/* 4. Sisi Admin Sistem Kampus / Dekanat (Wajib Login) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminWorkspace />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Fallback ke beranda */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
