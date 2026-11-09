import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import { Shield, Check, X, Tag, Plus, Building2, Users } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sRes, cRes] = await Promise.all([
        apiFetch('/admin/stats'),
        apiFetch('/categories')
      ]);
      setStats(sRes.data);
      setCategories(cRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyOrg = async (orgId, status) => {
    try {
      await apiFetch(`/admin/organizations/${orgId}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName || !newCatSlug) return;

    try {
      await apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newCatName, slug: newCatSlug })
      });
      setNewCatName('');
      setNewCatSlug('');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 text-center rounded-lg border border-slate-200">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-campus-navy mb-2"></div>
        <p className="text-sm text-slate-600">Memuat data panel administrator...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 text-center rounded-lg border border-red-200">
        <p className="text-red-700 text-sm font-semibold mb-3">{error}</p>
        <button onClick={loadData} className="px-4 py-2 bg-slate-800 text-white text-xs rounded">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-slate-900">Panel Administrator Sistem</h2>
        <p className="text-xs text-slate-500">
          Otorisasi pengajuan UKM/Organisasi baru, kelola kategori kegiatan, dan pantau metrik kampus.
        </p>
      </div>

      {/* Statistik Riil Sistem */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Mahasiswa Terdaftar</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Organisasi / UKM</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalOrganizers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Total Kegiatan</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalEvents}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Pendaftaran Tiket</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalRegistrations}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Presensi Terverifikasi</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.totalAttendances}</p>
        </div>
      </div>

      {/* Validasi Organisasi Baru (Pending) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
          <Building2 size={16} className="text-blue-700" />
          <span>Pengajuan Akun UKM / Organisasi Baru ({stats.pendingOrgs.length})</span>
        </h3>

        {stats.pendingOrgs.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            Tidak ada pengajuan akun organisasi yang sedang menunggu verifikasi.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.pendingOrgs.map(org => (
              <div key={org.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{org.name}</h4>
                  <p className="text-xs text-slate-500">
                    Narahubung: {org.user.name} ({org.user.email}) | Diajukan: {new Date(org.createdAt).toLocaleDateString('id-ID')}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">{org.description || 'Tanpa deskripsi tambahan'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleVerifyOrg(org.id, 'approved')}
                    className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded"
                  >
                    <Check size={14} /> Setujui
                  </button>
                  <button
                    onClick={() => handleVerifyOrg(org.id, 'rejected')}
                    className="flex items-center gap-1 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold px-3 py-1.5 rounded"
                  >
                    <X size={14} /> Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manajemen Kategori Kegiatan */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
          <Tag size={16} className="text-blue-700" />
          <span>Kelola Kategori Event Kampus</span>
        </h3>

        <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => {
              setNewCatName(e.target.value);
              setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
            }}
            placeholder="Nama Kategori (contoh: Olahraga & Kebugaran)"
            className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs"
          />
          <input
            type="text"
            required
            value={newCatSlug}
            onChange={(e) => setNewCatSlug(e.target.value)}
            placeholder="slug-kategori"
            className="w-48 px-3 py-1.5 border border-slate-300 rounded text-xs font-mono bg-slate-50"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-1 px-4 py-1.5 bg-campus-navy hover:bg-blue-900 text-white text-xs font-semibold rounded shrink-0"
          >
            <Plus size={14} /> Tambah Kategori
          </button>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {categories.map(c => (
            <div key={c.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-800">{c.name}</span>
              <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                {c._count?.events || 0} event
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
