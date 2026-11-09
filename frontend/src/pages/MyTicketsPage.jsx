import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, Clock, Download, Trash2, CheckCircle, AlertCircle, Ticket } from 'lucide-react';

const SLUG_TO_STRIPE = {
  'teknologi-riset': 'cat-stripe-tech',
  'seminar-kuliah-tamu': 'cat-stripe-seminar',
  'seni-budaya': 'cat-stripe-art',
  'karir-kewirausahaan': 'cat-stripe-career',
};

export const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/user/my-tickets');
      setTickets(res.data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Yakin ingin membatalkan pendaftaran kegiatan ini?')) return;
    setCancellingId(id);
    try { await apiFetch(`/registrations/${id}`, { method: 'DELETE' }); load(); }
    catch (e) { alert(e.message); }
    finally { setCancellingId(null); }
  };

  const handleDownloadCert = async (regId, title) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/certificates/${regId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.message); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Sertifikat-${title.substring(0, 25).replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { alert(e.message); }
  };

  if (loading) return (
    <div className="py-16 text-center">
      <div className="inline-block w-8 h-8 border-2 border-slate-300 border-t-navy-900 rounded-full animate-spin mb-3" role="status" />
      <p className="text-sm text-slate-500">Memuat tiket dan sertifikat Anda...</p>
    </div>
  );

  if (error) return (
    <div className="py-12 text-center bg-white rounded-lg border border-red-200">
      <AlertCircle size={24} className="text-red-500 mx-auto mb-2" />
      <p className="text-red-700 text-sm font-semibold mb-3">{error}</p>
      <button onClick={load} className="px-4 py-2 bg-slate-800 text-white text-xs rounded min-h-[40px]">Coba Lagi</button>
    </div>
  );

  if (tickets.length === 0) return (
    <div className="py-16 text-center bg-white rounded-lg border border-slate-200">
      <Ticket size={32} className="text-slate-300 mx-auto mb-3" aria-hidden="true" />
      <h3 className="font-bold text-slate-700 text-base mb-1">Belum Ada Tiket</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto">Anda belum mendaftar kegiatan. Jelajahi kalender untuk menemukan agenda menarik.</p>
    </div>
  );

  const active = tickets.filter(t => !t.isAttended);
  const history = tickets.filter(t => t.isAttended);

  const TicketCard = ({ item }) => {
    const start = new Date(item.event.startAt);
    const dateStr = start.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = start.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    return (
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Event info */}
          <div className="flex-1 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{item.event.category}</span>
              {item.isAttended ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle size={11} /> Hadir
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Menunggu Hari-H
                </span>
              )}
            </div>

            <h3 className="font-bold text-slate-900 text-base leading-snug">{item.event.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Penyelenggara: {item.event.organization}</p>

            <div className="mt-3 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2"><Calendar size={13} className="text-slate-400 shrink-0" /> {dateStr}</div>
              <div className="flex items-center gap-2"><Clock size={13} className="text-slate-400 shrink-0" /> {timeStr} WIB</div>
              <div className="flex items-center gap-2"><MapPin size={13} className="text-slate-400 shrink-0" /> {item.event.location}</div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              {item.isAttended ? (
                <button
                  onClick={() => handleDownloadCert(item.registrationId, item.event.title)}
                  className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold py-2 px-4 rounded transition-colors min-h-[40px]"
                >
                  <Download size={14} /> Unduh E-Sertifikat PDF
                </button>
              ) : (
                <button
                  onClick={() => handleCancel(item.registrationId)}
                  disabled={cancellingId === item.registrationId}
                  className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 py-2 px-3 rounded transition-colors min-h-[40px]"
                >
                  <Trash2 size={14} /> Batalkan
                </button>
              )}
            </div>
          </div>

          {/* QR Code area */}
          <div className="flex items-center justify-center p-5 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 md:w-48 shrink-0">
            <div className="text-center">
              <div className="bg-white p-2 rounded border border-slate-200 inline-block">
                <QRCodeSVG value={item.ticketCode} size={100} level="M" />
              </div>
              <p className="text-[10px] font-mono font-bold text-slate-600 mt-2">{item.ticketCode}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Tunjukkan ke panitia</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tiket & E-Sertifikat</h1>
        <p className="text-sm text-slate-500 mt-1">Tunjukkan QR code ke panitia untuk presensi. Unduh sertifikat setelah tercatat hadir.</p>
      </div>

      {active.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Tiket Aktif ({active.length})</h2>
          <div className="space-y-4">{active.map(t => <TicketCard key={t.registrationId} item={t} />)}</div>
        </section>
      )}

      {history.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Riwayat Kegiatan ({history.length})</h2>
          <div className="space-y-4">{history.map(t => <TicketCard key={t.registrationId} item={t} />)}</div>
        </section>
      )}
    </div>
  );
};
