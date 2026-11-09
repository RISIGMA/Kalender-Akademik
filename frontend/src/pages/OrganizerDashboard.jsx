import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import { QRScannerModal } from '../components/QRScannerModal';
import { Plus, Camera, Award, Users, CheckCircle, Calendar, Trash2 } from 'lucide-react';

export const OrganizerDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form Buat Event Baru
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    categoryId: '',
    startAt: '',
    endAt: '',
    quota: 50
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [anaRes, catRes] = await Promise.all([
        apiFetch('/organizer/analytics'),
        apiFetch('/categories')
      ]);
      setAnalytics(anaRes.data);
      setCategories(catRes.data);
      if (catRes.data.length > 0 && !newEvent.categoryId) {
        setNewEvent(prev => ({ ...prev, categoryId: catRes.data[0].id }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScanTicket = async (ticketCode) => {
    const res = await apiFetch('/attendances/scan', {
      method: 'POST',
      body: JSON.stringify({ ticketCode })
    });
    loadData();
    return res;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/events', {
        method: 'POST',
        body: JSON.stringify(newEvent)
      });
      setCreateModalOpen(false);
      setNewEvent({
        title: '',
        description: '',
        location: '',
        categoryId: categories[0]?.id || '',
        startAt: '',
        endAt: '',
        quota: 50
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleIssueCertificates = async (eventId) => {
    try {
      const res = await apiFetch(`/events/${eventId}/issue-certificates`, { method: 'POST' });
      alert(res.message);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Hapus kegiatan ini dari kalender kampus?')) return;
    try {
      await apiFetch(`/events/${eventId}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 text-center rounded-lg border border-slate-200">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-campus-navy mb-2"></div>
        <p className="text-sm text-slate-600">Memuat dashboard analitik UKM...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 text-center rounded-lg border border-red-200">
        <p className="text-red-700 text-sm font-semibold mb-3">{error}</p>
        <button onClick={loadData} className="px-4 py-2 bg-slate-800 text-white text-xs rounded">
          Muat Ulang
        </button>
      </div>
    );
  }

  const { organization, summary, events } = analytics;

  return (
    <div className="space-y-6">
      {/* Header Dashboard & Tombol Cepat */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{organization.name}</h2>
          <p className="text-xs text-slate-500">{organization.description || 'Penyelenggara Kegiatan Resmi Kampus'}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScannerOpen(true)}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2 rounded shadow-sm"
          >
            <Camera size={16} />
            <span>Pemindai Absensi QR</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 bg-campus-navy hover:bg-blue-900 text-white text-xs font-semibold px-3.5 py-2 rounded shadow-sm"
          >
            <Plus size={16} />
            <span>Buat Event Baru</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Statistik Riil (Antislop: Dihitung nyata dari DB) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Event</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{summary.totalEvents}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Pendaftar</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{summary.totalRegistered} Peserta</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Tercatat Hadir</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{summary.totalAttended} Orang</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Rasio Kehadiran</p>
          <p className="text-2xl font-bold text-blue-800 mt-1">{summary.overallRate}%</p>
        </div>
      </div>

      {/* Daftar Event Organisasi & Tindakan Operasional */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 text-base">Manajemen Agenda & Peserta</h3>

        {events.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-lg border border-slate-200 text-slate-500 text-xs">
            Organisasi Anda belum menerbitkan kegiatan. Klik "Buat Event Baru" untuk menambahkan agenda kampus.
          </div>
        ) : (
          events.map(ev => (
            <div key={ev.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{ev.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{ev.location} | Kuota: {ev.quota}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleIssueCertificates(ev.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded border border-blue-200"
                    title="Terbitkan sertifikat ke peserta yang sudah presensi"
                  >
                    <Award size={14} /> Terbitkan E-Sertifikat
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="text-slate-400 hover:text-red-700 p-1.5 rounded"
                    title="Hapus Event"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Progress Kehadiran */}
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <span>Pendaftar: <strong>{ev.registeredCount}</strong></span>
                <span>Hadir: <strong className="text-emerald-700">{ev.attendedCount}</strong></span>
                <span>Tingkat Kehadiran: <strong>{ev.attendanceRate}%</strong></span>
              </div>

              {/* Tabel Peserta Ringkas */}
              <div className="overflow-x-auto border border-slate-200 rounded">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Nama Mahasiswa</th>
                      <th className="px-3 py-2">NIM</th>
                      <th className="px-3 py-2">Kode Tiket</th>
                      <th className="px-3 py-2">Status Presensi</th>
                      <th className="px-3 py-2">Sertifikat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ev.participants.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-3 py-4 text-center text-slate-400">
                          Belum ada peserta yang mendaftar.
                        </td>
                      </tr>
                    ) : (
                      ev.participants.map(p => (
                        <tr key={p.registrationId} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-medium text-slate-900">{p.name}</td>
                          <td className="px-3 py-2 text-slate-600">{p.nim || '-'}</td>
                          <td className="px-3 py-2 font-mono text-slate-600">{p.ticketCode}</td>
                          <td className="px-3 py-2">
                            {p.isAttended ? (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                Hadir ({new Date(p.attendedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                Belum Absen
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {p.hasCertificate ? (
                              <span className="text-emerald-700 font-semibold text-[11px]">Diterbitkan</span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Scanner QR Absensi */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanTicket}
      />

      {/* Modal Buat Event Baru */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="font-bold text-lg text-slate-900 mb-4">Tambah Kegiatan Kampus Baru</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Kegiatan</label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Contoh: Seminar Nasional AI 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                <select
                  value={newEvent.categoryId}
                  onChange={(e) => setNewEvent({ ...newEvent, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lokasi Kegiatan</label>
                <input
                  type="text"
                  required
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Gedung Rektorat Lt. 3 / Zoom Online"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Waktu Mulai</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.startAt}
                    onChange={(e) => setNewEvent({ ...newEvent, startAt: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Waktu Selesai</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.endAt}
                    onChange={(e) => setNewEvent({ ...newEvent, endAt: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kuota Peserta</label>
                <input
                  type="number"
                  min="5"
                  required
                  value={newEvent.quota}
                  onChange={(e) => setNewEvent({ ...newEvent, quota: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows="3"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Jelaskan agenda dan manfaat kegiatan bagi mahasiswa..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-campus-navy text-white rounded text-xs font-semibold hover:bg-blue-900"
                >
                  Publikasikan ke Kalender
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
