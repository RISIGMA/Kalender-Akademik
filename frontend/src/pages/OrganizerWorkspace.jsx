import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { 
  Calendar, 
  Clock, 
  Users, 
  UserPlus, 
  Plus, 
  FileSpreadsheet, 
  Download, 
  Award, 
  Camera, 
  MapPin, 
  Trash2, 
  Building2, 
  LogOut, 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  ArrowUpRight,
  Image,
  Lock,
  Globe
} from 'lucide-react';

export const OrganizerWorkspace = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Tab Kelola Event: Milik Saya vs Seluruh Kampus (Multi-tenant)
  const [eventViewTab, setEventViewTab] = useState('mine'); // 'mine' | 'all'

  // Modal Staff Scanner State
  const [selectedEventForStaff, setSelectedEventForStaff] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [newNim, setNewNim] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Petugas Meja Registrasi');

  // Form Pengajuan Kegiatan Baru (Mendukung Upload File Poster)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    categoryId: '1',
    startAt: '',
    endAt: '',
    quota: 100,
    proposalHardFile: 'Tersedia di Meja Admin'
  });
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [creating, setCreating] = useState(false);

  // Spreadsheet State
  const [spreadsheetEvent, setSpreadsheetEvent] = useState(null);
  const [spreadsheetData, setSpreadsheetData] = useState([]);
  const [spreadsheetLoading, setSpreadsheetLoading] = useState(false);

  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      navigate('/penyelenggara/login');
      return;
    }
    const parsed = JSON.parse(rawUser);
    setUser(parsed);
    fetchEvents(parsed);

    // Polling Realtime interval
    const interval = setInterval(() => {
      fetchEvents(parsed, true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async (currentUser, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await apiFetch('/events');
      if (res.success) {
        setEvents(res.data);
        if (res.data.length > 0 && !spreadsheetEvent) {
          // Pilih event milik sendiri jika ada
          const myFirst = res.data.find(e => e.organizationId === currentUser?.organization?.id) || res.data[0];
          setSpreadsheetEvent(myFirst);
          loadSpreadsheet(myFirst.id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/penyelenggara/login');
  };

  const loadSpreadsheet = async (eventId) => {
    try {
      setSpreadsheetLoading(true);
      const res = await apiFetch(`/events/${eventId}/spreadsheet`);
      if (res.success) {
        setSpreadsheetData(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSpreadsheetLoading(false);
    }
  };

  const loadStaff = async (eventId) => {
    try {
      const res = await apiFetch(`/events/${eventId}/scanners`);
      if (res.success) {
        setStaffList(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!selectedEventForStaff || !newNim || !newName) return;

    try {
      const res = await apiFetch(`/events/${selectedEventForStaff.id}/scanners`, {
        method: 'POST',
        body: JSON.stringify({ nim: newNim, name: newName, roleName: newRole })
      });
      if (res.success) {
        setStaffList([res.data, ...staffList]);
        setNewNim('');
        setNewName('');
        alert(`Panitia ${newName} (${newNim}) berhasil didaftarkan sebagai petugas scanner.`);
      }
    } catch (err) {
      alert(err.message || 'Gagal mendaftarkan panitia scanner');
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Hapus hak scan panitia ini?')) return;
    try {
      await apiFetch(`/scanners/${id}`, { method: 'DELETE' });
      setStaffList(staffList.filter(s => s.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);

      const formData = new FormData();
      formData.append('title', newEvent.title);
      formData.append('description', newEvent.description);
      formData.append('location', newEvent.location);
      formData.append('categoryId', newEvent.categoryId);
      formData.append('startAt', newEvent.startAt);
      formData.append('endAt', newEvent.endAt);
      formData.append('quota', newEvent.quota);
      formData.append('proposalHardFile', newEvent.proposalHardFile);
      if (posterFile) {
        formData.append('poster', posterFile);
      }

      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menerbitkan acara');

      alert('Kegiatan dan poster resmi berhasil diterbitkan ke Kalender Kampus!');
      setNewEvent({
        title: '',
        description: '',
        location: '',
        categoryId: '1',
        startAt: '',
        endAt: '',
        quota: 100,
        proposalHardFile: 'Tersedia di Meja Admin'
      });
      setPosterFile(null);
      setPosterPreview(null);
      fetchEvents(user);
      setActiveMenu('events');
    } catch (err) {
      alert(err.message || 'Gagal membuat kegiatan');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Hapus kegiatan ini dari kalender?')) return;
    try {
      await apiFetch(`/events/${id}`, { method: 'DELETE' });
      alert('Kegiatan berhasil dihapus.');
      fetchEvents(user);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleIssueCertificates = async (eventId) => {
    if (!window.confirm('Terbitkan e-sertifikat sah untuk semua peserta yang telah hadir?')) return;
    try {
      const res = await apiFetch(`/events/${eventId}/issue-certificates`, { method: 'POST' });
      alert(res.message);
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter Multi-tenant: Acara milik organisasi user ini vs acara organisasi lain
  const myEvents = events.filter(e => e.organizationId === user?.organization?.id);
  const otherEvents = events.filter(e => e.organizationId !== user?.organization?.id);

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-[#0E0F11] flex flex-col md:flex-row font-sans selection:bg-[#EA580C] selection:text-white">
      
      {/* 1. ARCHITECTURAL SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#0E0F11] text-[#F4F4F0] p-6 flex flex-col justify-between shrink-0 border-r border-[#1E2024]">
        <div className="space-y-8">
          
          <div className="flex items-center gap-3 pb-5 border-b border-[#22242C]">
            <span className="w-3 h-3 bg-[#EA580C]" />
            <div>
              <h1 className="font-mono text-sm font-black uppercase text-white tracking-widest leading-none">
                UNIVERSITAS
              </h1>
              <h2 className="font-mono text-xs font-bold text-[#EA580C] tracking-wider mt-0.5">
                JANABADRA UKM
              </h2>
            </div>
          </div>

          <nav className="space-y-1 font-mono text-xs">
            {[
              { id: 'dashboard', label: 'DASHBOARD METRIK', icon: Layers },
              { id: 'submit', label: 'AJUKAN ACARA & POSTER', icon: Send },
              { id: 'events', label: 'KELOLA KEGIATAN', icon: Calendar },
              { id: 'staff', label: 'STAF SCANNER (NIM)', icon: UserPlus },
              { id: 'spreadsheet', label: 'SPREADSHEET PRESENSI', icon: FileSpreadsheet },
              { id: 'profile', label: 'PROFIL LEMBAGA', icon: Building2 },
            ].map(m => {
              const Icon = m.icon;
              const active = activeMenu === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMenu(m.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 font-bold uppercase tracking-wider text-left transition-all ${
                    active 
                      ? 'bg-[#EA580C] text-white' 
                      : 'text-[#A0A2AA] hover:bg-[#181A20] hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-[#22242C] space-y-3 font-mono text-xs">
          <div className="p-3 bg-[#181A20] border border-[#262830]">
            <span className="text-[9px] uppercase tracking-widest text-[#EA580C] font-bold block">
              ORGANISASI AKTIF
            </span>
            <p className="font-bold text-white text-[11px] truncate">{user?.organization?.name || user?.name}</p>
            <p className="text-[10px] text-[#A0A2AA] truncate">{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 border border-[#2E313B] text-[#A0A2AA] hover:text-[#EF4444] hover:border-[#EF4444] transition-colors uppercase font-bold"
          >
            <LogOut size={14} />
            <span>KELUAR SESI</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTENT */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E1DA] mb-8">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#EA580C]">
              MULTI-TENANT WORKSPACE // {user?.organization?.name || 'UKM UJB'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#0E0F11]">
              PORTAL KEPANITIAAN KEGIATAN KAMPUS
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-3.5 py-2 border border-[#0E0F11] font-mono text-xs font-bold uppercase hover:bg-[#E2E1DA] transition-colors flex items-center gap-1.5"
            >
              <span>LIHAT KALENDER PUBLIK</span>
              <ArrowUpRight size={13} />
            </Link>
            <button
              onClick={() => setActiveMenu('submit')}
              className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white font-mono text-xs font-bold uppercase transition-colors"
            >
              + AJUKAN ACARA BARU
            </button>
          </div>
        </div>

        {/* VIEW 1: DASHBOARD METRIK */}
        {activeMenu === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0E0F11] text-white p-5 border border-[#1E2024] relative">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#EA580C] font-bold">AGENDA SAYA</span>
                <p className="font-mono text-4xl font-black mt-2 text-white">{myEvents.length}</p>
                <p className="font-mono text-[11px] text-[#A0A2AA] mt-1">Kegiatan Organisasi Anda</p>
              </div>

              <div className="bg-white border border-[#E2E1DA] p-5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#575A65] font-bold">TOTAL PENDAFTAR SAYA</span>
                <p className="font-mono text-4xl font-black mt-2 text-[#0E0F11]">
                  {myEvents.reduce((acc, curr) => acc + (curr.registeredCount || 0), 0)}
                </p>
                <p className="font-mono text-[11px] text-[#575A65] mt-1">Peserta Terdaftar</p>
              </div>

              <div className="bg-white border border-[#E2E1DA] p-5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#10B981] font-bold">SESI AKTIF HARI-H</span>
                <p className="font-mono text-4xl font-black mt-2 text-[#10B981]">
                  {myEvents.filter(e => e.isSessionActive).length}
                </p>
                <p className="font-mono text-[11px] text-[#575A65] mt-1">Scanner 24 Jam Terbuka</p>
              </div>

              <div className="bg-white border border-[#E2E1DA] p-5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#575A65] font-bold">KEGIATAN KAMPUS LAIN</span>
                <p className="font-mono text-4xl font-black mt-2 text-[#0E0F11]">{otherEvents.length}</p>
                <p className="font-mono text-[11px] text-[#575A65] mt-1">Hanya Lihat (Read-Only)</p>
              </div>
            </div>

            {/* Quick Actions List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white border border-[#E2E1DA] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-sm font-black uppercase text-[#0E0F11]">
                    KEGIATAN ORGANISASI ANDA // DAPAT DIKELOLA
                  </h3>
                  <span className="font-mono text-xs text-[#EA580C] font-bold">{myEvents.length} EVENT</span>
                </div>

                <div className="divide-y divide-[#E2E1DA]">
                  {myEvents.length === 0 ? (
                    <div className="py-6 text-center font-mono text-xs text-[#575A65]">
                      Organisasi Anda belum memiliki kegiatan. Klik "Ajukan Acara Baru" di atas.
                    </div>
                  ) : (
                    myEvents.map(ev => (
                      <div key={ev.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
                        <div>
                          <h4 className="font-bold text-[#0E0F11] uppercase">{ev.title}</h4>
                          <p className="text-[11px] text-[#575A65]">
                            {new Date(ev.startAt).toLocaleString('id-ID')} &bull; Kuota: {ev.registeredCount}/{ev.quota}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => { setSelectedEventForStaff(ev); loadStaff(ev.id); setActiveMenu('staff'); }}
                            className="px-2.5 py-1 bg-[#0E0F11] text-white text-[11px] uppercase font-bold hover:bg-[#EA580C]"
                          >
                            Staf Scanner ({ev.scannersCount || 0})
                          </button>
                          <button
                            onClick={() => { setSpreadsheetEvent(ev); loadSpreadsheet(ev.id); setActiveMenu('spreadsheet'); }}
                            className="px-2.5 py-1 border border-[#0E0F11] text-[11px] uppercase font-bold hover:bg-[#E2E1DA]"
                          >
                            LPJ Excel
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="lg:col-span-4 bg-[#EBEAE4] border border-[#D5D4CC] p-6 font-mono text-xs space-y-3">
                <span className="font-bold uppercase text-[#0E0F11] block">// HAK MULTI-TENANT</span>
                <p className="text-[#575A65] text-[11px] leading-relaxed">
                  Sistem menerapkan batas isolasi data: Anda hanya dapat mengubah, menghapus, atau melihat data tiket pendaftar kegiatan milik <strong>{user?.organization?.name}</strong>.
                </p>
                <p className="text-[#575A65] text-[11px] leading-relaxed">
                  Kegiatan UKM lain dapat Anda pantau jadwalnya agar tidak terjadi bentrok acara.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: AJUKAN ACARA & UPLOAD POSTER RESMI */}
        {activeMenu === 'submit' && (
          <div className="max-w-2xl bg-white border-2 border-[#0E0F11] p-6 sm:p-8 space-y-6">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#EA580C]">
                PENGAJUAN RESMI UKM // MULTI-TENANT
              </span>
              <h3 className="text-xl font-black uppercase tracking-tight text-[#0E0F11] mt-1">
                FORMULIR KEGIATAN & UPLOAD POSTER
              </h3>
              <p className="text-xs font-mono text-[#575A65]">
                Poster yang diupload akan otomatis tampil di kalender publik saat diklik oleh mahasiswa.
              </p>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block uppercase font-bold text-[#0E0F11] mb-1">NAMA KEGIATAN *</label>
                <input
                  type="text"
                  required
                  placeholder="Seminar Nasional AI & Cyber Security Janabadra"
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#0E0F11] focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-[#0E0F11] mb-1">DESKRIPSI LENGKAP & RUNDOWN</label>
                <textarea
                  rows="3"
                  placeholder="Tuliskan tujuan, pemateri, benefit (SKPI/Sertifikat), dan rundown..."
                  value={newEvent.description}
                  onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#0E0F11] focus:outline-none"
                />
              </div>

              {/* Upload Poster Gambar */}
              <div className="p-4 bg-[#F4F4F0] border-2 border-dashed border-[#D5D4CC] space-y-3">
                <label className="block uppercase font-bold text-[#0E0F11]">
                  UPLOAD POSTER GAMBAR ACARA (JPG, PNG, WEBP - MAX 5MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePosterChange}
                  className="w-full text-xs font-mono file:mr-4 file:py-1.5 file:px-3 file:border-0 file:font-mono file:text-xs file:font-bold file:bg-[#0E0F11] file:text-white hover:file:bg-[#EA580C]"
                />
                {posterPreview && (
                  <div className="mt-2 w-36 h-48 border border-[#0E0F11] bg-black overflow-hidden">
                    <img src={posterPreview} alt="Preview Poster" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-[#0E0F11] mb-1">KATEGORI *</label>
                  <select
                    value={newEvent.categoryId}
                    onChange={e => setNewEvent({ ...newEvent, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#0E0F11] focus:outline-none"
                  >
                    <option value="1">Teknologi & Riset</option>
                    <option value="2">Seminar & Kuliah Tamu</option>
                    <option value="3">Seni & Budaya</option>
                    <option value="4">Karir & Kewirausahaan</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase font-bold text-[#0E0F11] mb-1">TARGET KUOTA *</label>
                  <input
                    type="number"
                    min="10"
                    value={newEvent.quota}
                    onChange={e => setNewEvent({ ...newEvent, quota: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#0E0F11] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-[#0E0F11] mb-1">LOKASI RUANGAN / GEDUNG *</label>
                <input
                  type="text"
                  required
                  placeholder="Auditorium Kampus Pusat UJB"
                  value={newEvent.location}
                  onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#0E0F11] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-[#0E0F11] mb-1">WAKTU MULAI *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.startAt}
                    onChange={e => setNewEvent({ ...newEvent, startAt: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#0E0F11] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-[#0E0F11] mb-1">WAKTU SELESAI *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.endAt}
                    onChange={e => setNewEvent({ ...newEvent, endAt: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#0E0F11] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#0E0F11] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveMenu('dashboard')}
                  className="px-4 py-2 border border-[#0E0F11] uppercase font-bold hover:bg-[#E2E1DA]"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white uppercase font-bold"
                >
                  {creating ? 'MENYIMPAN & MENGUNGGAH...' : 'TERBITKAN KEGIATAN'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 3: KELOLA KEGIATAN (MULTI-TENANT: Milik Saya vs Seluruh Kampus) */}
        {activeMenu === 'events' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E1DA] pb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setEventViewTab('mine')}
                  className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-all ${
                    eventViewTab === 'mine'
                      ? 'bg-[#0E0F11] text-white'
                      : 'bg-[#E2E1DA] text-[#575A65] hover:text-[#0E0F11]'
                  }`}
                >
                  KEGIATAN SAYA ({myEvents.length}) &bull; DAPAT DIKELOLA
                </button>
                <button
                  onClick={() => setEventViewTab('all')}
                  className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-all ${
                    eventViewTab === 'all'
                      ? 'bg-[#0E0F11] text-white'
                      : 'bg-[#E2E1DA] text-[#575A65] hover:text-[#0E0F11]'
                  }`}
                >
                  KEGIATAN UKM LAIN ({otherEvents.length}) &bull; READ-ONLY
                </button>
              </div>

              <span className="font-mono text-xs text-[#575A65]">
                {eventViewTab === 'mine' ? 'Anda memiliki akses penuh untuk mengelola' : 'Mode observasi jadwal kampus'}
              </span>
            </div>

            {/* Grid Kartu Event */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(eventViewTab === 'mine' ? myEvents : otherEvents).map(ev => {
                const isMine = ev.organizationId === user?.organization?.id;

                return (
                  <div key={ev.id} className="bg-white border border-[#E2E1DA] p-5 space-y-3 font-mono text-xs relative">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-[#0E0F11] text-white text-[10px] font-bold uppercase">
                        {ev.category}
                      </span>
                      <span className="text-[10px] text-[#575A65]">
                        BY: {ev.organization}
                      </span>
                    </div>

                    <div className="flex gap-3 items-start">
                      {ev.posterUrl && (
                        <div className="w-16 h-20 shrink-0 bg-black overflow-hidden border border-[#0E0F11]">
                          <img 
                            src={ev.posterUrl.startsWith('http') ? ev.posterUrl : `http://localhost:5000${ev.posterUrl}`} 
                            alt={ev.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm uppercase text-[#0E0F11]">{ev.title}</h4>
                        <p className="text-[#575A65] text-[11px] leading-relaxed line-clamp-2 mt-1">{ev.description}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E2E1DA] flex items-center justify-between">
                      <span>KUOTA: {ev.registeredCount} / {ev.quota}</span>
                      
                      {isMine ? (
                        /* Otoritas Penuh Milik Sendiri */
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleIssueCertificates(ev.id)}
                            className="px-2 py-1 bg-[#10B981] text-white font-bold text-[10px] uppercase hover:bg-[#059669]"
                          >
                            Sertifikat
                          </button>
                          <button
                            onClick={() => { setSelectedEventForStaff(ev); loadStaff(ev.id); setActiveMenu('staff'); }}
                            className="px-2 py-1 bg-[#0E0F11] text-white font-bold text-[10px] uppercase hover:bg-[#EA580C]"
                          >
                            Staf
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="px-2 py-1 border border-[#EF4444] text-[#EF4444] font-bold text-[10px] uppercase hover:bg-[#EF4444] hover:text-white"
                          >
                            Hapus
                          </button>
                        </div>
                      ) : (
                        /* Read-Only untuk Event UKM Lain */
                        <span className="px-2.5 py-1 bg-[#F4F4F0] border border-[#E2E1DA] text-[#575A65] font-bold text-[10px] uppercase flex items-center gap-1">
                          <Lock size={11} />
                          <span>TERKUNCI (UKM LAIN)</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 4: STAF SCANNER MEJA REGISTRASI */}
        {activeMenu === 'staff' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-mono text-sm font-black uppercase text-[#0E0F11]">
                  KEPANITIAAN MEJA REGISTRASI // DAFTAR HAK SCAN
                </h3>
                <p className="font-mono text-xs text-[#575A65]">
                  Pilih kegiatan milik organisasi Anda untuk mendaftarkan panitia scanner meja (login tanpa password di HP).
                </p>
              </div>

              {myEvents.length > 0 && (
                <select
                  value={selectedEventForStaff?.id || myEvents[0]?.id}
                  onChange={e => {
                    const ev = myEvents.find(ev => String(ev.id) === e.target.value);
                    if (ev) { setSelectedEventForStaff(ev); loadStaff(ev.id); }
                  }}
                  className="px-3 py-2 bg-white border border-[#0E0F11] font-mono text-xs font-bold uppercase"
                >
                  {myEvents.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              )}
            </div>

            {myEvents.length === 0 ? (
              <div className="p-8 bg-white border border-[#E2E1DA] text-center font-mono text-xs text-[#575A65]">
                Organisasi Anda belum menerbitkan kegiatan. Terbitkan acara terlebih dahulu untuk menambah staf scanner.
              </div>
            ) : (
              <>
                <form onSubmit={handleAddStaff} className="p-4 bg-white border border-[#0E0F11] grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div>
                    <label className="block uppercase text-[10px] font-bold text-[#0E0F11] mb-1">NIM PANITIA *</label>
                    <input
                      type="text"
                      required
                      placeholder="22102030"
                      value={newNim}
                      onChange={e => setNewNim(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#0E0F11] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block uppercase text-[10px] font-bold text-[#0E0F11] mb-1">NAMA LENGKAP PANITIA *</label>
                    <input
                      type="text"
                      required
                      placeholder="Dimas Prasetyo"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#0E0F11] focus:outline-none"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold uppercase transition-colors"
                    >
                      + DAFTARKAN PANITIA
                    </button>
                  </div>
                </form>

                <div className="bg-white border border-[#E2E1DA]">
                  <div className="p-3 bg-[#EBEAE4] border-b border-[#D5D4CC] font-mono text-xs font-bold uppercase text-[#0E0F11]">
                    PANITIA MEMILIKI HAK SCAN PADA ACARA INI ({staffList.length})
                  </div>
                  <div className="divide-y divide-[#E2E1DA] font-mono text-xs">
                    {staffList.length === 0 ? (
                      <div className="p-6 text-center text-[#575A65]">
                        Belum ada panitia scanner yang didaftarkan.
                      </div>
                    ) : (
                      staffList.map(s => (
                        <div key={s.id} className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-[#0E0F11] uppercase">{s.name}</p>
                            <p className="text-[11px] text-[#575A65]">NIM: {s.nim} &bull; {s.roleName}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#065F46] font-bold text-[10px] uppercase border border-[#10B981]">
                              HAK SCAN AKTIF
                            </span>
                            <button
                              onClick={() => handleDeleteStaff(s.id)}
                              className="text-[#EF4444] hover:underline"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* VIEW 5: SPREADSHEET PRESENSI LPJ */}
        {activeMenu === 'spreadsheet' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-mono text-sm font-black uppercase text-[#0E0F11]">
                  LIVE SPREADSHEET KEHADIRAN // FORMAT RESMI LPJ
                </h3>
                <p className="font-mono text-xs text-[#575A65]">
                  Data presensi real-time terisolasi untuk kegiatan milik organisasi Anda.
                </p>
              </div>

              {myEvents.length > 0 && (
                <div className="flex items-center gap-3">
                  <select
                    value={spreadsheetEvent?.id || myEvents[0]?.id}
                    onChange={e => {
                      const ev = myEvents.find(ev => String(ev.id) === e.target.value);
                      if (ev) { setSpreadsheetEvent(ev); loadSpreadsheet(ev.id); }
                    }}
                    className="px-3 py-2 bg-white border border-[#0E0F11] font-mono text-xs font-bold uppercase"
                  >
                    {myEvents.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                    ))}
                  </select>

                  {spreadsheetEvent && (
                    <a
                      href={`http://localhost:5000/api/events/${spreadsheetEvent.id}/export-excel`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 shadow-xs"
                    >
                      <Download size={14} />
                      <span>UNDUH EXCEL (.XLSX)</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white border border-[#0E0F11] overflow-x-auto">
              {spreadsheetLoading ? (
                <div className="p-8 text-center font-mono text-xs text-[#575A65]">
                  MEMUAT DATA PRESENSI REAL-TIME...
                </div>
              ) : spreadsheetData.length === 0 ? (
                <div className="p-8 text-center font-mono text-xs text-[#575A65]">
                  BELUM ADA DATA PESERTA YANG MENDAFTAR PADA KEGIATAN INI.
                </div>
              ) : (
                <table className="w-full text-left font-mono text-[11px] border-collapse">
                  <thead className="bg-[#0E0F11] text-white uppercase border-b border-[#0E0F11]">
                    <tr>
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Waktu Kehadiran</th>
                      <th className="p-2.5">Kode Tiket</th>
                      <th className="p-2.5">Tipe</th>
                      <th className="p-2.5">Nama Peserta</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">NIM / Instansi</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Petugas Pencatat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E1DA]">
                    {spreadsheetData.map(row => (
                      <tr key={row.no} className="hover:bg-[#F4F4F0]">
                        <td className="p-2.5 font-bold">{row.no}</td>
                        <td className="p-2.5">{row.timestampKehadiran}</td>
                        <td className="p-2.5 font-bold text-[#EA580C]">{row.kodeTiket}</td>
                        <td className="p-2.5">{row.tipePeserta}</td>
                        <td className="p-2.5 font-bold text-[#0E0F11]">{row.namaLengkap}</td>
                        <td className="p-2.5 text-[#575A65]">{row.email}</td>
                        <td className="p-2.5">{row.nim !== '-' ? row.nim : row.asalInstansi}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 font-bold text-[9px] ${
                            row.statusKehadiran === 'Hadir' ? 'bg-[#ECFDF5] text-[#065F46]' : 'bg-[#F4F4F0] text-[#575A65]'
                          }`}>
                            {row.statusKehadiran}
                          </span>
                        </td>
                        <td className="p-2.5">{row.petugasPencatat}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* VIEW 6: PROFIL LEMBAGA */}
        {activeMenu === 'profile' && (
          <div className="max-w-xl bg-white border border-[#0E0F11] p-6 space-y-4 font-mono text-xs">
            <h3 className="font-black text-sm uppercase text-[#0E0F11] border-b border-[#E2E1DA] pb-2">
              PROFIL LEMBAGA KEMAHASISWAAN RESMI
            </h3>
            <div>
              <span className="text-[10px] text-[#575A65] uppercase block">NAMA LEMBAGA / UKM</span>
              <p className="font-bold text-[#0E0F11] text-sm mt-0.5">{user?.organization?.name || user?.name}</p>
            </div>
            <div>
              <span className="text-[10px] text-[#575A65] uppercase block">EMAIL RESMI PENYELENGGARA</span>
              <p className="font-bold text-[#0E0F11] mt-0.5">{user?.email}</p>
            </div>
            <div>
              <span className="text-[10px] text-[#575A65] uppercase block">STATUS HUKUM / BIROKRASI</span>
              <span className="inline-block mt-1 px-2.5 py-1 bg-[#ECFDF5] border border-[#10B981] text-[#065F46] font-bold text-[10px]">
                DIVERIFIKASI DEKANAT UNIVERSITAS JANABADRA
              </span>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
