import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import { 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  Award, 
  X,
  Building,
  GraduationCap,
  Download,
  Camera,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';

export const MahasiswaView = ({ onOpenScannerWithEvent }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(5);

  // Modal Register State
  const [registerModalEvent, setRegisterModalEvent] = useState(null);
  const [participantType, setParticipantType] = useState('mahasiswa');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nim: '',
    prodi: 'Teknik Informatika',
    instansi: '',
    profesi: 'Karyawan Swasta'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Hasil Tiket (Boarding Pass Notch)
  const [ticketModalData, setTicketModalData] = useState(null);

  // Modal Cari Tiket & Unduh Sertifikat Mandiri
  const [lookupModalOpen, setLookupModalOpen] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResults, setLookupResults] = useState([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);

  // Ambil data event dari backend API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/events');
      if (res.success) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data event:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerModalEvent) return;

    try {
      setIsSubmitting(true);
      const payload = {
        participantType,
        name: formData.name,
        email: formData.email,
        nim: participantType === 'mahasiswa' ? formData.nim : null,
        prodi: participantType === 'mahasiswa' ? formData.prodi : null,
        institution: participantType === 'mahasiswa' ? 'Universitas Janabadra' : formData.instansi,
        profession: participantType === 'umum' ? formData.profesi : null
      };

      const res = await apiFetch(`/events/${registerModalEvent.id}/register-public`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        setTicketModalData({
          ticketCode: res.data.ticketCode,
          eventTitle: registerModalEvent.title,
          eventTime: `${new Date(registerModalEvent.startAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
          eventLocation: registerModalEvent.location,
          participantName: res.data.name,
          participantType: participantType === 'mahasiswa' ? `Mahasiswa (NIM: ${res.data.nim || '-'})` : `Umum (${res.data.institution || '-'})`
        });
        setRegisterModalEvent(null);
        fetchEvents(); // refresh kuota
      }
    } catch (err) {
      alert(err.message || 'Gagal mendaftar kegiatan');
    } finally {
      setIsSubmitting(false);
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
        setLookupError('Tidak ditemukan tiket dengan NIM / Email tersebut.');
      }
    } catch (err) {
      setLookupError(err.message || 'Gagal mencari tiket');
    } finally {
      setLookupLoading(false);
    }
  };

  // Kalender Grid Mock November 2026
  const calendarDays = [
    { num: 26, isPrev: true }, { num: 27, isPrev: true }, { num: 28, isPrev: true }, { num: 29, isPrev: true }, { num: 30, isPrev: true }, { num: 31, isPrev: true }, { num: 1 },
    { num: 2 }, { num: 3 }, { num: 4 }, { num: 5, isToday: true, hasEvent: true }, { num: 6 }, { num: 7 }, { num: 8 },
    { num: 9 }, { num: 10 }, { num: 11 }, { num: 12, hasEvent: true }, { num: 13 }, { num: 14 }, { num: 15 },
    { num: 16 }, { num: 17 }, { num: 18 }, { num: 19, hasEvent: true }, { num: 20, hasEvent: true }, { num: 21 }, { num: 22, hasEvent: true },
    { num: 23 }, { num: 24 }, { num: 25 }, { num: 26 }, { num: 27, hasEvent: true }, { num: 28, hasEvent: true }, { num: 29 },
    { num: 30 }, { num: 1, isNext: true }, { num: 2, isNext: true }, { num: 3, isNext: true }, { num: 4, isNext: true }, { num: 5, isNext: true }, { num: 6, isNext: true }
  ];

  return (
    <div className="space-y-6">
      {/* 1. TOP HERO BANNER (Persis Banner mahasiswa.jpg) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 text-white shadow-lg">
        {/* Dekorasi Wave */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold text-blue-100 border border-white/20">
              <Sparkles size={12} className="text-amber-300" />
              <span>Portal Resmi Kalender Kampus &bull; Universitas Janabadra</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              Jelajahi & Daftar Kegiatan Kampus Tanpa Ribet
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Daftar instan tanpa perlu login. Dapatkan tiket barcode resmi untuk presensi di lokasi dan klaim e-sertifikat sah secara otomatis!
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <button
                onClick={() => setLookupModalOpen(true)}
                className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 active:scale-95 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Search size={14} />
                <span>Cari Tiket & E-Sertifikat Saya</span>
              </button>
            </div>
          </div>

          {/* Logo UJB & Badge */}
          <div className="hidden lg:flex flex-col items-center justify-center p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center w-56 shrink-0">
            <img src="/ujb.png" alt="Logo UJB" className="w-16 h-16 object-contain mb-2 drop-shadow-md" onError={(e) => { e.target.style.display = 'none'; }} />
            <h4 className="text-xs font-bold leading-tight">Universitas Janabadra</h4>
            <p className="text-[10px] text-blue-100 mt-0.5">Yogyakarta</p>
            <span className="mt-2 text-[9px] uppercase font-bold px-2 py-0.5 bg-amber-400 text-slate-900 rounded-full font-mono">
              Sistem Terverifikasi
            </span>
          </div>
        </div>
      </div>

      {/* 2. SPLIT-VIEW: KALENDER BULANAN (KIRI) & AGENDA EVENT (KANAN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SISI KIRI: Kalender Bulanan Interaktif */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">November 2026</h3>
              <p className="text-[11px] text-slate-500">Pilih tanggal untuk melihat jadwal</p>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Grid Hari Kalender */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-slate-400 py-1">{d}</span>
            ))}

            {calendarDays.map((d, idx) => {
              const isSelected = selectedDay === d.num && !d.isPrev && !d.isNext;
              return (
                <button
                  key={idx}
                  onClick={() => !d.isPrev && !d.isNext && setSelectedDay(d.num)}
                  disabled={d.isPrev || d.isNext}
                  className={`relative h-9 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                    d.isPrev || d.isNext 
                      ? 'text-slate-300' 
                      : isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105'
                        : d.isToday
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{d.num}</span>
                  {d.hasEvent && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute bottom-1 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Keterangan Kategori Indikator */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kategori Kegiatan</span>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Teknologi</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Seminar</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Olahraga</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Seni Budaya</span>
            </div>
          </div>
        </div>

        {/* SISI KANAN: Daftar Agenda Kegiatan Nyata dari Database */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Agenda Kegiatan Kampus Janabadra</h3>
              <p className="text-xs text-slate-500">Pendaftaran instan tanpa login untuk Mahasiswa dan Umum</p>
            </div>
            <button
              onClick={() => setLookupModalOpen(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <FileText size={14} />
              <span>Cari Tiket Saya</span>
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80">
              <p className="text-xs font-semibold text-slate-500">Memuat agenda kegiatan kampus...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80">
              <p className="text-xs font-semibold text-slate-500">Belum ada agenda kegiatan yang tayang.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((ev) => {
                const isFull = ev.registeredCount >= ev.quota;
                const pctFilled = Math.min(100, Math.round((ev.registeredCount / ev.quota) * 100));
                const startDate = new Date(ev.startAt);

                return (
                  <div
                    key={ev.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {ev.category}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          Penyelenggara: {ev.organization}
                        </span>
                        {ev.isSessionActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                            SESI 24 JAM HARI-H AKTIF
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                        {ev.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {ev.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          {startDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} className="text-slate-400" />
                          {startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-slate-400" />
                          {ev.location}
                        </span>
                      </div>
                    </div>

                    {/* Kuota & Action Button */}
                    <div className="w-full md:w-52 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5 flex flex-col justify-center space-y-2.5">
                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                          <span>Kuota Peserta</span>
                          <span>{ev.registeredCount} / {ev.quota} ({pctFilled}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              pctFilled >= 90 ? 'bg-red-500' : pctFilled >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${pctFilled}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => setRegisterModalEvent(ev)}
                          disabled={isFull}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                            isFull 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                              : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-blue-600/20'
                          }`}
                        >
                          <span>{isFull ? 'Kuota Penuh' : 'Daftar Tanpa Login'}</span>
                          <ArrowRight size={13} />
                        </button>

                        {/* Tombol Masuk Petugas Scanner (Kontekstual saat sesi hari-H aktif) */}
                        {ev.isSessionActive && onOpenScannerWithEvent && (
                          <button
                            onClick={() => onOpenScannerWithEvent(ev)}
                            className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                          >
                            <Camera size={12} className="text-amber-400" />
                            <span>Masuk Sebagai Petugas Scanner</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. MODAL REGISTRASI CEPAT TANPA LOGIN (ZERO FRICTION) */}
      {registerModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Pendaftaran Cepat (Tanpa Akun)</span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{registerModalEvent.title}</h3>
              </div>
              <button 
                onClick={() => setRegisterModalEvent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Pembeda Tab: Mahasiswa vs Umum */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setParticipantType('mahasiswa')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  participantType === 'mahasiswa' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <GraduationCap size={14} />
                <span>Mahasiswa</span>
              </button>
              <button
                type="button"
                onClick={() => setParticipantType('umum')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  participantType === 'umum' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building size={14} />
                <span>Peserta Umum</span>
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Zaki Kurniawan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Aktif (untuk Tiket & E-Sertifikat) *</label>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-600 outline-hidden"
                />
              </div>

              {participantType === 'mahasiswa' ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">NIM Mahasiswa *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 21102045"
                        value={formData.nim}
                        onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-600 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Program Studi *</label>
                      <input
                        type="text"
                        required
                        placeholder="Informatika / Manajemen"
                        value={formData.prodi}
                        onChange={(e) => setFormData({ ...formData, prodi: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-600 outline-hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Asal Kampus</label>
                    <input
                      type="text"
                      disabled
                      value="Universitas Janabadra (UJB)"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Asal Instansi / Perusahaan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: PT Bangun Negeri / Umum"
                      value={formData.instansi}
                      onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-600 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Profesi / Jabatan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Web Developer / Staf Administrasi"
                      value={formData.profesi}
                      onChange={(e) => setFormData({ ...formData, profesi: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-600 outline-hidden"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRegisterModalEvent(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20"
                >
                  {isSubmitting ? 'Menerbitkan Tiket...' : 'Konfirmasi & Dapatkan Barcode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL HASIL TIKET DENGAN BARCODE INSTAN (BOARDING PASS NOTCH) */}
      {ticketModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Universitas Janabadra</span>
              <h3 className="text-base font-extrabold">E-TIKET KEGIATAN KAMPUS</h3>
              <p className="text-[11px] text-blue-100">Simpan atau tangkap layar (screenshot) tiket ini untuk presensi di lokasi</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kegiatan</span>
                <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{ticketModalData.eventTitle}</h4>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Clock size={13} /> {ticketModalData.eventTime}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <MapPin size={13} /> {ticketModalData.eventLocation}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                <p className="text-slate-500 text-[11px]">Nama Peserta:</p>
                <p className="font-extrabold text-slate-900">{ticketModalData.participantName}</p>
                <p className="text-[11px] text-blue-700 font-semibold">{ticketModalData.participantType}</p>
              </div>

              {/* Barcode Mockup Nyata Kontras */}
              <div className="text-center p-4 bg-slate-100 rounded-2xl border border-dashed border-slate-300 space-y-2">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Barcode Tiket Resmi</p>
                <div className="h-16 flex items-center justify-center gap-1 px-4 bg-white rounded-lg border border-slate-200">
                  {Array.from({ length: 42 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-12 bg-slate-900 ${i % 3 === 0 ? 'w-1.5' : i % 5 === 0 ? 'w-2' : 'w-0.5'}`} 
                    />
                  ))}
                </div>
                <p className="font-mono text-xs font-black tracking-widest text-slate-900 pt-1">
                  {ticketModalData.ticketCode}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => alert(`Tiket ${ticketModalData.ticketCode} berhasil disimpan!`)}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20"
                >
                  Simpan / Unduh Tiket
                </button>
                <button
                  onClick={() => setTicketModalData(null)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL CARI TIKET & DOWNLOAD SERTIFIKAT MANDIRI */}
      {lookupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Pencarian Mandiri</span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">Cari Tiket & Unduh E-Sertifikat</h3>
              </div>
              <button 
                onClick={() => setLookupModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLookup} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Masukkan NIM atau Email pendaftaran Anda..."
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-600 outline-hidden"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                {lookupLoading ? 'Mencari...' : 'Cari'}
              </button>
            </form>

            {lookupError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                {lookupError}
              </div>
            )}

            {/* Hasil Pencarian Tiket */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {lookupResults.map((t) => (
                <div key={t.registrationId} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600">{t.ticketCode}</span>
                      <h4 className="text-xs font-extrabold text-slate-900">{t.event.title}</h4>
                      <p className="text-[10px] text-slate-500">Peserta: {t.name} {t.nim ? `(${t.nim})` : ''}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.isAttended ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {t.isAttended ? 'Hadir' : 'Terdaftar'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    {t.isAttended ? (
                      <a
                        href={`http://localhost:5000/api/certificates/public/${t.registrationId}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <Award size={13} />
                        <span>Unduh E-Sertifikat PDF</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        Presensi di meja panitia untuk membuka e-sertifikat
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setTicketModalData({
                          ticketCode: t.ticketCode,
                          eventTitle: t.event.title,
                          eventTime: new Date(t.event.startAt).toLocaleString('id-ID'),
                          eventLocation: t.event.location,
                          participantName: t.name,
                          participantType: t.participantType === 'mahasiswa' ? `Mahasiswa (${t.nim})` : `Umum (${t.institution || '-'})`
                        });
                        setLookupModalOpen(false);
                      }}
                      className="px-3 py-1.5 border border-slate-300 hover:bg-white text-slate-700 rounded-lg text-xs font-bold"
                    >
                      Buka Barcode Tiket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
