import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

export async function seed() {
  console.log('--- Mulai Seeding Data Universitas Janabadra ---');

  await prisma.certificate.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.eventScanner.deleteMany();
  await prisma.event.deleteMany();
  await prisma.category.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Admin Kampus
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Sistem Janabadra',
      email: 'admin@janabadra.ac.id',
      passwordHash,
      role: 'admin',
      phone: '081234567890'
    }
  });

  // 2. UKM / BEM Organizers
  const userHmti = await prisma.user.create({
    data: {
      name: 'Himpunan Mahasiswa Informatika (HMTI)',
      email: 'hmti@janabadra.ac.id',
      passwordHash,
      role: 'organizer',
      nim: 'ORG-HMTI',
      phone: '081298765432'
    }
  });

  const orgHmti = await prisma.organization.create({
    data: {
      userId: userHmti.id,
      name: 'Himpunan Mahasiswa Informatika (HMTI)',
      description: 'Organisasi kemahasiswaan Prodi Informatika Universitas Janabadra.',
      status: 'approved',
      verifiedBy: admin.id,
      verifiedAt: new Date()
    }
  });

  const userBem = await prisma.user.create({
    data: {
      name: 'BEM Universitas Janabadra',
      email: 'bem@janabadra.ac.id',
      passwordHash,
      role: 'organizer',
      nim: 'ORG-BEM',
      phone: '081288889999'
    }
  });

  const orgBem = await prisma.organization.create({
    data: {
      userId: userBem.id,
      name: 'BEM Universitas Janabadra',
      description: 'Badan Eksekutif Mahasiswa Universitas Janabadra.',
      status: 'approved',
      verifiedBy: admin.id,
      verifiedAt: new Date()
    }
  });

  // 3. Kategori
  const catTech = await prisma.category.create({
    data: { name: 'Teknologi & Riset', slug: 'teknologi-riset' }
  });
  const catSemi = await prisma.category.create({
    data: { name: 'Seminar & Kuliah Tamu', slug: 'seminar-kuliah-tamu' }
  });
  const catArt = await prisma.category.create({
    data: { name: 'Seni & Budaya', slug: 'seni-budaya' }
  });
  const catCareer = await prisma.category.create({
    data: { name: 'Karir & Kewirausahaan', slug: 'karir-kewirausahaan' }
  });

  // 4. Events
  const now = new Date();
  // Event hari ini (sesi aktif)
  const todayStart = new Date(now.getTime() - 2 * 60 * 60 * 1000); // dimulai 2 jam lalu
  const todayEnd = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  // Event mendatang
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const eventToday = await prisma.event.create({
    data: {
      organizationId: orgHmti.id,
      categoryId: catTech.id,
      title: 'Seminar Nasional AI & Cyber Security Janabadra',
      description: 'Membahas arsitektur keamanan modern, pemanfaatan LLM di kampus, dan penanggulangan siber.',
      location: 'Auditorium Kampus Pusat UJB, Jl. Tentara Rakyat Mataram',
      startAt: todayStart,
      endAt: todayEnd,
      quota: 150,
      proposalHardFile: 'Tersedia di Meja Admin & Disetujui Dekanat',
      status: 'published'
    }
  });

  const event2 = await prisma.event.create({
    data: {
      organizationId: orgBem.id,
      categoryId: catArt.id,
      title: 'Festival Olahraga & Seni Mahasiswa Janabadra 2026',
      description: 'Pekan kreasi mahasiswa seluruh fakultas Universitas Janabadra.',
      location: 'Lapangan Utama Kampus Janabadra',
      startAt: nextWeek,
      endAt: new Date(nextWeek.getTime() + 6 * 60 * 60 * 1000),
      quota: 200,
      proposalHardFile: 'Tersedia di Meja Admin',
      status: 'published'
    }
  });

  const event3 = await prisma.event.create({
    data: {
      organizationId: orgHmti.id,
      categoryId: catCareer.id,
      title: 'Workshop UI/UX Design System Modern & Prototyping',
      description: 'Praktik desain antarmuka responsif dan penyusunan komponen desain profesional.',
      location: 'Lab Komputer Gedung B Lantai 2',
      startAt: nextTwoWeeks,
      endAt: new Date(nextTwoWeeks.getTime() + 3 * 60 * 60 * 1000),
      quota: 40,
      proposalHardFile: 'Tersedia di Meja Admin',
      status: 'published'
    }
  });

  // 5. Staff Petugas Scanner Panitia Meja Registrasi untuk Event Today
  await prisma.eventScanner.createMany({
    data: [
      { eventId: eventToday.id, nim: '22102030', name: 'Dimas Prasetyo', roleName: 'Petugas Meja Registrasi A' },
      { eventId: eventToday.id, nim: '22102045', name: 'Rina Anggraini', roleName: 'Petugas Meja Registrasi B' },
      { eventId: eventToday.id, nim: '21102012', name: 'Budi Santoso', roleName: 'Petugas Scanner Backup' }
    ]
  });

  // 6. Registrasi Peserta (Mahasiswa & Umum)
  const reg1 = await prisma.registration.create({
    data: {
      eventId: eventToday.id,
      participantType: 'mahasiswa',
      name: 'Ahmad Zaki Kurniawan',
      email: 'ahmad.zaki@student.janabadra.ac.id',
      nim: '21102045',
      prodi: 'Informatika',
      institution: 'Universitas Janabadra',
      ticketCode: `TKT-UJB-${eventToday.id}-21102045-88A1`,
      status: 'confirmed'
    }
  });

  const reg2 = await prisma.registration.create({
    data: {
      eventId: eventToday.id,
      participantType: 'umum',
      name: 'Hendro Prasetyo, S.Kom',
      email: 'hendro@techcorp.id',
      institution: 'PT Solusi Siber Nusantara',
      profession: 'Software Engineer',
      ticketCode: `TKT-UJB-${eventToday.id}-UMUM-99C2`,
      status: 'confirmed'
    }
  });

  // Presensi untuk peserta 1 (Zaki)
  const att1 = await prisma.attendance.create({
    data: {
      registrationId: reg1.id,
      scannedByName: 'Dimas Prasetyo',
      scannedByNim: '22102030'
    }
  });

  await prisma.certificate.create({
    data: {
      registrationId: reg1.id,
      certNumber: `CERT/2026/UJB-${eventToday.id}/${reg1.id}`,
      verifyCode: `VRF-UJB-${eventToday.id}-${reg1.id}-X90`
    }
  });

  console.log('--- Data Seeding Universitas Janabadra Selesai! ---');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
