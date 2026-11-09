import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowUpRight, ArrowLeft, Shield, Lock, AlertCircle } from 'lucide-react';
import { apiFetch } from '../api/client';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@janabadra.ac.id');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (res.token) {
        if (res.user.role !== 'admin') {
          throw new Error('Akun ini tidak memiliki hak akses administrator birokrasi.');
        }
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-[#0E0F11] flex flex-col justify-between font-sans selection:bg-[#0E0F11] selection:text-white">
      <header className="border-b border-[#E2E1DA] p-4 sm:px-8 flex items-center justify-between">
        <Link 
          to="/" 
          className="font-mono text-xs text-[#575A65] hover:text-[#0E0F11] flex items-center gap-1.5 transition-colors uppercase tracking-wider font-bold"
        >
          <ArrowLeft size={14} />
          <span>KEMBALI KE KALENDER PUBLIK</span>
        </Link>
        <span className="font-mono text-[10px] text-[#0E0F11] uppercase tracking-widest font-black">
          SYSTEM ADMINISTRATOR // DEKANAT UJB
        </span>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto p-4 flex items-center">
        <div className="w-full bg-white border-2 border-[#0E0F11] p-8 shadow-2xl space-y-6">
          <div className="space-y-1 text-center">
            <div className="w-12 h-12 bg-[#0E0F11] text-white flex items-center justify-center mx-auto mb-3">
              <Shield size={24} />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">
              BIROKRASI KEMAHASISWAAN
            </span>
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#0E0F11]">
              PORTAL ADMIN KAMPUS
            </h2>
            <p className="text-xs font-mono text-[#575A65] pt-1">
              Verifikasi berkas fisik proposal kegiatan dan penerbitan akun penyelenggara.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-[#FEE2E2] border border-[#DC2626] text-[#991B1B] text-xs font-mono flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block uppercase text-[10px] font-bold text-[#0E0F11] mb-1">
                EMAIL ADMINISTRATOR *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-[#0E0F11] text-[#0E0F11] focus:outline-none focus:ring-1 focus:ring-[#0E0F11]"
                placeholder="admin@janabadra.ac.id"
              />
            </div>

            <div>
              <label className="block uppercase text-[10px] font-bold text-[#0E0F11] mb-1">
                KATA SANDI RESMI *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-[#0E0F11] text-[#0E0F11] focus:outline-none focus:ring-1 focus:ring-[#0E0F11]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0E0F11] hover:bg-[#22242B] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'AUTENTIKASI...' : 'MASUK KE PANEL ADMIN'}</span>
              <ArrowUpRight size={14} />
            </button>
          </form>

          <div className="pt-3 border-t border-[#E2E1DA] text-[10px] font-mono text-[#575A65] text-center">
            DEFAULT DEMO // admin@janabadra.ac.id &bull; password123
          </div>
        </div>
      </main>

      <footer className="border-t border-[#E2E1DA] p-4 text-center font-mono text-[10px] text-[#575A65]">
        UNIVERSITAS JANABADRA YOGYAKARTA &bull; BIRO KEMAHASISWAAN & ALUMNI
      </footer>
    </div>
  );
};
