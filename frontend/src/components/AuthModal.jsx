import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import { X, AlertCircle } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [tab, setTab] = useState('login');
  const [role, setRole] = useState('user');
  const [form, setForm] = useState({ name: '', email: '', password: '', nim: '', phone: '', orgName: '', orgDesc: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Close on Escape (R-32)
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fill = (email, password) => setForm(f => ({ ...f, email, password }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (tab === 'login') {
        const res = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        login(res.data.token, res.data.user);
      } else {
        const res = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ ...form, role }),
        });
        login(res.data.token, res.data.user);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg w-full max-w-md border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex gap-6">
            <button
              onClick={() => { setTab('login'); setError(null); }}
              className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${
                tab === 'login' ? 'border-warm-600 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => { setTab('register'); setError(null); }}
              className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${
                tab === 'register' ? 'border-warm-600 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Daftar Baru
            </button>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded" aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 text-sm bg-red-50 text-red-800 border border-red-200 rounded">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Demo credentials: collapsible details (R-26: real interactive element) */}
          {tab === 'login' && (
            <details className="mb-4 text-xs">
              <summary className="font-semibold text-slate-600 py-1">Akun Demo Tersedia</summary>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Admin Sistem', email: 'admin@kampus.ac.id' },
                  { label: 'Panitia HMTI', email: 'hmti@kampus.ac.id' },
                  { label: 'Mahasiswa (Zaki)', email: 'ahmad.zaki@student.ac.id' },
                  { label: 'Mahasiswa (Sarah)', email: 'sarah.amanda@student.ac.id' },
                ].map(d => (
                  <button
                    key={d.email}
                    type="button"
                    onClick={() => fill(d.email, 'password123')}
                    className="text-left px-2.5 py-2 bg-slate-50 border border-slate-200 rounded hover:bg-navy-50 hover:border-navy-700 transition-colors min-h-[40px]"
                  >
                    <span className="block font-semibold text-slate-800">{d.label}</span>
                    <span className="block text-[10px] text-slate-500 font-mono truncate">{d.email}</span>
                  </button>
                ))}
              </div>
            </details>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <>
                <fieldset className="flex gap-4 p-3 bg-slate-50 rounded border border-slate-200">
                  <legend className="text-xs font-semibold text-slate-600 px-1">Tipe Akun</legend>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input type="radio" name="role" checked={role === 'user'} onChange={() => setRole('user')} />
                    Mahasiswa
                  </label>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input type="radio" name="role" checked={role === 'organizer'} onChange={() => setRole('organizer')} />
                    Pengurus UKM
                  </label>
                </fieldset>

                <div>
                  <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                  <input id="reg-name" type="text" required value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:border-navy-700 focus:ring-1 focus:ring-navy-700" />
                </div>

                {role === 'user' && (
                  <div>
                    <label htmlFor="reg-nim" className="block text-xs font-semibold text-slate-700 mb-1">NIM</label>
                    <input id="reg-nim" type="text" value={form.nim}
                      onChange={e => setForm({ ...form, nim: e.target.value })}
                      placeholder="21102045"
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
                  </div>
                )}

                {role === 'organizer' && (
                  <div>
                    <label htmlFor="reg-org" className="block text-xs font-semibold text-slate-700 mb-1">Nama Organisasi / UKM</label>
                    <input id="reg-org" type="text" required value={form.orgName}
                      onChange={e => setForm({ ...form, orgName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
                  </div>
                )}
              </>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input id="auth-email" type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="nama@kampus.ac.id"
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:border-navy-700 focus:ring-1 focus:ring-navy-700" />
            </div>

            <div>
              <label htmlFor="auth-pass" className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi</label>
              <input id="auth-pass" type="password" required value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:border-navy-700 focus:ring-1 focus:ring-navy-700" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-warm-600 hover:bg-warm-500 disabled:bg-slate-300 text-white font-semibold rounded text-sm transition-colors min-h-[44px]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : tab === 'login' ? 'Masuk ke Akun' : 'Buat Akun Baru'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
