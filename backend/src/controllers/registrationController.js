import prisma from '../config/db.js';

// 1. Publik: Mendaftar ke kegiatan (Zero friction, tanpa login)
export const registerPublicToEvent = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { 
      participantType = 'mahasiswa', // 'mahasiswa' | 'umum'
      name, 
      email, 
      nim, 
      prodi, 
      institution, 
      profession 
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nama lengkap dan email wajib diisi.'
      });
    }

    if (participantType === 'mahasiswa' && !nim) {
      return res.status(400).json({
        success: false,
        message: 'NIM wajib diisi untuk kategori mahasiswa.'
      });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: { select: { registrations: true } }
      }
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event tidak ditemukan.' });
    }

    if (event.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Pendaftaran kegiatan ini tidak dibuka.' });
    }

    if (event._count.registrations >= event.quota) {
      return res.status(400).json({
        success: false,
        message: 'Mohon maaf, kuota pendaftaran untuk kegiatan ini sudah penuh.'
      });
    }

    // Cek pendaftaran ganda via email pada event ini
    const existing = await prisma.registration.findFirst({
      where: {
        eventId,
        email: email.trim().toLowerCase()
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Email ${email} sudah terdaftar pada kegiatan ini dengan nomor tiket ${existing.ticketCode}.`
      });
    }

    // Generate ticket unik: TKT-UJB-<eventId>-<NIM/UMUM>-<RANDOM>
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const subIdentifier = participantType === 'mahasiswa' ? (nim ? nim.replace(/\s+/g, '') : 'MHS') : 'UMUM';
    const ticketCode = `TKT-UJB-${eventId}-${subIdentifier}-${randomHex}`;

    // Link user jika email sudah terdaftar di sistem akun
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    const registration = await prisma.registration.create({
      data: {
        eventId,
        userId: existingUser?.id || null,
        participantType,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        nim: participantType === 'mahasiswa' ? nim?.trim() : null,
        prodi: participantType === 'mahasiswa' ? prodi?.trim() : null,
        institution: institution?.trim() || (participantType === 'mahasiswa' ? 'Universitas Janabadra' : null),
        profession: participantType === 'umum' ? profession?.trim() : null,
        ticketCode,
        status: 'confirmed'
      },
      include: {
        event: {
          include: {
            organization: true,
            category: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil! Tiket barcode Anda telah diterbitkan.',
      data: registration
    });
  } catch (error) {
    console.error('registerPublicToEvent error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memproses pendaftaran kegiatan.' });
  }
};

// 2. Publik: Cari tiket atau sertifikat menggunakan Email atau NIM
export const lookupPublicTickets = async (req, res) => {
  try {
    const { query } = req.query; // email atau nim
    if (!query || query.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Masukkan minimal 3 karakter Email atau NIM yang valid.'
      });
    }

    const cleanQuery = query.trim();

    const registrations = await prisma.registration.findMany({
      where: {
        OR: [
          { email: { contains: cleanQuery } },
          { nim: { contains: cleanQuery } },
          { ticketCode: { contains: cleanQuery } }
        ]
      },
      include: {
        event: {
          include: {
            organization: true,
            category: true
          }
        },
        attendance: true,
        certificate: true
      },
      orderBy: { registeredAt: 'desc' }
    });

    const formatted = registrations.map(r => ({
      registrationId: r.id,
      ticketCode: r.ticketCode,
      name: r.name,
      email: r.email,
      nim: r.nim,
      prodi: r.prodi,
      institution: r.institution,
      participantType: r.participantType,
      status: r.status,
      registeredAt: r.registeredAt,
      isAttended: !!r.attendance,
      attendedAt: r.attendance?.scannedAt || null,
      scannedByName: r.attendance?.scannedByName || null,
      certificate: r.certificate ? {
        certNumber: r.certificate.certNumber,
        verifyCode: r.certificate.verifyCode,
        issuedAt: r.certificate.issuedAt
      } : null,
      event: {
        id: r.event.id,
        title: r.event.title,
        location: r.event.location,
        startAt: r.event.startAt,
        endAt: r.event.endAt,
        organization: r.event.organization.name,
        category: r.event.category.name
      }
    }));

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('lookupPublicTickets error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mencari tiket.' });
  }
};

// 3. User Terotentikasi: Mendapatkan tiket saya
export const getMyTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const registrations = await prisma.registration.findMany({
      where: {
        OR: [
          { userId },
          { email: user.email }
        ]
      },
      include: {
        event: {
          include: {
            organization: true,
            category: true
          }
        },
        attendance: true,
        certificate: true
      },
      orderBy: { registeredAt: 'desc' }
    });

    const formatted = registrations.map(r => ({
      registrationId: r.id,
      ticketCode: r.ticketCode,
      name: r.name,
      email: r.email,
      nim: r.nim,
      status: r.status,
      registeredAt: r.registeredAt,
      isAttended: !!r.attendance,
      attendedAt: r.attendance?.scannedAt || null,
      certificate: r.certificate ? {
        certNumber: r.certificate.certNumber,
        verifyCode: r.certificate.verifyCode,
        issuedAt: r.certificate.issuedAt
      } : null,
      event: {
        id: r.event.id,
        title: r.event.title,
        location: r.event.location,
        startAt: r.event.startAt,
        endAt: r.event.endAt,
        organization: r.event.organization.name,
        category: r.event.category.name
      }
    }));

    return res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('getMyTickets error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memuat tiket saya.' });
  }
};

// 4. Batalkan Pendaftaran
export const cancelRegistration = async (req, res) => {
  try {
    const registrationId = parseInt(req.params.id);
    await prisma.registration.delete({
      where: { id: registrationId }
    });

    return res.json({ success: true, message: 'Pendaftaran berhasil dibatalkan.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal membatalkan pendaftaran.' });
  }
};
