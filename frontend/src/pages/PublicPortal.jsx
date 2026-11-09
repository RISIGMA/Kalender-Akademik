import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import { 
  ArrowUpRight, 
  Search, 
  MapPin, 
  Clock, 
  Calendar, 
  ChevronRight, 
  ChevronLeft,
  Check, 
  X, 
  Award, 
  Ticket, 
  Camera, 
  Building, 
  GraduationCap, 
  Info, 
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PublicPortal = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Kalender Dinamis State (Tahun & Bulan)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 5)); // Default Nov 2026
  const [selectedDateFilter, setSelectedDateFilter] = useState(null); // null = tampilkan semua, atau Date string 'YYYY-MM-DD'
  const [activeCategory, setActiveCategory] = useState('all');

  // Modal Detail & Poster Event
  const [detailEvent, setDetailEvent] = useState(null);

  // Modal Register State
  const [registerEvent, setRegisterEvent] = useState(null);
  const [participantType, setParticipantType] = useState('mahasiswa');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nim: '',
    prodi: 'Informatika',
    instansi: '',
    profesi: 'Karyawan Swasta'
  });
  const [submitting, setSubmitting] = useState(false);

  // Modal Tiket Notch
  const [ticketData, setTicketData] = useState(null);

  // Modal Lookup
  const [lookupOpen, setLookupOpen] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResults, setLookupResults] = useState([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);

  // Fetch Event dengan Polling Realtime (setiap 5 detik)
  const fetchEvents = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await apiFetch('/events');
      if (res.success) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(() => {
      fetchEvents(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- LOGIKA GENERATOR GRID KALENDER BULANAN DINAMIS ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
    'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
  ];

  // Jumlah hari di bulan ini
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  // Hari pertama bulan ini (0 = Minggu, 1 = Senin, ...)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Jumlah hari di bulan sebelumnya
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Mapping Event ke format tanggal YYYY-MM-DD
  const eventsByDate = {};
  events.forEach(ev => {
    const d = new Date(ev.startAt);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    eventsByDate[dateKey].push(ev);
  });

  const calendarGrid = [];

  // Hari dari bulan sebelumnya (padding)
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarGrid.push({
      dayNum: daysInPrevMonth - i,
      isCurrentMonth: false,
      dateKey: null,
      eventsOnDate: []
    });
  }

  // Hari di bulan aktif
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const eventsOnDate = eventsByDate[dateKey] || [];

    calendarGrid.push({
      dayNum: day,
      isCurrentMonth: true,
      dateKey,
      isToday: dateKey === '2026-11-05', // Context time
      eventsOnDate
    });
  }

  // Sisa sel untuk menutup baris kelipatan 7
  const remainingCells = (7 - (calendarGrid.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    calendarGrid.push({
      dayNum: i,
      isCurrentMonth: false,
      dateKey: null,
      eventsOnDate: []
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDateFilter(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDateFilter(null);
  };

  const handleDayClick = (cell) => {
    if (!cell.isCurrentMonth) return;

    if (selectedDateFilter === cell.dateKey) {
      // Klik lagi untuk reset (tampilkan semua)
      setSelectedDateFilter(null);
    } else {
      setSelectedDateFilter(cell.dateKey);
      // Jika ada event di tanggal ini, buka detail event pertamanya
      if (cell.eventsOnDate.length > 0) {
        setDetailEvent(cell.eventsOnDate[0]);
      }
    }
  };

  // --- FILTER AGENDA (Kategori + Tanggal Terpilih) ---
  const displayedEvents = events.filter(ev => {
    // Filter Kategori
    const matchCat = activeCategory === 'all' 
      || ev.categorySlug === activeCategory 
      || ev.category?.toLowerCase().includes(activeCategory);

    // Filter Tanggal dari Kalender
    if (!matchCat) return false;
    if (!selectedDateFilter) return true;

    const d = new Date(ev.startAt);
    const evDateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return evDateKey === selectedDateFilter;
  });

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerEvent) return;

    try {
      setSubmitting(true);
      const payload = {
        participantType,
        name: formData.name,
        email: formData.email,
        nim: participantType === 'mahasiswa' ? formData.nim : null,
        prodi: participantType === 'mahasiswa' ? formData.prodi : null,
        institution: participantType === 'mahasiswa' ? 'Universitas Janabadra' : formData.instansi,
        profession: participantType === 'umum' ? formData.profesi : null
      };

      const res = await apiFetch(`/events/${registerEvent.id}/register-public`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        setTicketData({
          ticketCode: res.data.ticketCode,
          title: registerEvent.title,
          time: new Date(registerEvent.startAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          date: new Date(registerEvent.startAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }),
          location: registerEvent.location,
          name: res.data.name,
          identifier: participantType === 'mahasiswa' ? `NIM ${res.data.nim} • ${res.data.prodi}` : `${res.data.institution} • ${res.data.profession}`
        });
        setRegisterEvent(null);
        setDetailEvent(null);
        fetchEvents(true);
      }
    } catch (err) {
      alert(err.message || 'Pendaftaran gagal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    try {
      setLookupLoading(true);
      setLookupError(null);
      const res = await apiFetch(`/tickets/lookup?query=${encodeURIComponent(lookupQuery.trim())}`);
      setLookupResults(res.data || []);
      if (res.data?.length === 0) {
        setLookupError('Tiket dengan data tersebut tidak ditemukan.');
      }
    } catch (err) {
      setLookupError(err.message || 'Pencarian tiket gagal');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-[#0E0F11] font-sans">
      {/* 1. TOP UTILITY BAR */}
      <header className="border-b border-[#E2E1DA] bg-[#F4F4F0] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#EA580C] inline-block animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest font-black text-[#0E0F11]">
              UJB // EVENT ARCHIVE &reg;
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono text-[#575A65] pl-2 border-l border-[#E2E1DA]">
              REALTIME LIVE STREAM &bull; YOGYAKARTA
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setLookupOpen(true)}
              className="text-xs font-mono font-bold text-[#0E0F11] hover:text-[#EA580C] flex items-center gap-1.5 transition-colors"
            >
              <Search size={13} />
              <span>CARI TIKET / SERTIFIKAT</span>
            </button>

            <div className="h-4 w-px bg-[#E2E1DA] hidden sm:block" />

            <Link
              to="/penyelenggara/login"
              className="px-3 py-1.5 text-xs font-mono font-bold bg-[#0E0F11] text-[#F4F4F0] hover:bg-[#EA580C] transition-all rounded-xs flex items-center gap-1"
            >
              <span>PORTAL UKM</span>
              <ArrowUpRight size={13} />
            </Link>

            <Link
              to="/admin/login"
              className="text-xs font-mono font-bold text-[#575A65] hover:text-[#0E0F11] hidden md:inline-block transition-colors"
            >
              ADMIN
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="border-b border-[#E2E1DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#E8E7E0] border border-[#D5D4CC] text-[10px] font-mono uppercase font-bold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                <span>REALTIME LIVE KALENDER KAMPUS 2026/2027</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-[#0E0F11] uppercase leading-[0.92]">
                PANGGUNG <br />
                <span className="text-stroke text-transparent underline decoration-[#EA580C] decoration-4">
                  GELORA KREATIF
                </span> <br />
                UNIVERSITAS.
              </h1>

              <p className="text-sm sm:text-base text-[#575A65] max-w-xl font-medium leading-relaxed pt-2">
                Pusat informasi resmi kegiatan mahasiswa Universitas Janabadra. Klik tanggal di kalender atau kartu kegiatan untuk melihat <strong>poster rincian acara</strong>, daftar instan tanpa login, dan klaim e-sertifikat sah.
              </p>
            </div>

            <div className="lg:col-span-4 bg-[#0E0F11] text-[#F4F4F0] p-6 rounded-xs border border-[#1E2024] relative shadow-2xl">
              <div className="absolute top-3 right-3 text-right">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#EA580C] font-bold">LIVE SYNC</span>
              </div>

              <div className="space-y-6 pt-2">
                <div>
                  <span className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-[#F4F4F0] block">
                    {events.length.toString().padStart(2, '0')}
                  </span>
                  <p className="text-xs font-mono uppercase text-[#A0A2AA] tracking-wider mt-1">
                    Agenda Terjadwal Realtime
                  </p>
                </div>

                <div className="h-px bg-[#262830]" />

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[#A0A2AA] block text-[10px] uppercase">STATUS SISTEM</span>
                    <span className="text-[#10B981] font-bold flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" /> TERHUBUNG
                    </span>
                  </div>
                  <div>
                    <span className="text-[#A0A2AA] block text-[10px] uppercase">SESI SCANNER</span>
                    <span className="text-[#F4F4F0] font-bold mt-0.5 block">24 JAM HARI-H</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setLookupOpen(true)}
                    className="w-full py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <span>CARI TIKET / SERTIFIKAT SAYA</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. BENTO GRID ARCHITECTURE (KIRI: KALENDER DINAMIS & TANGGAL TEPAT, KANAN: LIST AGENDA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Category Toggles & Reset Date Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E2E1DA]">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'SEMUA JADWAL' },
              { id: 'teknologi-riset', label: 'TEKNOLOGI & RISET' },
              { id: 'seminar-kuliah-tamu', label: 'SEMINAR' },
              { id: 'seni-budaya', label: 'SENI & BUDAYA' },
              { id: 'karir-kewirausahaan', label: 'KARIR' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-mono uppercase font-bold tracking-wider border transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#0E0F11] text-[#F4F4F0] border-[#0E0F11]'
                    : 'bg-[#F4F4F0] text-[#575A65] border-[#E2E1DA] hover:border-[#0E0F11] hover:text-[#0E0F11]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            {selectedDateFilter && (
              <button
                onClick={() => setSelectedDateFilter(null)}
                className="px-2.5 py-1 bg-[#EA580C] text-white font-bold text-[10px] uppercase flex items-center gap-1"
              >
                <span>FILTER TGL: {selectedDateFilter}</span>
                <X size={12} />
              </button>
            )}
            <span className="text-[#575A65]">
              MENAMPILKAN: <strong className="text-[#0E0F11]">{displayedEvents.length} KEGIATAN</strong>
            </span>
          </div>
        </div>

        {/* BENTO LAYOUT (4 vs 8 Kolom) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          
          {/* KOLOM KIRI: Kalender Dinamis Asli Sesuai Database */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#EBEAE4] border border-[#D5D4CC] p-5 rounded-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#D5D4CC] pb-3">
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#575A65]">BULAN AKTIF</span>
                  <h3 className="font-mono text-base font-black text-[#0E0F11]">
                    {monthNames[month]} {year}
                  </h3>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <button 
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-[#D5D4CC] border border-[#D5D4CC] text-[#0E0F11]"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-[#D5D4CC] border border-[#D5D4CC] text-[#0E0F11]"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Grid 7 Hari Kalender Dinamis */}
              <div className="grid grid-cols-7 gap-1 text-center font-mono">
                {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((day, idx) => (
                  <span key={idx} className="text-[10px] font-bold text-[#575A65] py-1">{day}</span>
                ))}

                {calendarGrid.map((cell, idx) => {
                  const hasRealEvent = cell.eventsOnDate.length > 0;
                  const isFilterActive = selectedDateFilter === cell.dateKey;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleDayClick(cell)}
                      disabled={!cell.isCurrentMonth}
                      className={`h-9 text-xs font-mono font-bold transition-all relative flex flex-col items-center justify-center ${
                        !cell.isCurrentMonth
                          ? 'text-[#C5C4BA] cursor-default'
                          : isFilterActive
                            ? 'bg-[#EA580C] text-white font-black scale-105 shadow-md'
                            : cell.isToday
                              ? 'bg-[#0E0F11] text-white font-black'
                              : 'text-[#0E0F11] hover:bg-[#DEDCD4]'
                      }`}
                    >
                      <span>{cell.dayNum}</span>
                      {/* Cukup tanda titik oranye untuk tanggal yang beragenda */}
                      {hasRealEvent && !isFilterActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] absolute bottom-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-[#D5D4CC] pt-3 text-[11px] font-mono text-[#575A65] space-y-1.5">
                <p className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#0E0F11] inline-block" />
                  <span>Blok Hitam = <strong>Hari Ini (5 Nov 2026)</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#EA580C] inline-block" />
                  <span>Titik Oranye = <strong>Ada Agenda Kegiatan</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#EA580C] inline-block" />
                  <span>Blok Oranye = <strong>Tanggal Sedang Difilter</strong></span>
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#F4F4F0] border-2 border-dashed border-[#D5D4CC] text-xs font-mono space-y-2">
              <span className="font-bold text-[#0E0F11] uppercase block">// PETUNJUK NAVIGASI KALENDER</span>
              <p className="text-[#575A65] text-[11px] leading-relaxed">
                Klik tanggal berlatar hitam untuk memfilter hanya agenda di tanggal tersebut dan melihat rincian poster. Klik kembali tanggal yang aktif untuk menampilkan semua agenda.
              </p>
            </div>
          </div>

          {/* KOLOM KANAN: Daftar Agenda Nyata (Tersinkron dengan Tanggal Kalender) */}
          <div className="lg:col-span-8 space-y-4">
            {loading ? (
              <div className="p-12 text-center border border-[#E2E1DA] font-mono text-xs text-[#575A65]">
                // MEMUAT DATA KEGIATAN SECARA REALTIME...
              </div>
            ) : displayedEvents.length === 0 ? (
              <div className="p-12 text-center bg-white border border-[#E2E1DA] font-mono text-xs text-[#575A65] space-y-2">
                <p className="font-bold text-[#0E0F11] uppercase">// TIDAK ADA KEGIATAN PADA TANGGAL INI</p>
                <p className="text-[11px]">
                  {selectedDateFilter ? `Tidak ada jadwal kegiatan yang berlangsung pada tanggal ${selectedDateFilter}.` : 'Belum ada kegiatan yang terdaftar.'}
                </p>
                {selectedDateFilter && (
                  <button
                    onClick={() => setSelectedDateFilter(null)}
                    className="px-3 py-1.5 bg-[#0E0F11] text-white uppercase text-[10px] font-bold mt-2"
                  >
                    TAMPILKAN SEMUA JADWAL
                  </button>
                )}
              </div>
            ) : (
              displayedEvents.map((ev, index) => {
                const isFull = ev.registeredCount >= ev.quota;
                const pctFilled = Math.min(100, Math.round((ev.registeredCount / ev.quota) * 100));
                const startDate = new Date(ev.startAt);

                return (
                  <article
                    key={ev.id}
                    className="relative bg-white border border-[#E2E1DA] p-6 hover:border-[#0E0F11] transition-all group"
                  >
                    <span className="absolute top-2 right-4 font-mono text-5xl font-black text-[#F4F4F0] select-none pointer-events-none group-hover:text-[#EAE9E2] transition-colors">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                      
                      {/* Thumbnail Poster */}
                      {ev.posterUrl && (
                        <div 
                          onClick={() => setDetailEvent(ev)}
                          className="w-24 h-32 shrink-0 bg-[#0E0F11] border border-[#0E0F11] overflow-hidden cursor-pointer group-hover:scale-105 transition-transform"
                        >
                          <img 
                            src={ev.posterUrl.startsWith('http') ? ev.posterUrl : `http://localhost:5000${ev.posterUrl}`} 
                            alt={ev.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}

                      {/* Info Kiri */}
                      <div 
                        onClick={() => setDetailEvent(ev)}
                        className="space-y-3 flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 bg-[#0E0F11] text-[#F4F4F0] font-mono text-[10px] font-bold uppercase tracking-wider">
                            {ev.category}
                          </span>
                          <span className="text-xs font-mono text-[#575A65]">
                            BY // {ev.organization}
                          </span>
                          {ev.isSessionActive && (
                            <span className="px-2 py-0.5 bg-[#ECFDF5] border border-[#10B981] text-[#065F46] font-mono text-[10px] font-bold uppercase flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                              SESI HARI-H AKTIF
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-[#0E0F11] uppercase tracking-tight leading-tight hover:text-[#EA580C] transition-colors">
                          {ev.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-[#575A65] font-normal leading-relaxed line-clamp-2">
                          {ev.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-1 text-xs font-mono text-[#575A65]">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#EA580C]" />
                            {startDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={13} className="text-[#EA580C]" />
                            {startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-[#EA580C]" />
                            {ev.location}
                          </span>
                        </div>
                      </div>

                      {/* Status Kuota & Action */}
                      <div className="w-full md:w-56 shrink-0 border-t md:border-t-0 md:border-l md:border-[#E2E1DA] pt-4 md:pt-0 md:pl-6 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex justify-between text-xs font-mono mb-1">
                            <span className="text-[#575A65] uppercase">KUOTA</span>
                            <span className="font-bold text-[#0E0F11]">{ev.registeredCount} / {ev.quota}</span>
                          </div>
                          <div className="w-full h-2 bg-[#E2E1DA] overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                pctFilled >= 90 ? 'bg-[#DC2626]' : pctFilled >= 70 ? 'bg-[#EA580C]' : 'bg-[#0E0F11]'
                              }`} 
                              style={{ width: `${pctFilled}%` }} 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={() => setDetailEvent(ev)}
                            className="w-full py-2 px-3 border border-[#0E0F11] hover:bg-[#E2E1DA] text-[#0E0F11] font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5"
                          >
                            <span>LIHAT POSTER & DETAIL</span>
                            <Info size={13} />
                          </button>

                          <button
                            onClick={() => setRegisterEvent(ev)}
                            disabled={isFull}
                            className={`w-full py-2.5 px-4 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                              isFull
                                ? 'bg-[#E2E1DA] text-[#8C8F9A] cursor-not-allowed'
                                : 'bg-[#EA580C] hover:bg-[#C2410C] active:translate-y-0.5 text-white shadow-xs'
                            }`}
                          >
                            <span>{isFull ? 'KUOTA PENUH' : 'DAFTAR INSTAN'}</span>
                            <ArrowUpRight size={14} />
                          </button>

                          {ev.isSessionActive && (
                            <Link
                              to={`/scan/${ev.id}`}
                              className="w-full py-1.5 px-3 bg-[#0E0F11] hover:bg-[#22242B] text-[#F4F4F0] font-mono text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Camera size={12} className="text-[#EA580C]" />
                              <span>MASUK SCANNER PANITIA</span>
                            </Link>
                          )}
                        </div>
                      </div>

                    </div>
                  </article>
                );
              })
            )}
          </div>

        </div>
      </section>

      {/* 4. MODAL DETAIL ACARA & POSTER LENGKAP */}
      {detailEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E0F11]/85 backdrop-blur-xs p-4">
          <div className="bg-[#F4F4F0] border-2 border-[#0E0F11] max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 space-y-6 p-6 sm:p-8">
            <div className="flex items-start justify-between border-b border-[#0E0F11] pb-4">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">
                  RINCIAN KEGIATAN KAMPUS // {detailEvent.category}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#0E0F11] uppercase tracking-tight mt-1">
                  {detailEvent.title}
                </h3>
                <p className="font-mono text-xs text-[#575A65]">Penyelenggara: <strong>{detailEvent.organization}</strong></p>
              </div>
              <button 
                onClick={() => setDetailEvent(null)}
                className="p-1 hover:bg-[#0E0F11] hover:text-white transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {detailEvent.posterUrl ? (
              <div className="relative aspect-video sm:aspect-21/9 bg-[#0E0F11] border border-[#0E0F11] overflow-hidden flex items-center justify-center">
                <img 
                  src={detailEvent.posterUrl.startsWith('http') ? detailEvent.posterUrl : `http://localhost:5000${detailEvent.posterUrl}`} 
                  alt={detailEvent.title}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="p-8 bg-[#EBEAE4] border border-[#D5D4CC] text-center font-mono text-xs text-[#575A65]">
                // POSTER RESMI DISEDIAKAN OLEH PANITIA {detailEvent.organization?.toUpperCase()}
              </div>
            )}

            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 bg-white border border-[#E2E1DA] space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#EA580C] block">DESKRIPSI LENGKAP ACARA</span>
                <p className="text-sm text-[#0E0F11] leading-relaxed whitespace-pre-line font-sans">
                  {detailEvent.description || 'Tidak ada deskripsi tambahan.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-[#E2E1DA]">
                  <span className="text-[10px] uppercase text-[#575A65] block">WAKTU KEGIATAN</span>
                  <p className="font-bold text-[#0E0F11] mt-0.5">
                    {new Date(detailEvent.startAt).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="p-3 bg-white border border-[#E2E1DA]">
                  <span className="text-[10px] uppercase text-[#575A65] block">LOKASI RUANGAN</span>
                  <p className="font-bold text-[#0E0F11] mt-0.5">{detailEvent.location}</p>
                </div>
                <div className="p-3 bg-white border border-[#E2E1DA]">
                  <span className="text-[10px] uppercase text-[#575A65] block">SISA KUOTA</span>
                  <p className="font-bold text-[#EA580C] mt-0.5">
                    {detailEvent.quota - detailEvent.registeredCount} Tiket Tersisa
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#0E0F11] flex items-center justify-end gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setDetailEvent(null)}
                className="px-4 py-2.5 border border-[#0E0F11] uppercase font-bold hover:bg-[#E2E1DA]"
              >
                TUTUP
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegisterEvent(detailEvent);
                  setDetailEvent(null);
                }}
                disabled={detailEvent.registeredCount >= detailEvent.quota}
                className="px-6 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white uppercase font-bold flex items-center gap-1.5"
              >
                <span>DAFTAR KEGIATAN INI</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL PENDAFTARAN CEPAT */}
      {registerEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E0F11]/80 backdrop-blur-xs p-4">
          <div className="bg-[#F4F4F0] border-2 border-[#0E0F11] max-w-lg w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 space-y-6">
            <div className="flex items-start justify-between border-b border-[#0E0F11] pb-4">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">
                  REGISTRASI TANPA LOGIN // ZERO FRICTION
                </span>
                <h3 className="text-xl font-black text-[#0E0F11] uppercase tracking-tight mt-1">
                  {registerEvent.title}
                </h3>
              </div>
              <button 
                onClick={() => setRegisterEvent(null)}
                className="p-1 hover:bg-[#0E0F11] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1 p-1 bg-[#E2E1DA]">
              <button
                type="button"
                onClick={() => setParticipantType('mahasiswa')}
                className={`py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  participantType === 'mahasiswa'
                    ? 'bg-[#0E0F11] text-white'
                    : 'text-[#575A65] hover:text-[#0E0F11]'
                }`}
              >
                <GraduationCap size={15} />
                <span>MAHASISWA</span>
              </button>
              <button
                type="button"
                onClick={() => setParticipantType('umum')}
                className={`py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  participantType === 'umum'
                    ? 'bg-[#0E0F11] text-white'
                    : 'text-[#575A65] hover:text-[#0E0F11]'
                }`}
              >
                <Building size={15} />
                <span>PESERTA UMUM</span>
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs font-bold uppercase text-[#0E0F11] mb-1">
                  NAMA LENGKAP *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Zaki Kurniawan"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#0E0F11] rounded-xs focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase text-[#0E0F11] mb-1">
                  EMAIL AKTIF (UNTUK SERTIFIKAT) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#0E0F11] rounded-xs focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                />
              </div>

              {participantType === 'mahasiswa' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-xs font-bold uppercase text-[#0E0F11] mb-1">
                        NIM MAHASISWA *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="21102045"
                        value={formData.nim}
                        onChange={e => setFormData({ ...formData, nim: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#0E0F11] rounded-xs focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs font-bold uppercase text-[#0E0F11] mb-1">
                        PROGRAM STUDI *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Informatika"
                        value={formData.prodi}
                        onChange={e => setFormData({ ...formData, prodi: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#0E0F11] rounded-xs focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-[#0E0F11] mb-1">
                      ASAL PERGURUAN TINGGI
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Universitas Janabadra (UJB)"
                      className="w-full px-3 py-2 text-xs font-mono bg-[#E2E1DA] border border-[#0E0F11] text-[#575A65] rounded-xs"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-[#0E0F11] mb-1">
                      ASAL INSTANSI / PERUSAHAAN *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="PT Media Kreasi Nusantara"
                      value={formData.instansi}
                      onChange={e => setFormData({ ...formData, instansi: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#0E0F11] rounded-xs focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-[#0E0F11] mb-1">
                      PROFESI / JABATAN
                    </label>
                    <input
                      type="text"
                      placeholder="Software Engineer / Pengamat"
                      value={formData.profesi}
                      onChange={e => setFormData({ ...formData, profesi: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#0E0F11] rounded-xs focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-[#0E0F11] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRegisterEvent(null)}
                  className="px-4 py-2 font-mono text-xs font-bold uppercase border border-[#0E0F11] hover:bg-[#E2E1DA]"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-mono text-xs font-bold uppercase bg-[#EA580C] text-white hover:bg-[#C2410C]"
                >
                  {submitting ? 'MEMPROSES TIKET...' : 'TERBITKAN BARCODE TIKET'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL TIKET DIGITAL BOARDING PASS NOTCH */}
      {ticketData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E0F11]/85 backdrop-blur-xs p-4">
          <div className="bg-white border-2 border-[#0E0F11] max-w-md w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95">
            <div className="bg-[#0E0F11] text-white p-5 space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#EA580C] font-black">
                UNIVERSITAS JANABADRA // BOARDING PASS
              </span>
              <h3 className="text-lg font-black uppercase tracking-tight">{ticketData.title}</h3>
              <p className="font-mono text-xs text-[#A0A2AA]">{ticketData.date} • {ticketData.time} WIB</p>
            </div>

            <div className="relative flex items-center justify-between px-6 py-2 bg-white">
              <div className="w-5 h-5 rounded-full bg-[#0E0F11] -ml-9 border border-[#0E0F11]" />
              <div className="w-full border-t-2 border-dashed border-[#D5D4CC]" />
              <div className="w-5 h-5 rounded-full bg-[#0E0F11] -mr-9 border border-[#0E0F11]" />
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-[#F4F4F0] border border-[#E2E1DA] font-mono text-xs space-y-1">
                <span className="text-[10px] text-[#575A65] uppercase">PEMEGANG TIKET</span>
                <p className="font-black text-[#0E0F11] text-sm">{ticketData.name}</p>
                <p className="text-[11px] text-[#EA580C]">{ticketData.identifier}</p>
                <p className="text-[10px] text-[#575A65] pt-1">LOKASI: {ticketData.location}</p>
              </div>

              <div className="p-4 bg-[#0E0F11] text-center space-y-2">
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#EA580C] font-bold">
                  VALIDASI MEJA REGISTRASI
                </p>
                <div className="h-14 flex items-center justify-center gap-1 px-4 bg-white py-1">
                  {Array.from({ length: 44 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-10 bg-black ${i % 3 === 0 ? 'w-1.5' : i % 7 === 0 ? 'w-2' : 'w-0.5'}`} 
                    />
                  ))}
                </div>
                <p className="font-mono text-xs font-black tracking-widest text-[#F4F4F0] pt-1">
                  {ticketData.ticketCode}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => alert(`Tiket ${ticketData.ticketCode} berhasil disimpan ke memori!`)}
                  className="flex-1 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-mono text-xs font-bold uppercase tracking-wider"
                >
                  SIMPAN TIKET
                </button>
                <button
                  onClick={() => setTicketData(null)}
                  className="px-4 py-2.5 border border-[#0E0F11] font-mono text-xs font-bold uppercase hover:bg-[#E2E1DA]"
                >
                  TUTUP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL LOOKUP TIKET & E-SERTIFIKAT MANDIRI */}
      {lookupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E0F11]/80 backdrop-blur-xs p-4">
          <div className="bg-[#F4F4F0] border-2 border-[#0E0F11] max-w-xl w-full p-6 sm:p-8 animate-in zoom-in-95 space-y-4">
            <div className="flex items-start justify-between border-b border-[#0E0F11] pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">
                  SELF SERVICE PORTAL // PUBLIC
                </span>
                <h3 className="text-xl font-black text-[#0E0F11] uppercase tracking-tight">
                  CARI TIKET & UNDUH E-SERTIFIKAT
                </h3>
              </div>
              <button onClick={() => setLookupOpen(false)} className="p-1 hover:bg-[#0E0F11] hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLookup} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="MASUKKAN NIM / EMAIL PENDAFTARAN..."
                value={lookupQuery}
                onChange={e => setLookupQuery(e.target.value)}
                className="flex-1 px-3.5 py-2 font-mono text-xs bg-white border border-[#0E0F11] rounded-xs focus:outline-none"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-5 py-2 font-mono text-xs font-bold uppercase bg-[#0E0F11] text-white hover:bg-[#EA580C]"
              >
                {lookupLoading ? '...' : 'CARI'}
              </button>
            </form>

            {lookupError && (
              <div className="p-3 bg-[#FEE2E2] border border-[#DC2626] font-mono text-xs text-[#991B1B]">
                {lookupError}
              </div>
            )}

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {lookupResults.map(item => (
                <div key={item.registrationId} className="p-4 bg-white border border-[#E2E1DA] space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-[#EA580C] block">
                        {item.ticketCode}
                      </span>
                      <h4 className="font-bold text-xs uppercase text-[#0E0F11]">{item.event.title}</h4>
                      <p className="font-mono text-[11px] text-[#575A65]">
                        {item.name} {item.nim ? `(${item.nim})` : `(${item.institution})`}
                      </p>
                    </div>
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 ${
                      item.isAttended ? 'bg-[#ECFDF5] text-[#065F46] border border-[#10B981]' : 'bg-[#E2E1DA] text-[#575A65]'
                    }`}>
                      {item.isAttended ? 'STATUS: HADIR' : 'STATUS: TERDAFTAR'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#E2E1DA] flex items-center justify-between">
                    {item.isAttended ? (
                      <a
                        href={`http://localhost:5000/api/certificates/public/${item.registrationId}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5"
                      >
                        <Award size={13} />
                        <span>UNDUH E-SERTIFIKAT (PDF)</span>
                      </a>
                    ) : (
                      <span className="font-mono text-[10px] text-[#575A65]">
                        * Presensi di meja panitia untuk mengaktifkan e-sertifikat
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setTicketData({
                          ticketCode: item.ticketCode,
                          title: item.event.title,
                          date: new Date(item.event.startAt).toLocaleDateString('id-ID'),
                          time: new Date(item.event.startAt).toLocaleTimeString('id-ID'),
                          location: item.event.location,
                          name: item.name,
                          identifier: item.nim ? `NIM ${item.nim}` : item.institution
                        });
                        setLookupOpen(false);
                      }}
                      className="px-3 py-1.5 border border-[#0E0F11] font-mono text-xs font-bold uppercase hover:bg-[#0E0F11] hover:text-white"
                    >
                      LIHAT BARCODE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. FOOTER */}
      <footer className="border-t border-[#E2E1DA] py-8 bg-[#EBEAE4] text-xs font-mono text-[#575A65]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-bold text-[#0E0F11]">UNIVERSITAS JANABADRA YOGYAKARTA</p>
            <p className="text-[11px]">Sistem Kalender Kegiatan Kampus & Otomatisasi Rekap Presensi LPJ</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold">
            <Link to="/penyelenggara/login" className="hover:text-[#EA580C]">PORTAL PENGURUS UKM</Link>
            <span>•</span>
            <Link to="/admin/login" className="hover:text-[#EA580C]">PORTAL ADMIN DEKANAT</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
