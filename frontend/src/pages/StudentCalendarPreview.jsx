import React, { useState } from 'react';
import { 
  Calendar as CalIcon, 
  MapPin, 
  Clock, 
  Users, 
  Building, 
  ChevronLeft, 
  ChevronRight, 
  Tag, 
  ArrowRight, 
  Sparkles, 
  CheckCircle,
  Filter,
  Flame,
  CalendarDays,
  Share2
} from 'lucide-react';

const MOCK_EVENTS = [
  {
    id: 1,
    title: 'Workshop Modern Web Architecture: REST API & Security',
    organization: 'Himpunan Mahasiswa Informatika (HMTI) UJB',
    category: 'Teknologi & Riset',
    categorySlug: 'teknologi-riset',
    date: '2026-11-12',
    time: '09:00 - 12:00 WIB',
    location: 'Laboratorium Komputer Kampus Pusat UJB',
    quota: 50,
    registeredCount: 38,
    description: 'Pelajari praktik terbaik arsitektur web modern, keamanan JWT, penanganan token, dan mitigasi celah keamanan web terkini.',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    dotColor: 'bg-sky-500',
    bannerGradient: 'from-sky-500/20 via-blue-500/10 to-transparent'
  },
  {
    id: 2,
    title: 'Seminar UI/UX Design: Crafting User Centric Product',
    organization: 'UKM Multimedia Janabadra',
    category: 'Seni & Budaya',
    categorySlug: 'seni-budaya',
    date: '2026-11-12',
    time: '13:30 - 16:00 WIB',
    location: 'Auditorium Utama Universitas Janabadra',
    quota: 80,
    registeredCount: 75,
    description: 'Eksplorasi design thinking, wireframing, dan interactive prototyping menggunakan design system masa kini.',
    badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
    dotColor: 'bg-pink-500',
    bannerGradient: 'from-pink-500/20 via-rose-500/10 to-transparent'
  },
  {
    id: 3,
    title: 'Kuliah Umum Nasional: Transformasi Digital Kampus Merdeka',
    organization: 'BEM Universitas Janabadra',
    category: 'Seminar & Kuliah Tamu',
    categorySlug: 'seminar-kuliah-tamu',
    date: '2026-11-19',
    time: '08:30 - 12:30 WIB',
    location: 'Graha Janabadra Lt. 3',
    quota: 150,
    registeredCount: 142,
    description: 'Diskusi panel bersama pakar industri teknologi mengenai kesiapan ekosistem karir mahasiswa di era revolusi digital.',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    dotColor: 'bg-purple-500',
    bannerGradient: 'from-purple-500/20 via-indigo-500/10 to-transparent'
  },
  {
    id: 4,
    title: 'Startup Career Pitch & Networking Session',
    organization: 'Pusat Karir & Alumni Universitas Janabadra',
    category: 'Karir & Kewirausahaan',
    categorySlug: 'karir-kewirausahaan',
    date: '2026-11-25',
    time: '10:00 - 15:00 WIB',
    location: 'Ruang Seminar Bersama Gedung D, UJB',
    quota: 60,
    registeredCount: 60,
    description: 'Temui para founder startup, konsultasi portofolio kerja, dan temukan kesempatan magang bersertifikat.',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    dotColor: 'bg-amber-500',
    bannerGradient: 'from-amber-500/20 via-orange-500/10 to-transparent'
  }
];

export const StudentCalendarPreview = () => {
  const [selectedDate, setSelectedDate] = useState('2026-11-12');
  const [currentMonth] = useState('November 2026');

  const eventsOnSelectedDate = MOCK_EVENTS.filter(e => e.date === selectedDate);

  const daysInMonth = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-11-${String(dayNum).padStart(2, '0')}`;
    const dayEvents = MOCK_EVENTS.filter(e => e.date === dateStr);
    return {
      dayNum,
      dateStr,
      hasEvents: dayEvents.length > 0,
      events: dayEvents,
      isToday: dayNum === 5
    };
  });

  const selectedDateFormatted = new Date(selectedDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* 🌟 HERO SECTION RESPONSIVE DENGAN LOGO RESMI UNIVERSITAS JANABADRA */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-950 text-white p-5 sm:p-8 md:p-10 shadow-2xl border border-slate-800/80">
        <div className="absolute -top-24 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-10 w-60 sm:w-80 h-60 sm:h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 sm:space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[11px] sm:text-xs font-semibold text-amber-300">
              <Sparkles size={14} className="text-amber-400 shrink-0" />
              <span>Agenda Resmi Kegiatan Universitas Janabadra</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Kalender Kegiatan <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200">Mahasiswa Janabadra</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
              Jelajahi agenda akademik, seminar nasional, workshop teknologi, dan kegiatan UKM kampus. Dapatkan e-sertifikat resmi langsung setelah presensi.
            </p>

            {/* Quick Date Shortcuts (Scroll horizontal di layar kecil) */}
            <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1 max-w-full no-scrollbar">
              <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1">
                <Filter size={13} /> Tanggal:
              </span>
              <button
                onClick={() => setSelectedDate('2026-11-12')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border shrink-0 transition-all ${
                  selectedDate === '2026-11-12' 
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20' 
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                12 Nov (Web & UI/UX)
              </button>
              <button
                onClick={() => setSelectedDate('2026-11-19')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border shrink-0 transition-all ${
                  selectedDate === '2026-11-19' 
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20' 
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                19 Nov (Kuliah Umum BEM)
              </button>
              <button
                onClick={() => setSelectedDate('2026-11-25')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border shrink-0 transition-all ${
                  selectedDate === '2026-11-25' 
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20' 
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                25 Nov (Career Pitch)
              </button>
            </div>
          </div>

          {/* Logo Kampus Emblem Hero */}
          <div className="hidden md:flex flex-col items-center justify-center bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl shrink-0 shadow-lg">
            <img
              src="/Universitas_Janabadra.png"
              alt="Universitas Janabadra"
              className="w-24 h-24 lg:w-28 lg:h-28 object-contain drop-shadow-md"
            />
            <span className="text-[11px] font-bold text-amber-300 tracking-wider uppercase mt-2">
              Kampus Merdeka
            </span>
          </div>
        </div>
      </section>

      {/* 📅 SPLIT-VIEW ADAPTIF (STACK DI HP, BERDAMPINGAN DI DESKTOP/TABLET) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* KOLOM KALENDER INTERAKTIF (Mobile: Full Width, Tablet: 5 col, Desktop: 5 col) */}
        <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xl shadow-slate-200/50 lg:sticky lg:top-24 space-y-4 sm:space-y-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider">Pilih Tanggal Kegiatan</span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
                <CalendarDays size={18} className="text-slate-700 shrink-0" />
                <span>{currentMonth}</span>
              </h2>
            </div>
            
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
              <button className="p-1 sm:p-1.5 hover:bg-white rounded-lg text-slate-600 transition-all" title="Bulan Sebelumnya">
                <ChevronLeft size={16} />
              </button>
              <button className="p-1 sm:p-1.5 hover:bg-white rounded-lg text-slate-600 transition-all" title="Bulan Berikutnya">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Hari dalam seminggu */}
          <div className="grid grid-cols-7 text-center text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Min</span>
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
          </div>

          {/* Grid Tanggal Kalender (Sentuhan responsif di HP) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {daysInMonth.map((d) => {
              const isSelected = selectedDate === d.dateStr;

              return (
                <button
                  key={d.dayNum}
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`
                    relative group flex flex-col items-center justify-center p-1 sm:p-2 rounded-xl sm:rounded-2xl h-11 sm:h-14 transition-all duration-200 touch-manipulation
                    ${isSelected 
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30 scale-105 z-10' 
                      : d.isToday
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                      : 'hover:bg-slate-100 text-slate-700'
                    }
                  `}
                >
                  <span className={`text-xs sm:text-sm ${isSelected ? 'font-black' : 'font-semibold'}`}>
                    {d.dayNum}
                  </span>

                  {/* Indicator Dots Event */}
                  <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1 h-1.5 sm:h-2">
                    {d.hasEvents && d.events.map((ev, i) => (
                      <span 
                        key={i} 
                        className={`w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full ${isSelected ? 'bg-amber-400' : ev.dotColor} animate-pulse`} 
                      />
                    ))}
                  </div>

                  {d.isToday && !isSelected && (
                    <span className="hidden sm:inline-block absolute -top-1 right-1 text-[8px] font-bold text-blue-600">Hari Ini</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend Warna Kategori */}
          <div className="pt-3 sm:pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
              <span>Teknologi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
              <span>Seni & Desain</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
              <span>Seminar BEM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span>Karir</span>
            </div>
          </div>
        </div>

        {/* KOLOM DAFTAR AGENDA DINAMIS (Mobile: Full Width, Tablet/Desktop: 7 col) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5">
          {/* Header Panel Tanggal Terpilih */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Agenda Kegiatan Terpilih</span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                {selectedDateFormatted}
              </h3>
            </div>
            <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/80 self-start sm:self-auto shrink-0">
              {eventsOnSelectedDate.length} Kegiatan
            </div>
          </div>

          {/* Konten Kartu Event */}
          {eventsOnSelectedDate.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-sm space-y-3 sm:space-y-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <CalIcon size={26} />
              </div>
              <h4 className="text-base font-extrabold text-slate-800">Tidak ada agenda pada tanggal ini</h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Silakan pilih tanggal lain yang memiliki <strong>titik indikator warna</strong> pada kalender (contoh: tanggal 12, 19, atau 25 November).
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {eventsOnSelectedDate.map(ev => {
                const isFull = ev.registeredCount >= ev.quota;
                const remaining = ev.quota - ev.registeredCount;
                const quotaPct = Math.round((ev.registeredCount / ev.quota) * 100);

                return (
                  <div
                    key={ev.id}
                    className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Header Banner Kartu */}
                    <div className={`p-4 sm:p-6 bg-gradient-to-r ${ev.bannerGradient} border-b border-slate-100 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4`}>
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold border ${ev.badgeColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${ev.dotColor}`} />
                            {ev.category}
                          </span>

                          <span className="text-[11px] sm:text-xs text-slate-600 font-medium flex items-center gap-1">
                            <Building size={13} className="text-slate-400 shrink-0" />
                            <span className="truncate max-w-[200px] sm:max-w-xs">{ev.organization}</span>
                          </span>
                        </div>

                        <h4 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                          {ev.title}
                        </h4>
                      </div>

                      {/* Status Kuota Chip */}
                      {isFull ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200 shrink-0 self-start">
                          Penuh
                        </span>
                      ) : remaining <= 10 ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1 shrink-0 self-start">
                          <Flame size={12} className="text-amber-600" /> Sisa {remaining}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0 self-start">
                          Buka
                        </span>
                      )}
                    </div>

                    {/* Deskripsi & Meta Lokasi */}
                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {ev.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <Clock size={15} className="text-blue-600 shrink-0" />
                          <span className="font-semibold">{ev.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={15} className="text-rose-600 shrink-0" />
                          <span className="truncate font-semibold">{ev.location}</span>
                        </div>
                      </div>

                      {/* Quota Progress Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-600">
                          <span className="flex items-center gap-1">
                            <Users size={13} className="text-slate-400" /> Kuota Terisi
                          </span>
                          <span className="text-slate-900 font-bold">{ev.registeredCount} / {ev.quota} Peserta</span>
                        </div>
                        <div className="w-full h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isFull ? 'bg-rose-500' : quotaPct > 80 ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${quotaPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="p-4 sm:p-6 pt-0 flex items-center justify-between gap-3">
                      <button 
                        onClick={() => alert(`Simulasi Pendaftaran: ${ev.title}`)}
                        disabled={isFull}
                        className={`w-full py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                          isFull
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            : 'bg-slate-900 hover:bg-amber-600 hover:text-slate-950 active:scale-[0.98] text-white shadow-slate-900/10'
                        }`}
                      >
                        {isFull ? (
                          <span>Kuota Penuh</span>
                        ) : (
                          <>
                            <span>Daftar Sekarang & Ambil Tiket QR</span>
                            <ArrowRight size={15} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
