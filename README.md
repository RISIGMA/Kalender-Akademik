# 🏛️ Campus Event Calendar - Universitas Janabadra (UJB)

Aplikasi Web Manajemen dan Kalender Interaktif Kegiatan Kampus dengan arsitektur Multi-Tenant, Zero-Friction Registration, Validasi Proposal Hard-File Dekanat, Multi-Scanner Presensi Real-Time, dan Generator E-Sertifikat Sah Ber-QR.

---

## 🚀 Fitur Utama
1. **Portal Publik & Mahasiswa (Zero Friction):** Pendaftaran tanpa perlu login, kalender dinamis real-time, tiket digital *boarding pass notch*, dan self-service pencarian tiket / unduh sertifikat PDF.
2. **Rapid Scanner Panitia Meja Registrasi:** Mobile-first scanner kamera HP dengan login kontekstual tanpa password (hanya input NIM & Nama) serta audit trail petugas.
3. **Portal Penyelenggara UKM / BEM:** Dashboard metrik, upload file poster acara, pendaftaran staf scanner, serta Live Spreadsheet presensi dan ekspor Excel (`.xlsx`) untuk LPJ.
4. **Portal Admin Dekanat:** Validasi berkas fisik proposal dan fitur **1-Klik Generate Akun UKM Resmi** (menghasilkan email terstandarisasi kampus dan kupon kredensial).

---

## 🛠️ Panduan Instalasi & Menjalankan

### 1. Clone Repository
```bash
git clone https://github.com/USERNAME_ANDA/NAMA_REPO_ANDA.git
cd campus-event-calendar
```

### 2. Setup & Jalankan Backend
```bash
cd backend
npm install
cp .env.example .env
npx prisma db push
npm run db:seed
npm run dev
```
Backend berjalan di: `http://localhost:5000`

### 3. Setup & Jalankan Frontend
Buka terminal baru:
```bash
cd frontend
npm install
npm run dev
```
Frontend berjalan di: `http://localhost:5173`

---

## 🔑 Akun Demo Pengujian
* **Admin Dekanat:** `admin@janabadra.ac.id` / `password123` (di `/admin/login`)
* **Penyelenggara UKM (HMTI):** `hmti@janabadra.ac.id` / `password123` (di `/penyelenggara/login`)
* **Mahasiswa Terdaftar (Test Lookup):** NIM `21102045` (Ahmad Zaki Kurniawan)
* **Panitia Scanner Meja (Test Scan):** NIM `22102030` (Dimas Prasetyo) di `/scan/1`
