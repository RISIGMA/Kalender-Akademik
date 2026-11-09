import prisma from '../config/db.js';

// 1. Ambil Semua Event (Mendukung Realtime Polling & Filter)
export const getEvents = async (req, res) => {
  try {
    const { category, search, status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    } else {
      where.status = 'published';
    }

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } }
      ];
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        category: true,
        organization: true,
        scanners: true,
        _count: {
          select: {
            registrations: true
          }
        }
      },
      orderBy: { startAt: 'asc' }
    });

    const now = new Date();

    const formatted = events.map(e => {
      const eventStart = new Date(e.startAt);
      const sessionEnd = new Date(eventStart.getTime() + 24 * 60 * 60 * 1000);
      const prepStart = new Date(eventStart.getTime() - 60 * 60 * 1000);
      const isSessionActive = now >= prepStart && now <= sessionEnd;

      return {
        id: e.id,
        title: e.title,
        description: e.description,
        location: e.location,
        startAt: e.startAt,
        endAt: e.endAt,
        quota: e.quota,
        registeredCount: e._count.registrations,
        posterUrl: e.posterUrl,
        proposalHardFile: e.proposalHardFile,
        status: e.status,
        category: e.category.name,
        categorySlug: e.category.slug,
        organization: e.organization.name,
        organizationId: e.organizationId,
        scannersCount: e.scanners.length,
        isSessionActive,
        sessionEnd
      };
    });

    return res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('getEvents error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memuat daftar kegiatan.' });
  }
};

// 2. Ambil Detail Event Spesifik (Termasuk Poster & Info Lengkap)
export const getEventById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        category: true,
        organization: true,
        scanners: true,
        _count: {
          select: { registrations: true }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Kegiatan tidak ditemukan.' });
    }

    const now = new Date();
    const eventStart = new Date(event.startAt);
    const sessionEnd = new Date(eventStart.getTime() + 24 * 60 * 60 * 1000);
    const prepStart = new Date(eventStart.getTime() - 60 * 60 * 1000);

    return res.json({
      success: true,
      data: {
        ...event,
        category: event.category.name,
        organization: event.organization.name,
        registeredCount: event._count.registrations,
        isSessionActive: now >= prepStart && now <= sessionEnd,
        sessionEnd
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memuat detail kegiatan.' });
  }
};

// 3. Buat Kegiatan Baru (Penyelenggara - Multi-Tenant Bound)
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      categoryId,
      startAt,
      endAt,
      quota,
      proposalHardFile,
      posterUrl: bodyPosterUrl
    } = req.body;

    const userId = req.user.id;
    let org = await prisma.organization.findUnique({ where: { userId } });

    if (!org && req.user.role === 'admin') {
      org = await prisma.organization.findFirst();
    }

    if (!org) {
      return res.status(400).json({
        success: false,
        message: 'Akun Anda belum terhubung dengan profil Organisasi/UKM yang terdaftar.'
      });
    }

    // Ambil poster gambar dari upload Multer (file) atau dari URL body
    let posterUrl = bodyPosterUrl || null;
    if (req.file) {
      posterUrl = `/uploads/${req.file.filename}`;
    }

    const newEvent = await prisma.event.create({
      data: {
        organizationId: org.id,
        categoryId: parseInt(categoryId) || 1,
        title: title.trim(),
        description: description?.trim() || '',
        location: location.trim(),
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        quota: parseInt(quota) || 50,
        posterUrl,
        proposalHardFile: proposalHardFile || 'Tersedia di Meja Admin',
        status: 'published'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Kegiatan berhasil dibuat dan ditayangkan di Kalender Kampus!',
      data: newEvent
    });
  } catch (error) {
    console.error('createEvent error:', error);
    return res.status(500).json({ success: false, message: 'Gagal membuat kegiatan baru.' });
  }
};

// 4. Hapus Kegiatan (Multi-Tenant Authorization Check)
export const deleteEvent = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Kegiatan tidak ditemukan.' });
    }

    // Cek kepemilikan jika bukan admin
    if (req.user.role !== 'admin') {
      const org = await prisma.organization.findUnique({ where: { userId: req.user.id } });
      if (event.organizationId !== org?.id) {
        return res.status(403).json({
          success: false,
          message: 'AKSES DITOLAK: Anda hanya berhak mengelola kegiatan milik organisasi Anda sendiri.'
        });
      }
    }

    await prisma.event.delete({ where: { id } });
    return res.json({ success: true, message: 'Kegiatan berhasil dihapus.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus kegiatan.' });
  }
};

// 5. Kelola Staf Scanner Panitia (Tambah Staf Baru - Multi-Tenant Bound)
export const addEventScanner = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { nim, name, roleName } = req.body;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Kegiatan tidak ditemukan.' });
    }

    // Cek kepemilikan multi-tenant
    if (req.user.role !== 'admin') {
      const org = await prisma.organization.findUnique({ where: { userId: req.user.id } });
      if (event.organizationId !== org?.id) {
        return res.status(403).json({
          success: false,
          message: 'AKSES DITOLAK: Anda tidak berhak mengelola staf scanner pada kegiatan organisasi lain.'
        });
      }
    }

    if (!nim || !name) {
      return res.status(400).json({
        success: false,
        message: 'NIM dan Nama panitia wajib diisi.'
      });
    }

    const existing = await prisma.eventScanner.findUnique({
      where: {
        eventId_nim: { eventId, nim: nim.trim() }
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Panitia dengan NIM ${nim} sudah terdaftar sebagai petugas scanner untuk kegiatan ini.`
      });
    }

    const scanner = await prisma.eventScanner.create({
      data: {
        eventId,
        nim: nim.trim(),
        name: name.trim(),
        roleName: roleName?.trim() || 'Petugas Meja Registrasi'
      }
    });

    return res.status(201).json({
      success: true,
      message: `Panitia ${name} (NIM: ${nim}) berhasil didaftarkan sebagai petugas scanner.`,
      data: scanner
    });
  } catch (error) {
    console.error('addEventScanner error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mendaftarkan panitia scanner.' });
  }
};

// 6. Ambil Daftar Staf Scanner untuk Event
export const getEventScanners = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const scanners = await prisma.eventScanner.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: scanners });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memuat panitia scanner.' });
  }
};

// 7. Hapus Staf Scanner (Multi-Tenant Bound)
export const deleteEventScanner = async (req, res) => {
  try {
    const scannerId = parseInt(req.params.scannerId);
    const scanner = await prisma.eventScanner.findUnique({
      where: { id: scannerId },
      include: { event: true }
    });

    if (!scanner) {
      return res.status(404).json({ success: false, message: 'Petugas scanner tidak ditemukan.' });
    }

    if (req.user.role !== 'admin') {
      const org = await prisma.organization.findUnique({ where: { userId: req.user.id } });
      if (scanner.event.organizationId !== org?.id) {
        return res.status(403).json({
          success: false,
          message: 'AKSES DITOLAK: Anda tidak berhak menghapus staf organisasi lain.'
        });
      }
    }

    await prisma.eventScanner.delete({ where: { id: scannerId } });
    return res.json({ success: true, message: 'Petugas scanner berhasil dihapus.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus petugas scanner.' });
  }
};
