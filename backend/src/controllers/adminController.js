import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';

// ADMIN: Get stats
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'user' } });
    const totalOrganizers = await prisma.organization.count();
    const totalEvents = await prisma.event.count();
    const totalRegistrations = await prisma.registration.count();
    const totalAttendances = await prisma.attendance.count();

    const organizations = await prisma.organization.findMany({
      include: {
        user: true,
        events: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalOrganizers,
        totalEvents,
        totalRegistrations,
        totalAttendances,
        organizations
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data statistik admin.' });
  }
};

// ADMIN: 1-Click Generate Akun Resmi Penyelenggara UKM
export const generateOrganizerAccount = async (req, res) => {
  try {
    const { orgName, picName, picNim, faculty, notes } = req.body;

    if (!orgName || !picName) {
      return res.status(400).json({
        success: false,
        message: 'Nama organisasi dan nama penanggung jawab (Ketua) wajib diisi.'
      });
    }

    // 1. Generate Email Terstandarisasi Kampus: organizer.<slug>@janabadra.ac.id
    const slug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15);
    
    const randomNum = Math.floor(100 + Math.random() * 900);
    const email = `ukm.${slug || 'org'}${randomNum}@janabadra.ac.id`;

    // 2. Generate Human-Readable Strong Password
    const passPrefix = ['Janabadra', 'UJB', 'Kampus', 'Merdeka'][Math.floor(Math.random() * 4)];
    const plainPassword = `${passPrefix}2026#${randomNum}`;
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    // 3. Simpan User & Organisasi (Langsung berstatus Approved)
    const user = await prisma.user.create({
      data: {
        name: picName.trim(),
        email,
        passwordHash,
        role: 'organizer',
        nim: picNim?.trim() || null,
        phone: null,
        institution: 'Universitas Janabadra'
      }
    });

    const org = await prisma.organization.create({
      data: {
        userId: user.id,
        name: orgName.trim(),
        description: notes || `Lembaga Kemahasiswaan Resmi Fakultas/Unit ${faculty || 'Universitas Janabadra'}`,
        status: 'approved',
        verifiedBy: req.user.id,
        verifiedAt: new Date()
      }
    });

    return res.status(201).json({
      success: true,
      message: `Akun Penyelenggara ${orgName} berhasil diterbitkan!`,
      data: {
        organization: org,
        credential: {
          organizationName: org.name,
          picName: user.name,
          picNim: user.nim,
          email: user.email,
          plainPassword, // Diberikan sekali ke Admin untuk dicetak/diberikan ke Ketua UKM
          generatedAt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('generateOrganizerAccount error:', error);
    return res.status(500).json({ success: false, message: 'Gagal menerbitkan akun penyelenggara.' });
  }
};

// ADMIN: Verify Organization
export const verifyOrganization = async (req, res) => {
  try {
    const orgId = parseInt(req.params.id);
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status harus approved atau rejected.' });
    }

    const org = await prisma.organization.update({
      where: { id: orgId },
      data: {
        status,
        verifiedBy: req.user.id,
        verifiedAt: new Date()
      }
    });

    return res.json({
      success: true,
      message: `Status organisasi berhasil diubah menjadi ${status}.`,
      data: org
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memvalidasi organisasi.' });
  }
};

// CATEGORIES: List & Manage
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { events: true } } }
    });
    return res.json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil kategori.' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Nama dan slug kategori wajib diisi.' });
    }

    const cat = await prisma.category.create({
      data: { name, slug }
    });

    return res.status(201).json({ success: true, data: cat });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal membuat kategori.' });
  }
};

// ORGANIZER: Dashboard & Analytics (Multi-tenant)
export const getOrganizerAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    let org = await prisma.organization.findUnique({ where: { userId } });

    if (!org) {
      org = await prisma.organization.findFirst();
    }

    if (!org) {
      return res.status(404).json({ success: false, message: 'Organisasi tidak ditemukan.' });
    }

    const events = await prisma.event.findMany({
      where: { organizationId: org.id },
      include: {
        category: true,
        registrations: {
          include: {
            user: true,
            attendance: true,
            certificate: true
          }
        }
      },
      orderBy: { startAt: 'desc' }
    });

    const totalEvents = events.length;
    let totalRegistered = 0;
    let totalAttended = 0;

    const eventStats = events.map(ev => {
      const regCount = ev.registrations.length;
      const attCount = ev.registrations.filter(r => r.attendance).length;
      totalRegistered += regCount;
      totalAttended += attCount;

      return {
        id: ev.id,
        title: ev.title,
        location: ev.location,
        startAt: ev.startAt,
        quota: ev.quota,
        registeredCount: regCount,
        attendedCount: attCount,
        attendanceRate: regCount > 0 ? Math.round((attCount / regCount) * 100) : 0,
        participants: ev.registrations.map(r => ({
          registrationId: r.id,
          ticketCode: r.ticketCode,
          name: r.name || r.user?.name || 'Peserta',
          nim: r.nim || r.user?.nim || '-',
          email: r.email || r.user?.email || '-',
          institution: r.institution || 'Universitas Janabadra',
          status: r.status,
          isAttended: !!r.attendance,
          attendedAt: r.attendance?.scannedAt || null,
          hasCertificate: !!r.certificate
        }))
      };
    });

    return res.json({
      success: true,
      data: {
        organization: org,
        summary: {
          totalEvents,
          totalRegistered,
          totalAttended,
          overallRate: totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0
        },
        events: eventStats
      }
    });
  } catch (error) {
    console.error('getOrganizerAnalytics error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memuat analitik panitia.' });
  }
};
