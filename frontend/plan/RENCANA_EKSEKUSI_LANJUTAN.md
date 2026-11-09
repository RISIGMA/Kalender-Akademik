# 📌 MASTER EXECUTION PLAN & ARCHITECTURE CONTINUATION
## SISTEM KALENDER KEGIATAN KAMPUS (CAMPUS EVENT CALENDAR)
**Institusi:** Universitas Janabadra (UJB) Yogyakarta  
**Mata Kuliah:** Pengembangan Aplikasi Web  
**Status Terakhir:** Multi-Tenant Architecture, 1-Click Credential Generator, Real-Time Dynamic Calendar, & Anti-Slop Editorial Design Implemented  
**Terakhir Diperbarui:** November 2026  

---

## 🎯 1. TUJUAN DOKUMEN INI
Dokumen ini dibuat sebagai **panduan utama transfer konteks bagi AI Agent atau Developer berikutnya** agar dapat langsung memahami:
1. Arsitektur sistem 3 portal yang terpisah tegas.
2. Aturan bisnis (*business rules*) & keamanan otorisasi multi-tenant.
3. Status implementasi terbaru hingga commit saat ini.
4. Panduan langkah kerja lanjutan (*backlog / future tasks*) tanpa ada kebingungan atau kode yang saling tumpang tindih.

---

## 🏛️ 2. TOPOLOGI 3 PORTAL INDEPENDEN (SEPARATED ACCESS)

Sistem ini memisahkan hak akses dan antarmuka ke dalam 3 portal mandiri:

```
[ FRONTEND CLIENT: React + Vite + Tailwind CSS ]
  ├── 1. PORTAL PUBLIK & MAHASISWA (URL: /)
  │      └── Zero Friction (Tanpa Login)
  │      └── Kalender Dinamis + Real-Time Sync (Polling 5 detik)
  │      └── Modal Detail & Poster Gambar Acara
  │      └── Tiket Barcode Digital (Boarding Pass Notch)
  │      └── Pencarian Mandiri Tiket & Unduh E-Sertifikat PDF
  │
  ├── 2. PORTAL RAPID SCANNER MEJA REGISTRASI (URL: /scan/:eventId)
  │      └── Mobile-First Camera Viewport
  │      └── Login Kontekstual Tanpa Password (Hanya input NIM & Nama Panitia)
  │      └── Audit Trail Nama Petugas & Pencegahan Scan Ganda
  │      └── Validasi Jendela Sesi 24 Jam di Hari-H
  │
  ├── 3. PORTAL PENYELENGGARA UKM / PANITIA (URL: /penyelenggara/login & /penyelenggara/dashboard)
  │      └── Login Kredensial Resmi UKM (High-Contrast Editorial Design)
  │      └── Multi-Tenant Bound: Hanya kelola acara milik organisasinya sendiri
  │      └── Upload File Poster Gambar (Multipart via Multer ke /uploads)
  │      └── Kelola Staf Scanner (NIM & Nama panitia meja)
  │      └── Live Spreadsheet Presensi Real-Time & Ekspor Excel (.xlsx) untuk LPJ
  │      └── Penerbitan E-Sertifikat Sah Ber-QR
  │      └── Tab Acara Kampus Lain: READ-ONLY (Penyelenggara lain terkunci)
  │
  └── 4. PORTAL ADMIN SISTEM KAMPUS / DEKANAT (URL: /admin/login & /admin/dashboard)
         └── Validasi Berkas Fisik Proposal Hard-File dari UKM/BEM
         └── Fitur "+ 1-KLIK GENERATE AKUN UKM RESMI":
             Otomatis menerbitkan email format kampus & password kuat, menghasilkan
             Kupon/Slip Kredensial untuk disalin/dicetak ke ketua panitia.
         └── Pengawasan Metrik Seluruh Kampus
```

---

## ⚙️ 3. REKAP TEKNIS & INTEGRASI TERKINI

### A. Backend (Node.js + Express + Prisma + SQLite)
* **Entrypoint Server:** [`backend/src/server.js`](file:///C:/Users/User/campus-event-calendar/backend/src/server.js)
  * Port: `5000` (disajikan dengan CORS ke `http://localhost:5173`).
  * Static Directory: `/uploads` untuk menyajikan file poster gambar.
* **Routing API:** [`backend/src/routes/api.js`](file:///C:/Users/User/campus-event-calendar/backend/src/routes/api.js)
  * `POST /api/auth/login` & `POST /api/auth/register` (JWT auth token).
  * `GET /api/events` & `GET /api/events/:id` (Real-time polling & detail).
  * `POST /api/events` (Mendukung `uploadPoster.single('poster')` Multer).
  * `DELETE /api/events/:id` (Multi-tenant check: hanya pemilik organisasi yang berhak hapus).
  * `POST /api/events/:id/register-public` (Pendaftaran publik mahasiswa/umum tanpa login).
  * `GET /api/tickets/lookup` (Pencarian tiket mandiri via NIM/Email).
  * `POST /api/attendances/verify-scanner` (Validasi panitia scanner kontekstual tanpa password).
  * `POST /api/attendances/scan` (Validasi tiket, anti-duplikasi, & audit trail scanner).
  * `GET /api/events/:eventId/spreadsheet` (Live data kehadiran).
  * `GET /api/events/:eventId/export-excel` (Download file `.xlsx` untuk LPJ via `xlsx`).
  * `POST /api/admin/generate-organizer` (1-Klik Generate Akun UKM Resmi).
  * `GET /api/certificates/public/:registrationId/download` (Download PDF e-sertifikat sah via `pdfkit` + QR verification).

### B. Frontend (React 19 + Tailwind CSS + React Router DOM)
* **Routing Terpusat:** [`frontend/src/App.jsx`](file:///C:/Users/User/campus-event-calendar/frontend/src/App.jsx)
* **Halaman Utama Publik:** [`frontend/src/pages/PublicPortal.jsx`](file:///C:/Users/User/campus-event-calendar/frontend/src/pages/PublicPortal.jsx)
  * Kalender murni dinamis berbasis matematika tanggal `new Date(year, month)`.
  * Hari Ini (5 Nov 2026): Blok hitam solid `bg-[#0E0F11] text-white`.
  * Tanggal beragenda: Tanda titik oranye `bg-[#EA580C]` (tanpa blok hitam).
  * Tanggal difilter: Blok oranye aktif `bg-[#EA580C] text-white`.
  * Modal Poster & Detail Acara: Menampilkan gambar poster dari server/URL + tombol aksi daftar instan.
* **Halaman Penyelenggara UKM:**
  * Login: [`frontend/src/pages/OrganizerLogin.jsx`](file:///C:/Users/User/campus-event-calendar/frontend/src/pages/OrganizerLogin.jsx)
  * Workspace: [`frontend/src/pages/OrganizerWorkspace.jsx`](file:///C:/Users/User/campus-event-calendar/frontend/src/pages/OrganizerWorkspace.jsx)
* **Halaman Admin Dekanat:**
  * Login: [`frontend/src/pages/AdminLogin.jsx`](file:///C:/Users/User/campus-event-calendar/frontend/src/pages/AdminLogin.jsx)
  * Workspace: [`frontend/src/pages/AdminWorkspace.jsx`](file:///C:/Users/User/campus-event-calendar/frontend/src/pages/AdminWorkspace.jsx)
* **Halaman Pemindai HP Panitia:** [`frontend/src/pages/QuickScannerPage.jsx`](file:///C:/Users/User/campus-event-calendar/frontend/src/pages/QuickScannerPage.jsx)

---

## 📋 4. DATA SEEDING & KREDENSIAL DEMO

Jika database di-reset atau di-seed ulang via `npm run db:seed`:
1. **Admin Kampus:**
   * Email: `admin@janabadra.ac.id`
   * Password: `password123`
2. **Penyelenggara UKM 1 (HMTI):**
   * Email: `hmti@janabadra.ac.id`
   * Password: `password123`
3. **Penyelenggara UKM 2 (BEM):**
   * Email: `bem@janabadra.ac.id`
   * Password: `password123`
4. **Mahasiswa Terdaftar (Test Lookup Tiket/Sertifikat):**
   * NIM: `21102045` (Ahmad Zaki Kurniawan)
   * Status: Hadir & E-Sertifikat terbit.
5. **Panitia Scanner Meja (Test Rapid Scan di `/scan/1`):**
   * NIM: `22102030`
   * Nama: `Dimas Prasetyo`

---

## 🚀 5. ROADMAP & LANGKAH PENGEMBANGAN BERIKUTNYA (NEXT STEPS)

Bagi AI Agent atau Developer yang melanjutkan projek ini, berikut adalah daftar task yang siap dieksekusi:

### Prioritas 1: Integrasi Kamera Hardware Langsung di `QuickScannerPage.jsx`
* **Kondisi Saat Ini:** Sudah ada viewport bidik kamera dan form input barcode instan (mendukung scanner barcode gun / input keyboard HP).
* **Next Task:** Pasang listener library `html5-qrcode` yang sudah terinstall di `package.json` untuk mengaitkan *real video stream webcam / kamera belakang smartphone* secara otomatis saat izin kamera diizinkan oleh browser.

### Prioritas 2: Notifikasi & Reminder Email (Opsional / Production Ready)
* Tambahkan integrasi Nodemailer pada endpoint pendaftaran publik agar tiket barcode otomatis terkirim salinannya ke email peserta selain muncul di layar.

### Prioritas 3: Pengayaan Form Profil Organisasi di Organizer Workspace
* Tambahkan fitur ganti password mandiri bagi penyelenggara dan upload logo resmi UKM untuk ditampilkan pada header sertifikat PDF.

---

## 🛠️ 6. CARA MENJALANKAN LINGKUNGAN PENGEMBANGAN

1. **Jalankan Backend Server:**
   ```powershell
   cd C:\Users\User\campus-event-calendar\backend
   npm run dev
   ```
   *(Pastikan port 5000 tidak terblokir. Database SQLite dev.db berada di backend/prisma/dev.db)*

2. **Jalankan Frontend Vite Client:**
   ```powershell
   cd C:\Users\User\campus-event-calendar\frontend
   npm run dev
   ```
   *(Akses `http://localhost:5173`)*

3. **Verifikasi Build:**
   ```powershell
   cd C:\Users\User\campus-event-calendar\frontend
   npm run build
   ```
