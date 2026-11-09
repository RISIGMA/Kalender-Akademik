# 📌 BLUEPRINT & DOKUMENTASI RANCANGAN AKHIR SISTEM
## APLIKASI WEB KALENDER KEGIATAN KAMPUS (CAMPUS EVENT CALENDAR)
**Institusi:** Universitas Janabadra (UJB)  
**Mata Kuliah:** Pengembangan Aplikasi Web  
**Tanggal Penyusunan:** November 2026  

---

## 🏛️ 1. LATAR BELAKANG & TUJUAN
Sistem ini dirancang untuk menyelesaikan permasalahan nyata birokrasi dan operasional kegiatan di lingkungan kampus Universitas Janabadra:
1. **Penyebaran Informasi Terpusat:** Menghilangkan informasi kegiatan yang berserakan di media sosial/WhatsApp melalui kalender kampus interaktif.
2. **Pendaftaran Cepat Tanpa Akun (Zero Friction):** Mahasiswa & Umum tidak perlu login untuk mendaftar acara.
3. **Tertib Birokrasi Kampus:** Mencegah organisasi palsu dengan sistem perizinan berkas fisik (*hard file*) yang diverifikasi Admin Kampus.
4. **Operasional Multi-Scanner Real-Time:** Menangani antrean ratusan peserta di meja registrasi melalui banyak petugas panitia sekaligus dengan arsitektur REST API.
5. **Otomatisasi Spreadsheet & E-Sertifikat:** Menghasilkan rekap data hadir otomatis untuk LPJ dan e-sertifikat sah ber-QR.

---

## 👥 2. HAK AKSES & PERAN PENGGUNA (ACTOR ROLES)

### A. Mahasiswa & Peserta Umum (Public User)
- **Tanpa Login:** Bebas menjelajahi kalender dan mendaftar acara.
- **Pembeda Formulir Pendaftaran:**
  - **Mahasiswa:** Mengisi Nama Lengkap, Email, NIM, Program Studi, dan Asal Kampus.
  - **Peserta Umum:** Mengisi Nama Lengkap, Email, Asal Instansi/Perusahaan, dan Profesi.
  *(Catatan: Field WhatsApp ditiadakan demi ringkasnya form & privasi).*
- **Tiket & Barcode Instan:** Setelah mendaftar, langsung muncul tiket digital dengan Barcode/QR unik yang dapat disimpan/screenshot.
- **Pencarian Tiket & Download Sertifikat:** Fitur pencarian cepat via Email/NIM untuk memunculkan kembali barcode tiket atau mengunduh sertifikat PDF setelah dinyatakan hadir.

### B. Admin Sistem Kampus
- Memvalidasi perizinan proposal fisik (*hard file*) dari UKM/BEM/Himpunan.
- Menerbitkan akun resmi dan jadwal sesi untuk Penyelenggara yang sudah di-ACC.
- Mengelola master kategori kegiatan dan memantau metrik statistik kampus.

### C. Penyelenggara Utama (Ketua Panitia / Akun Resmi UKM)
- Menerima akun resmi dari Admin setelah proposal fisik disetujui.
- **Mode Pra-Event:** Mengisi detail kegiatan, jadwal mulai/selesai, kuota, lokasi, serta **mendaftarkan NIM & Nama anggota panitia** yang ditugaskan sebagai petugas scanner.
- **Mode Hari-H (Sesi 24 Jam):** Membuka analitik kehadiran, mengunduh file rekapitulasi Spreadsheet (.xlsx / .csv), dan menerbitkan sertifikat otomatis.

### D. Petugas Scanner (Staff Panitia di Meja Registrasi)
- Mahasiswa anggota panitia yang didaftarkan oleh Penyelenggara.
- **Login Kontekstual Tanpa Password:** Membuka event terkait di website saat jam acara $\rightarrow$ klik tombol **"Masuk Sebagai Petugas Scanner"** $\rightarrow$ masukkan NIM & Nama terdaftar $\rightarrow$ kamera pemindai barcode langsung aktif.
- Setiap hasil scan tercatat identitas petugasnya (*Audit Trail*).

---

## ⏱️ 3. ALUR KERJA SISTEM (LIFECYCLE FLOW)

### Fase 1: Perizinan Proposal Fisik & Penerbitan Akun
1. Panitia UKM/BEM menyerahkan proposal kegiatan fisik (*hard file*) yang sudah bertandatangan dekanat/pembina ke Admin Kampus.
2. Admin memverifikasi keabsahan berkas fisik di meja.
3. Admin membuka Panel Admin $\rightarrow$ Input data organisasi & jadwal acara $\rightarrow$ Menerbitkan akun resmi Penyelenggara.
4. Akun diserahkan ke Penyelenggara.

### Fase 2: Pengaturan Event & Petugas (Pra-Event)
1. Penyelenggara login ke sistem untuk melengkapi rincian event (deskripsi, lokasi, kuota).
2. Penyelenggara memasukkan daftar NIM & Nama anggota panitia yang bertugas di meja registrasi.
3. Event otomatis tayang di Kalender Publik Universitas Janabadra.
4. Mahasiswa & Umum mendaftar tanpa login $\rightarrow$ Memperoleh Barcode Tiket.
5. *Fitur Scanner Presensi masih terkunci* hingga jam mulai acara tiba.

### Fase 3: Sesi Presensi 24 Jam di Hari-H Acara
1. **Tepat saat waktu mulai acara tiba, sistem otomatis mengaktifkan jendela SESI 24 JAM.**
2. Tombol **"Masuk Sebagai Petugas Scanner"** di dalam event tersebut menjadi aktif.
3. 5–10 petugas panitia membuka event tersebut di HP masing-masing, mengklik tombol scanner, memasukkan NIM/Nama mereka.
4. Kamera aktif $\rightarrow$ Memindai barcode peserta di meja registrasi:
   - Data dikirim via REST API (`POST /api/attendances/scan`).
   - Sistem memvalidasi tiket, mencegah scan ganda (*anti-duplicate check-in*).
   - Data presensi otomatis masuk ke **Live Spreadsheet Presensi Event**.
   - Nama petugas pencatat otomatis tersemat di baris data.

### Fase 4: Pasca-Event & Penutupan Otomatis
1. Setelah jendela 24 jam berakhir sejak jam mulai acara:
   - Akses scanner seluruh panitia otomatis ditutup oleh sistem.
   - Data di Spreadsheet presensi terkunci permanen untuk arsip LPJ.
2. Penyelenggara mengunduh file Spreadsheet (.xlsx / .csv) untuk lampiran laporan.
3. E-Sertifikat PDF otomatis aktif dan dapat diunduh oleh peserta yang tercatat hadir melalui pencarian NIM/Email.

---

## 📊 4. STRUKTUR DATA REKAP SPREADSHEET (HASIL SCAN PRESENSI)
Setiap event memiliki tabel rekap data presensi dengan atribut:
1. `Timestamp Kehadiran` (Hari, Tanggal, Jam, Menit, Detik)
2. `Kode Tiket` (Contoh: `TKT-UJB-2026-X89A`)
3. `Tipe Peserta` (Mahasiswa / Umum)
4. `Nama Lengkap`
5. `Email`
6. `NIM` *(Khusus Mahasiswa)*
7. `Program Studi` *(Khusus Mahasiswa)*
8. `Asal Kampus / Instansi`
9. `Profesi / Jabatan` *(Khusus Umum)*
10. `Status Kehadiran` (`Hadir`)
11. `Petugas Pencatat` (Nama & NIM Panitia yang melakukan scan)

---

## 🎨 5. RANCANGAN UI / UX SPESIFIK

### A. Tampilan Kalender Mahasiswa (Split-View Responsif)
- **Sisi Kiri (Desktop) / Atas (Mobile):** Kalender bulanan nyata berlogo Universitas Janabadra.
  - Tanggal dengan kegiatan memiliki **titik indikator warna kategori berdenyut**.
  - Tanggal aktif membesar dengan kontras elegan saat disentuh.
- **Sisi Kanan (Desktop) / Bawah (Mobile):** Panel Agenda Dinamis.
  - Menampilkan kartu kegiatan sesuai tanggal yang diklik.
  - Bar progres kuota peserta (*Quota Progress Bar*).
  - Banner gradien kategori tematik (Teknologi, Seni, Seminar, Karir).

### B. Desain Tiket Digital (Boarding Pass Notch)
- Format kartu tiket dengan aksen lekukan sobekan tiket (*notch perforasi*).
- Barcode/QR Code resolusi tinggi di tengah yang kontras untuk pemindaian cepat di tempat terbuka.

### C. Antarmuka Petugas Scanner (Mobile First)
- Tampilan viewport kamera layar penuh di HP dengan frame panduan kotak scan.
- Umpan balik audio & visual saat scan berhasil (Bunyi beep & notifikasi hijau).
- Opsi pencarian cepat manual via NIM/Email jika kamera HP bermasalah.

---

## 💻 6. TEKNOLOGI & INFRASTRUKTUR SISTEM
- **Frontend:** React 18, Vite, Tailwind CSS (Mobile-First Responsive).
- **Backend:** Node.js (ES Module), Express REST API.
- **Database & ORM:** SQLite / PostgreSQL dengan Prisma ORM.
- **Keamanan & Otorisasi:** JWT, Role-Based Access Control (RBAC), Session Expiration Timer (24 Jam).
- **Pemrosesan Dokumen:** 
  - `PDFKit` untuk e-sertifikat dinamis dengan verifikasi QR.
  - `xlsx` / `csv-writer` untuk ekspor otomatis spreadsheet rekap hadir.
- **Pemindai Barcode/QR:** `html5-qrcode` & `qrcode.react`.
