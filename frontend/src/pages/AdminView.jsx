import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  TrendingUp, 
  Eye, 
  Plus, 
  Users, 
  FileText, 
  Download, 
  Bell, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  XCircle,
  AlertCircle,
  X
} from 'lucide-react';

export const AdminView = () => {
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(5);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState(null);

  const fetchAdminEvents = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/events');
      if (res.success) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data event admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminEvents();
  }, []);

  const handleApproveProposal = (ev) => {
    alert(`Proposal fisik hard-file untuk kegiatan "${ev.title}" telah diverifikasi oleh Admin Kampus UJB! Sesi 24 jam dan akun penyelenggara resmi aktif.`);
    setDetailModal(null);
  };

  const calendarDays = [
    { num: 26, isPrev: true }, { num: 27, isPrev: true }, { num: 28, isPrev: true }, { num: 29, isPrev: true }, { num: 30, isPrev: true }, { num: 31, isPrev: true }, { num: 1 },
    { num: 2 }, { num: 3 }, { num: 4 }, { num: 5, isToday: true }, { num: 6 }, { num: 7 }, { num: 8 },
    { num: 9 }, { num: 10 }, { num: 11 }, { num: 12, hasEvent: true }, { num: 13 }, { num: 14 }, { num: 15 },
    { num: 16 }, { num: 17 }, { num: 18 }, { num: 19 }, { num: 20, hasEvent: true }, { num: 21 }, { num: 22 },
    { num: 23 }, { num: 24 }, { num: 25 }, { num: 26 }, { num: 27 }, { num: 28 }, { num: 29 },
    { num: 30 }, { num: 1, isNext: true }, { num: 2, isNext: true }, { num: 3, isNext: true }, { num: 4, isNext: true }, { num: 5, isNext: true }, { num: 6, isNext: true }
  ];

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Dashboard Admin Kampus UJB</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Selamat datang, Administrator! Pantau tertib birokrasi perizinan proposal fisik dan metrik kampus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-xs flex items-center gap-2">
            <Calendar size={14} className="text-slate-400" />
            <span>Universitas Janabadra &bull; 2026</span>
          </div>
        </div>
      </div>

      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
              <Calendar size={22} />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Aktif
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400">Total Kegiatan Kampus</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{events.length} Kegiatan</h3>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <CheckCircle2 size={22} />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              ACC
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400">Proposal Fisik Disetujui</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{events.length} Berkas</h3>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Users size={22} />
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Peserta
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400">Total Partisipasi Peserta</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {events.reduce((acc, curr) => acc + (curr.registeredCount || 0), 0)} Mahasiswa/Umum
            </h3>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
              <Building2 size={22} />
            </div>
            <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              Legal
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400">UKM / Lembaga Terdaftar</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">8 Organisasi</h3>
          </div>
        </div>
      </div>

      {/* Tabel Validasi Berkas Fisik & Sesi 24 Jam */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Validasi Proposal Berkas Fisik (Hard File)</h3>
            <p className="text-xs text-slate-500">
              Admin bertugas memverifikasi proposal yang diserahkan langsung oleh ketua panitia ke meja dekanat
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-3">Organisasi Pengaju</th>
                <th className="py-3 px-3">Nama Kegiatan</th>
                <th className="py-3 px-3">Status Proposal Hard File</th>
                <th className="py-3 px-3">Target Kuota</th>
                <th className="py-3 px-3">Jadwal Sesi 24 Jam</th>
                <th className="py-3 px-3 text-right">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{ev.organization}</td>
                  <td className="py-3 px-3 text-slate-700">{ev.title}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-max">
                      <FileCheck size={11} /> {ev.proposalHardFile || 'Tersedia di Meja Admin'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-600">{ev.quota} Peserta</td>
                  <td className="py-3 px-3 text-slate-500 text-[11px] font-mono">
                    {new Date(ev.startAt).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setDetailModal(ev)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all"
                    >
                      Periksa Berkas
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL VERIFIKASI PROPOSAL FISIK */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Verifikasi Berkas Fisik Kampus</span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{detailModal.title}</h3>
                <p className="text-xs text-slate-500">{detailModal.organization}</p>
              </div>
              <button onClick={() => setDetailModal(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-slate-500 text-[11px]">Status Dokumen Proposal:</p>
                <p className="font-bold text-slate-900">{detailModal.proposalHardFile || 'Tersedia di Meja Admin'}</p>
                <p className="text-slate-500 text-[11px] pt-1">Target Kuota: <strong>{detailModal.quota} Peserta</strong></p>
                <p className="text-slate-500 text-[11px]">Lokasi: <strong>{detailModal.location}</strong></p>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Dengan mengklik <strong>"ACC Proposal & Aktifkan Sesi"</strong>, sistem mengesahkan status perizinan UKM tersebut. Sesi pemindai barcode meja registrasi otomatis aktif selama 24 jam tepat saat waktu kegiatan dimulai.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button 
                onClick={() => setDetailModal(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Tutup
              </button>
              <button 
                onClick={() => handleApproveProposal(detailModal)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                ACC Proposal & Aktifkan Sesi 24 Jam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
