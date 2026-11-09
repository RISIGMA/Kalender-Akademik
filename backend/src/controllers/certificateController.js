import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import prisma from '../config/db.js';

// 1. Terbitkan Sertifikat untuk semua yang hadir
export const issueCertificates = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const userId = req.user.id;

    const org = await prisma.organization.findUnique({ where: { userId } });
    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event tidak ditemukan.' });
    }

    if (req.user.role !== 'admin' && event.organizationId !== org?.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    // Ambil peserta yang sudah hadir tapi belum punya sertifikat
    const attendedRegs = await prisma.registration.findMany({
      where: {
        eventId,
        attendance: { isNot: null },
        certificate: null
      }
    });

    let count = 0;
    for (const reg of attendedRegs) {
      const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
      const certNumber = `CERT/2026/UJB-EVT${eventId}/${reg.id}`;
      const verifyCode = `VRF-UJB-${eventId}-${reg.id}-${randomHex}`;

      await prisma.certificate.create({
        data: {
          registrationId: reg.id,
          certNumber,
          verifyCode
        }
      });
      count++;
    }

    return res.json({
      success: true,
      message: `Berhasil menerbitkan ${count} e-sertifikat baru untuk peserta yang hadir.`
    });
  } catch (error) {
    console.error('issueCertificates error:', error);
    return res.status(500).json({ success: false, message: 'Gagal menerbitkan sertifikat.' });
  }
};

// 2. Download Sertifikat Publik (Berdasarkan ID Registrasi)
export const downloadCertificatePublic = async (req, res) => {
  try {
    const registrationId = parseInt(req.params.registrationId);

    const reg = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        event: {
          include: { organization: true }
        },
        attendance: true,
        certificate: true
      }
    });

    if (!reg) {
      return res.status(404).json({ success: false, message: 'Data pendaftaran tidak ditemukan.' });
    }

    if (!reg.attendance) {
      return res.status(400).json({
        success: false,
        message: 'E-Sertifikat hanya dapat diunduh jika peserta telah dinyatakan HADIR di meja registrasi oleh panitia.'
      });
    }

    // Terbitkan sertifikat otomatis jika belum terbit
    let cert = reg.certificate;
    if (!cert) {
      const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
      const certNumber = `CERT/2026/UJB-EVT${reg.eventId}/${reg.id}`;
      const verifyCode = `VRF-UJB-${reg.eventId}-${reg.id}-${randomHex}`;

      cert = await prisma.certificate.create({
        data: {
          registrationId: reg.id,
          certNumber,
          verifyCode
        }
      });
    }

    // Buat QR Code Verifikasi URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/verify/${cert.verifyCode}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 120, margin: 1 });
    const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

    // Generate PDF A4 Landscape
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 40
    });

    const safeName = reg.name.replace(/[^a-zA-Z0-9]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Sertifikat_UJB_${safeName}.pdf`);
    doc.pipe(res);

    // Border Ganda Elegan
    doc.rect(20, 20, 801.89, 555.28).lineWidth(3).strokeColor('#1E3A8A').stroke();
    doc.rect(26, 26, 789.89, 543.28).lineWidth(1).strokeColor('#F59E0B').stroke();

    // Header Institusi Janabadra
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#1E3A8A').text('UNIVERSITAS JANABADRA (UJB) YOGYAKARTA', 0, 65, { align: 'center' });
    doc.fontSize(10).font('Helvetica').fillColor('#64748B').text('SISTEM INFORMASI KALENDER & MANAJEMEN KEGIATAN KAMPUS', 0, 85, { align: 'center' });

    doc.moveDown(1.5);
    doc.fontSize(26).font('Helvetica-Bold').fillColor('#0F172A').text('SERTIFIKAT KEIKUTSERTAAN', { align: 'center' });
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1E3A8A').text(`Nomor Dokumen: ${cert.certNumber}`, { align: 'center' });

    doc.moveDown(1.8);
    doc.fontSize(12).font('Helvetica').fillColor('#334155').text('Diberikan dengan hormat dan apresiasi setinggi-tingginya kepada:', { align: 'center' });

    doc.moveDown(0.6);
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#1E3A8A').text(reg.name.toUpperCase(), { align: 'center' });
    if (reg.nim) {
      doc.fontSize(11).font('Helvetica').fillColor('#475569').text(`NIM: ${reg.nim} | Program Studi: ${reg.prodi || 'Informatika'} - ${reg.institution || 'Universitas Janabadra'}`, { align: 'center' });
    } else {
      doc.fontSize(11).font('Helvetica').fillColor('#475569').text(`Asal Instansi: ${reg.institution || '-'} | Profesi: ${reg.profession || 'Umum'}`, { align: 'center' });
    }

    doc.moveDown(1.2);
    doc.fontSize(12).font('Helvetica').fillColor('#334155').text('Atas partisipasi aktif dan kehadirannya sebagai PESERTA dalam acara:', { align: 'center' });

    doc.moveDown(0.4);
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#0F172A').text(`"${reg.event.title}"`, { align: 'center' });

    doc.moveDown(0.4);
    const dateFormatted = new Date(reg.event.startAt).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.fontSize(11).font('Helvetica').fillColor('#475569').text(`Diselenggarakan pada ${dateFormatted} oleh ${reg.event.organization.name}`, { align: 'center' });

    // Footer: QR Code & Pengesahan
    const bottomY = 425;
    doc.image(qrBuffer, 100, bottomY, { width: 90, height: 90 });
    doc.fontSize(8).font('Helvetica').fillColor('#64748B').text('Pindai untuk verifikasi keabsahan:', 90, bottomY + 95);
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#1E3A8A').text(`Kode: ${cert.verifyCode}`, 90, bottomY + 107);

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text('Penyelenggara Kegiatan Kampus', 550, bottomY);
    doc.fontSize(10).font('Helvetica').fillColor('#64748B').text(reg.event.organization.name, 550, bottomY + 16);
    doc.fontSize(9).font('Helvetica').fillColor('#10B981').text('[ Terverifikasi Kehadiran Digital UJB ]', 550, bottomY + 75);

    doc.end();
  } catch (error) {
    console.error('downloadCertificatePublic error:', error);
    return res.status(500).json({ success: false, message: 'Gagal membuat dokumen e-sertifikat.' });
  }
};

// 3. Verifikasi Keaslian Sertifikat (Publik)
export const verifyCertificate = async (req, res) => {
  try {
    const { verifyCode } = req.params;

    const cert = await prisma.certificate.findUnique({
      where: { verifyCode },
      include: {
        registration: {
          include: {
            event: {
              include: { organization: true }
            },
            attendance: true
          }
        }
      }
    });

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen e-sertifikat tidak ditemukan atau kode verifikasi tidak valid.'
      });
    }

    return res.json({
      success: true,
      message: 'Sertifikat Sah & Terverifikasi oleh Universitas Janabadra.',
      data: {
        certNumber: cert.certNumber,
        verifyCode: cert.verifyCode,
        issuedAt: cert.issuedAt,
        recipient: {
          name: cert.registration.name,
          nim: cert.registration.nim,
          institution: cert.registration.institution
        },
        event: {
          title: cert.registration.event.title,
          organization: cert.registration.event.organization.name,
          date: cert.registration.event.startAt,
          location: cert.registration.event.location
        },
        attendedAt: cert.registration.attendance?.scannedAt,
        scannedBy: cert.registration.attendance?.scannedByName
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memverifikasi sertifikat.' });
  }
};
