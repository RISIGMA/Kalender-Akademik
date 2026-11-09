import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CalendarView } from '../components/CalendarView';
import { Search, MapPin, Users, Tag, Clock, CheckCircle } from 'lucide-react';

const SLUG_TO_STRIPE = {
  'teknologi-riset': 'cat-stripe-tech',
  'seminar-kuliah-tamu': 'cat-stripe-seminar',
  'seni-budaya': 'cat-stripe-art',
  'karir-kewirausahaan': 'cat-stripe-career',
};

export const EventsPage = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registeringId, setRegisteringId] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams();
      if (selectedCat) q.append('category', selectedCat);
      if (search) q.append('search', search);
      const [ev, cat] = await Promise.all([apiFetch(`/events?${q}`), apiFetch('/categories')]);
      setEvents(ev.data);
      setCategories(cat.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedCat]);

  const handleRegister = async (eventId) => {
    if (!user) { onOpenAuth(); return; }
    setRegisteringId(eventId);
    try {
      const res = await apiFetch(`/events/${eventId}/register`, { method: 'POST' });
      setActionMsg(res.message);
      load();
      setTimeout(() => setActionMsg(null), 5000);
    } catch (e) { alert(e.message); }
    finally { setRegisteringId(null); }
  };

  const quotaColor = (count, quota) => {
    const pct = count / quota;
    if (pct >= 0.9) return 'bg-red-600';
    if (pct >= 0.7) return 'bg-amber-500';
    return 'bg-emerald-600';
  };

  return (
    <div className="space-y-8">
      {/* Page header: left-aligned, asymmetric spacing */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kegiatan Kampus</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-lg">
          Temukan seminar, workshop, dan kegiatan UKM yang sedang berlangsung. Daftar langsung dan dapatkan tiket digital.
        </p>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded flex items-center gap-2 text-sm">
          <CheckCircle size={18} className="text-emerald-600 shrink-0" />
          <span className="font-semibold text-emerald-800">{actionMsg} Buka menu Tiket Saya untuk melihat QR code.</span>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <form onSubmit={e => { e.preventDefault(); load(); }} className="flex flex-1 w-full gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" aria-hidden="true" />
            <label htmlFor="event-search" className="sr-only">Cari kegiatan</label>
            <input
              id="event-search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari kegiatan, topik, lokasi..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded focus:border-navy-700"
            />
          </div>
          <label htmlFor="cat-filter" className="sr-only">Kategori</label>
          <select
            id="cat-filter"
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
            className="text-sm border border-slate-300 rounded px-3 py-2 bg-white min-h-[40px]"
          >
            <option value="">Semua Kategori</option>
            {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <button type="submit" className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold rounded min-h-[40px]">
            Cari
          </button>
        </form>

        {/* View toggle: segmented control */}
        <div className="flex bg-slate-100 p-1 rounded border border-slate-200">
          {['list', 'calendar'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors ${
                view === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {v === 'list' ? 'Daftar' : 'Kalender'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-2 border-slate-300 border-t-navy-900 rounded-full animate-spin mb-3" role="status" />
          <p className="text-sm text-slate-500">Memuat jadwal kegiatan...</p>
        </div>
      ) : error ? (
        <div className="py-12 text-center bg-white rounded-lg border border-red-200">
          <p className="text-red-700 text-sm font-semibold mb-3">{error}</p>
          <button onClick={load} className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded min-h-[40px]">Muat Ulang</button>
        </div>
      ) : view === 'calendar' ? (
        <CalendarView events={events} onSelectEvent={id => { const ev = events.find(e => String(e.id) === String(id)); if (ev) handleRegister(ev.id); }} />
      ) : events.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-sm bg-white rounded-lg border border-slate-200">
          Belum ada kegiatan pada periode ini. Coba ubah filter pencarian Anda.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(ev => {
            const full = ev.registeredCount >= ev.quota;
            const start = new Date(ev.startAt);
            const stripe = SLUG_TO_STRIPE[ev.categorySlug] || 'cat-stripe-default';
            const pctFilled = Math.min(100, Math.round((ev.registeredCount / ev.quota) * 100));

            return (
              <div key={ev.id} className={`bg-white border border-slate-200 rounded-lg ${stripe} flex flex-col sm:flex-row items-stretch hover:border-slate-300 transition-colors`}>
                {/* Date badge */}
                <div className="hidden sm:flex flex-col items-center justify-center w-20 shrink-0 border-r border-slate-100 px-2 py-4 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{start.toLocaleDateString('id-ID', { month: 'short' })}</span>
                  <span className="text-2xl font-bold text-slate-900 leading-none">{start.getDate()}</span>
                  <span className="text-[10px] text-slate-400">{start.getFullYear()}</span>
                </div>

                {/* Info */}
                <div className="flex-1 p-4 sm:py-3 sm:px-4 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                      <Tag size={10} aria-hidden="true" /> {ev.category}
                    </span>
                    <span className="text-[11px] text-slate-400 sm:hidden">
                      {start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug truncate">{ev.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{ev.organization}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-400" />{ev.location}</span>
                    <span className="flex items-center gap-1"><Clock size={12} className="text-slate-400" />{start.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                    <span className="flex items-center gap-1"><Users size={12} className="text-slate-400" />{ev.registeredCount}/{ev.quota} peserta</span>
                  </div>
                </div>

                {/* Quota + register */}
                <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 px-4 py-3 sm:py-0 sm:w-40 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100">
                  <div className="w-full hidden sm:block">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Kuota</span>
                      <span>{pctFilled}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${quotaColor(ev.registeredCount, ev.quota)}`} style={{ width: `${pctFilled}%` }} />
                    </div>
                  </div>
                  <button
                    onClick={() => handleRegister(ev.id)}
                    disabled={full || registeringId === ev.id}
                    className={`w-full sm:mt-2 py-2 px-3 rounded text-xs font-semibold transition-colors min-h-[40px] ${
                      full ? 'bg-slate-100 text-slate-400' : 'bg-warm-600 hover:bg-warm-500 text-white'
                    }`}
                  >
                    {registeringId === ev.id ? 'Memproses...' : full ? 'Kuota Penuh' : 'Daftar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
