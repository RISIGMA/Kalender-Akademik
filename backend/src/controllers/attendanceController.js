import prisma from '../config/db.js';
import * as xlsx from 'xlsx';

// 1. Verifikasi Staf Scanner Panitia (Kontekstual tanpa password)
export const verifyScannerStaff = async (req, res) => {
  try {
    const { eventId, nim, name } = req.body;

    if (!eventId || !nim || !name) {
      return res.status(400).json({
        success: false,
        message: 'Event ID, NIM, dan Nama petugas wajib disertakan.'
      });
    }

    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      include: { organization: true }
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event tidak ditemukan.' });
    }

    // Cek apakah event sudah masuk jendela sesi 24 jam
    // Dimulai dari startAt s/d startAt + 24 jam
    const now = new Date();
    const eventStart = new Date(event.startAt);
    const sessionEnd = new Date(eventStart.getTime() + 24 * 60 * 60 * 1000);

    // Cek jendela sesi 24 jam
    // Beri toleransi 30 menit sebelum startAt untuk persiapan panitia
    const prepStart = new Date(eventStart.getTime() - 30 * 60 * 1000);
    const isSessionActive = now >= prepStart && now <= sessionEnd;

    // Cari petugas scanner terdaftar untuk event ini
    const staff = await prisma.eventScanner.findFirst({
      where: {
        eventId: parseInt(eventId),
        nim: nim.trim()
      }
    });

    if (!staff) {
      return res.status(403).json({
        success: false,
        message: `NIM ${nim} belum didaftarkan sebagai petugas pemindai untuk kegiatan ini oleh Penyelenggara.`
      });
    }

    return res.json({
      success: true,
      message: 'Otorisasi petugas scanner panitia valid!',
      data: {
        staff: {
          id: staff.id,
          nim: staff.nim,
          name: staff.name,
          roleName: staff.roleName
        },
        event: {
          id: event.id,
          title: event.title,
          location: event.location,
          startAt: event.startAt,
          isSessionActive,
          sessionEnd
        }
      }
    });
  } catch (error) {
    console.error('verifyScannerStaff error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memverifikasi petugas scanner.' });
  }
};

// 2. Scan Presensi Tiket Barcode/QR
export const scanAttendance = async (req, res) => {
  try {
    const { ticketCode, scannerNim, scannerName } = req.body;

    if (!ticketCode) {
      return res.status(400).json({
        success: false,
        message: 'Kode barcode tiket wajib dikirimkan.'
      });
    }

    // Cari pendaftaran berdasarkan tiket
    const registration = await prisma.registration.findUnique({
      where: { ticketCode: ticketCode.trim() },
      include: {
        event: {
          include: { organization: true }
        },
        attendance: true
      }
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Tiket tidak valid atau tidak terdaftar dalam sistem Janabadra.'
      });
    }

    // Cek Jendela 24 Jam Event
    const now = new Date();
    const eventStart = new Date(registration.event.startAt);
    const sessionEnd = new Date(eventStart.getTime() + 24 * 60 * 60 * 1000);
    const prepStart = new Date(eventStart.getTime() - 60 * 60 * 1000); // 1 jam sebelum

    if (now < prepStart) {
      return res.status(400).json({
        success: false,
        message: `Sesi presensi belum dibuka. Sesi baru aktif saat jam kegiatan dimulai (${eventStart.toLocaleTimeString('id-ID')} WIB).`
      });
    }

    if (now > sessionEnd) {
      return res.status(400).json({
        success: false,
        message: 'Sesi presensi 24 jam telah berakhir. Data kehadiran telah dikunci untuk arsip LPJ.'
      });
    }

    // Cek apakah sudah pernah check-in (Anti-duplicate check-in)
    if (registration.attendance) {
      return res.status(400).json({
        success: false,
        message: `DUPLIKASI PRESENSI: Peserta ${registration.name} sudah melakukan scan presensi pada ${new Date(registration.attendance.scannedAt).toLocaleTimeString('id-ID')} WIB oleh petugas ${registration.attendance.scannedByName || 'Panitia'}.`,
        data: {
          scannedAt: registration.attendance.scannedAt,
          scannedByName: registration.attendance.scannedByName,
          participant: {
            name: registration.name,
            nim: registration.nim,
            email: registration.email,
            institution: registration.institution
          }
        }
      });
    }

    // Catat kehadiran dengan Audit Trail petugas
    const attendance = await prisma.attendance.create({
      data: {
        registrationId: registration.id,
        scannedByName: scannerName || (req.user ? req.user.name : 'Petugas Meja'),
        scannedByNim: scannerNim || (req.user ? req.user.nim : null),
        scannedBy: req.user ? req.user.id : null
      }
    });

    return res.status(201).json({
      success: true,
      message: `Presensi Berhasil! Selamat datang, ${registration.name}.`,
      data: {
        scannedAt: attendance.scannedAt,
        scannedByName: attendance.scannedByName,
        participant: {
          name: registration.name,
          nim: registration.nim,
          email: registration.email,
          prodi: registration.prodi,
          institution: registration.institution,
          participantType: registration.participantType
        },
        event: {
          id: registration.event.id,
          title: registration.event.title
        }
      }
    });
  } catch (error) {
    console.error('scanAttendance error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memproses presensi barcode.' });
  }
};

// 3. Live Data Presensi / Spreadsheet View
export const getEventAttendanceSpreadsheet = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organization: true }
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event tidak ditemukan.' });
    }

    const registrations = await prisma.registration.findMany({
      where: { eventId },
      include: { attendance: true },
      orderBy: { registeredAt: 'asc' }
    });

    const rows = registrations.map((r, idx) => ({
      no: idx + 1,
      timestampKehadiran: r.attendance ? new Date(r.attendance.scannedAt).toLocaleString('id-ID') : 'Belum Hadir',
      kodeTiket: r.ticketCode,
      tipePeserta: r.participantType === 'mahasiswa' ? 'Mahasiswa' : 'Umum',
      namaLengkap: r.name,
      email: r.email,
      nim: r.nim || '-',
      programStudi: r.prodi || '-',
      asalInstansi: r.institution || 'Universitas Janabadra',
      profesi: r.profession || '-',
      statusKehadiran: r.attendance ? 'Hadir' : 'Belum Hadir',
      petugasPencatat: r.attendance?.scannedByName ? `${r.attendance.scannedByName} (${r.attendance.scannedByNim || '-'})` : '-'
    }));

    return res.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        startAt: event.startAt,
        endAt: event.endAt,
        quota: event.quota,
        totalRegistered: registrations.length,
        totalAttended: registrations.filter(r => r.attendance).length
      },
      data: rows
    });
  } catch (error) {
    console.error('getEventAttendanceSpreadsheet error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memuat rekap presensi.' });
  }
};

// 4. Unduh File Spreadsheet (.xlsx) untuk LPJ
export const exportAttendanceExcel = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organization: true }
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event tidak ditemukan.' });
    }

    const registrations = await prisma.registration.findMany({
      where: { eventId },
      include: { attendance: true },
      orderBy: { registeredAt: 'asc' }
    });

    // Format Baris Data Sesuai Poin 4 Blueprint RANCANGAN_SISTEM_KALENDER_KAMPUS.md
    const excelData = registrations.map((r, idx) => ({
      'No': idx + 1,
      'Timestamp Kehadiran': r.attendance ? new Date(r.attendance.scannedAt).toLocaleString('id-ID') : 'Belum Hadir',
      'Kode Tiket': r.ticketCode,
      'Tipe Peserta': r.participantType === 'mahasiswa' ? 'Mahasiswa' : 'Umum',
      'Nama Lengkap': r.name,
      'Email': r.email,
      'NIM': r.nim || '-',
      'Program Studi': r.prodi || '-',
      'Asal Kampus / Instansi': r.institution || 'Universitas Janabadra',
      'Profesi / Jabatan': r.profession || '-',
      'Status Kehadiran': r.attendance ? 'Hadir' : 'Belum Hadir',
      'Petugas Pencatat (Scanner)': r.attendance?.scannedByName ? `${r.attendance.scannedByName} (${r.attendance.scannedByNim || '-'})` : '-'
    }));

    const worksheet = xlsx.utils.json_to_sheet(excelData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Presensi Acara');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const safeTitle = event.title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=LPJ_Presensi_${safeTitle}.xlsx`);

    return res.send(buffer);
  } catch (error) {
    console.error('exportAttendanceExcel error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengunduh file spreadsheet.' });
  }
};
