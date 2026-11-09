import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import { 
  Users, 
  UserPlus, 
  Plus, 
  FileSpreadsheet, 
  Download, 
  Award, 
  Camera, 
  Calendar, 
  Clock, 
  MapPin, 
  Trash2, 
  CheckCircle2, 
  ChevronRight,
  ChevronLeft,
  X,
  FileCheck,
  Building
} from 'lucide-react';

export const PenyelenggaraView = ({ onOpenScannerWithEvent }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Kelola Staf Scanner Panitia
  const [staffModalEvent, setStaffModalEvent] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [newNim, setNewNim] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Petugas Meja Registrasi');

  // Modal Buat Pengajuan Acara Baru
  const [createEventModal, setCreateEventModal] = useState(false);
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

  // Modal Live Spreadsheet Presensi LPJ
  const [spreadsheetEvent, setSpreadsheetEvent] = useState(null);
  const [spreadsheetData, setSpreadsheetData] = useState([]);
  const [spreadsheetLoading, setSpreadsheetLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/events');
      if (res.success) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error('Gagal mengambil event:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openStaffModal = async (ev) => {
    setStaffModalEvent(ev);
    try {
      const res = await apiFetch(`/events/${ev.id}/scanners`);
      if (res.success) {
        setStaffList(res.data);
      }
    } catch (err) {
      console.error('Gagal memuat staf scanner:', err);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!staffModalEvent || !newNim || !newName) return;

    try {
      const res = await apiFetch(`/events/${staffModalEvent.id}/scanners`, {
        method: 'POST',
        body: JSON.stringify({
          nim: newNim,
          name: newName,
          roleName: newRole
        })
      });

      if (res.success) {
        setStaffList([res.data, ...staffList]);
        setNewNim('');
        setNewName('');
        alert(`Panitia ${newName} (NIM: ${newNim}) berhasil didaftarkan sebagai petugas scanner!`);
      }
    } catch (err) {
      alert(err.message || 'Gagal mendaftarkan panitia scanner');
    }
  };

  const handleDeleteStaff = async (scannerId) => {
    if (!window.confirm('Hapus hak scan panitia ini?')) return;
    try {
      await apiFetch(`/scanners/${scannerId}`, { method: 'DELETE' });
      setStaffList(staffList.filter(s => s.id !== scannerId));
    } catch (err) {
      alert(err.message || 'Gagal menghapus panitia');
    }
  };

  const openSpreadsheet = async (ev) => {
    setSpreadsheetEvent(ev);
    try {
      setSpreadsheetLoading(true);
      const res = await apiFetch(`/events/${ev.id}/spreadsheet`);
      if (res.success) {
        setSpreadsheetData(res.data || []);
      }
    } catch (err) {
      alert(err.message || 'Gagal memuat data spreadsheet');
    } finally {
      setSpreadsheetLoading(false);
    }
  };

  const handleCreateEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/events', {
        method: 'POST',
        body: JSON.stringify(newEvent)
      });
      if (res.success) {
        alert('Kegiatan baru berhasil diajukan dan tayang di Kalender Kampus!');
        setCreateEventModal(false);
        fetchEvents();
      }
    } catch (err) {
      alert(err.message || 'Gagal mengajukan kegiatan');
    }
  };

  const handleIssueCerts = async (eventId) => {
    if (!window.confirm('Terbitkan e-sertifikat sah untuk seluruh peserta yang telah hadir?')) return;
    try {
      const res = await apiFetch(`/events/${eventId}/issue-certificates`, { method: 'POST' });
      alert(res.message);
    } catch (err) {
      alert(err.message || 'Gagal menerbitkan sertifikat');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Dashboard Penyelenggara UKM / BEM</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola kegiatan, daftarkan staf scanner meja registrasi, dan unduh Live Spreadsheet LPJ 24 jam.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCreateEventModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus size={15} />
            <span>Ajukan Kegiatan Baru</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Penyelenggara */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Kegiatan</p>
            <h4 className="text-xl font-extrabold text-slate-900">{events.length} Kegiatan</h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pendaftar</p>
            <h4 className="text-xl font-extrabold text-slate-900">
              {events.reduce((acc, curr) => acc + (curr.registeredCount || 0), 0)} Peserta
            </h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Camera size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sesi Multi-Scanner</p>
            <h4 className="text-xl font-extrabold text-slate-900">Aktif di Hari-H (24 Jam)</h4>
          </div>
        </div>
      </div>

      {/* Daftar Kegiatan Dikelola */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Daftar Acara & Pengaturan Scanner</h3>
            <p className="text-xs text-slate-500">Penyelenggara wajib mendaftarkan NIM panitia meja registrasi sebelum acara dimulai</p>
          </div>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400 py-6 text-center">Memuat daftar kegiatan...</p>
        ) : events.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">Belum ada kegiatan yang diajukan.</p>
        ) : (
          <div className="space-y-4">
            {events.map((ev) => (
              <div 
                key={ev.id}
                className="p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all bg-slate-50/50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      {ev.category}
                    </span>
                    {ev.isSessionActive ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 animate-pulse">
                        SESI SCANNER 24 JAM SEDANG AKTIF
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        Pra-Event (Scanner Terkunci)
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900">{ev.title}</h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><Calendar size={13} /> {new Date(ev.startAt).toLocaleString('id-ID')}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={13} /> {ev.location}</span>
                    <span className="flex items-center gap-1.5"><Users size={13} /> {ev.registeredCount} / {ev.quota} Peserta</span>
                  </div>
                </div>

                {/* Tombol Aksi Penyelenggara */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  <button
                    onClick={() => openStaffModal(ev)}
                    className="flex-1 lg:flex-none px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <UserPlus size={14} />
                    <span>Daftarkan Staf Scanner ({ev.scannersCount || 0})</span>
                  </button>

                  <button
                    onClick={() => openSpreadsheet(ev)}
                    className="flex-1 lg:flex-none px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <FileSpreadsheet size={14} />
                    <span>Live Spreadsheet Presensi</span>
                  </button>

                  <button
                    onClick={() => handleIssueCerts(ev.id)}
                    className="flex-1 lg:flex-none px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Award size={14} />
                    <span>Terbitkan Sertifikat</span>
                  </button>

                  {ev.isSessionActive && onOpenScannerWithEvent && (
                    <button
                      onClick={() => onOpenScannerWithEvent(ev)}
                      className="flex-1 lg:flex-none px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Camera size={14} />
                      <span>Buka Scanner Kamera</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL KELOLA STAF SCANNER MEJA REGISTRASI */}
      {staffModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Kepanitiaan Meja Registrasi</span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{staffModalEvent.title}</h3>
                <p className="text-xs text-slate-500">Panitia yang terdaftar di sini dapat langsung login scanner via NIM & Nama tanpa password di HP.</p>
              </div>
              <button 
                onClick={() => setStaffModalEvent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Pendaftaran Panitia Scanner */}
            <form onSubmit={handleAddStaff} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">NIM Mahasiswa *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Contoh: 22102050" 
                    value={newNim} 
                    onChange={e => setNewNim(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Nama Anggota Panitia *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Contoh: Angga Permana" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-hidden"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                + Daftarkan Sebagai Petugas Scanner Meja
              </button>
            </form>

            {/* List Petugas Scanner Terdaftar */}
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Panitia Memiliki Otoritas Scan ({staffList.length})
              </label>
              <div className="divide-y divide-slate-100 border border-slate-200/70 rounded-xl overflow-hidden">
                {staffList.length === 0 ? (
                  <p className="text-xs text-slate-400 p-4 text-center">Belum ada panitia scanner yang didaftarkan.</p>
                ) : (
                  staffList.map((s) => (
                    <div key={s.id} className="p-2.5 bg-white flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <p className="font-bold text-slate-900">{s.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">NIM: {s.nim} &bull; {s.roleName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Hak Scan Aktif
                        </span>
                        <button
                          onClick={() => handleDeleteStaff(s.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-100">
              <button 
                onClick={() => setStaffModalEvent(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LIVE SPREADSHEET PRESENSI UNTUK LPJ */}
      {spreadsheetEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Rekapitulasi Kehadiran Digital (LPJ)</span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{spreadsheetEvent.title}</h3>
                <p className="text-xs text-slate-500">Struktur data lengkap dengan audit trail nama dan NIM petugas scanner.</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`http://localhost:5000/api/events/${spreadsheetEvent.id}/export-excel`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Download size={14} />
                  <span>Unduh File Excel (.xlsx)</span>
                </a>
                <button 
                  onClick={() => setSpreadsheetEvent(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Spreadsheet Table View */}
            <div className="flex-1 overflow-auto border border-slate-200 rounded-2xl">
              {spreadsheetLoading ? (
                <p className="p-8 text-center text-xs text-slate-400">Memuat data rekapitulasi presensi...</p>
              ) : spreadsheetData.length === 0 ? (
                <p className="p-8 text-center text-xs text-slate-400">Belum ada peserta yang mendaftar pada kegiatan ini.</p>
              ) : (
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Timestamp Kehadiran</th>
                      <th className="p-2.5">Kode Tiket</th>
                      <th className="p-2.5">Tipe</th>
                      <th className="p-2.5">Nama Lengkap</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">NIM / Instansi</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Petugas Pencatat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {spreadsheetData.map((row) => (
                      <tr key={row.no} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 font-bold text-slate-500">{row.no}</td>
                        <td className="p-2.5 font-mono text-[10px] text-slate-600">{row.timestampKehadiran}</td>
                        <td className="p-2.5 font-mono font-bold text-blue-600">{row.kodeTiket}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            row.tipePeserta === 'Mahasiswa' ? 'bg-blue-50 text-blue-700' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {row.tipePeserta}
                          </span>
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">{row.namaLengkap}</td>
                        <td className="p-2.5 text-slate-500">{row.email}</td>
                        <td className="p-2.5 text-slate-600">{row.nim !== '-' ? row.nim : row.asalInstansi}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            row.statusKehadiran === 'Hadir' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {row.statusKehadiran}
                          </span>
                        </td>
                        <td className="p-2.5 font-medium text-slate-700">{row.petugasPencatat}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL BUAT KEGIATAN BARU */}
      {createEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Pengajuan Acara UKM / BEM</span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">Formulir Kegiatan Kampus Baru</h3>
              </div>
              <button 
                onClick={() => setCreateEventModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Kegiatan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Seminar Nasional AI Janabadra"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Deskripsi Kegiatan</label>
                <textarea
                  rows="2"
                  placeholder="Tuliskan gambaran umum acara..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-600 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Kategori Acara</label>
                  <select
                    value={newEvent.categoryId}
                    onChange={(e) => setNewEvent({ ...newEvent, categoryId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-hidden"
                  >
                    <option value="1">Teknologi & Riset</option>
                    <option value="2">Seminar & Kuliah Tamu</option>
                    <option value="3">Seni & Budaya</option>
                    <option value="4">Karir & Kewirausahaan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Kuota Peserta</label>
                  <input
                    type="number"
                    min="10"
                    value={newEvent.quota}
                    onChange={(e) => setNewEvent({ ...newEvent, quota: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Lokasi Ruangan / Lapangan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Auditorium Utama Kampus Pusat UJB"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-600 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Waktu Mulai Acara *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.startAt}
                    onChange={(e) => setNewEvent({ ...newEvent, startAt: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Waktu Selesai Acara *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.endAt}
                    onChange={(e) => setNewEvent({ ...newEvent, endAt: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateEventModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20"
                >
                  Terbitkan Acara ke Kalender
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
