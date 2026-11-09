import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowUpRight, ArrowLeft, Shield, Lock, Mail, AlertCircle, Building2 } from 'lucide-react';
import { apiFetch } from '../api/client';

export const OrganizerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('hmti@janabadra.ac.id');
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
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        navigate('/penyelenggara/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0F11] text-[#F4F4F0] flex flex-col justify-between font-sans selection:bg-[#EA580C] selection:text-white">
      {/* Top Header Navigation */}
      <header className="border-b border-[#1E2024] p-4 sm:px-8 flex items-center justify-between">
        <Link 
          to="/" 
          className="font-mono text-xs text-[#A0A2AA] hover:text-white flex items-center gap-1.5 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft size={14} />
          <span>KEMBALI KE KALENDER PUBLIK</span>
        </Link>
        <span className="font-mono text-[10px] text-[#EA580C] uppercase tracking-widest font-black">
          ORGANIZER GATEWAY // UJB
        </span>
      </header>

      {/* Main Container: Editorial Asymmetric Split */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-center">
          
          {/* Kolom Kiri: Visual Branding & Technical Context (7 Kolom) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#181A20] border border-[#262830] text-[10px] font-mono uppercase font-bold text-[#EA580C] tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] animate-ping" />
              <span>AKREDITASI & LEGALITAS UKM</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-[0.95] text-white">
              PORTAL PENGURUS <br />
              <span className="text-stroke text-transparent underline decoration-[#EA580C] decoration-4">
                KEPANITIAAN UKM
              </span> <br />
              UNIVERSITAS.
            </h1>

            <p className="text-xs sm:text-sm text-[#A0A2AA] max-w-md font-mono leading-relaxed">
              Pusat kendali mandiri untuk mengajukan kegiatan ke dekanat, mendaftarkan staf pemindai barcode meja registrasi, serta mengekspor Live Spreadsheet presensi LPJ 24 jam.
            </p>

            <div className="p-4 bg-[#14151B] border border-[#22242C] rounded-xs font-mono text-[11px] text-[#787B86] space-y-2">
              <span className="text-[#F4F4F0] font-bold block uppercase">// KETENTUAN BIROKRASI:</span>
              <p>
                Akun resmi UKM/BEM diterbitkan oleh Admin Kampus setelah berkas fisik proposal kegiatan ditandatangani oleh dekanat/pembina.
              </p>
            </div>
          </div>

          {/* Kolom Kanan: High-Contrast Technical Form (5 Kolom) */}
          <div className="lg:col-span-5 bg-[#181A20] border-2 border-[#262830] p-6 sm:p-8 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#EA580C]" />

            <div className="space-y-1 mb-6">
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#EA580C]">
                AUTENTIKASI KREDENSIAL
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                MASUK SEBAGAI PENYELENGGARA
              </h2>
            </div>

            {error && (
              <div className="p-3 mb-4 bg-[#2A1414] border border-[#EF4444] text-[#FCA5A5] text-xs font-mono flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block uppercase text-[10px] font-bold text-[#A0A2AA] mb-1">
                  EMAIL RESMI UKM / PENYELENGGARA *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0E0F11] border border-[#2E313B] text-white focus:outline-none focus:border-[#EA580C] rounded-xs"
                    placeholder="organizer@janabadra.ac.id"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase text-[10px] font-bold text-[#A0A2AA] mb-1">
                  KATA SANDI RESMI *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0E0F11] border border-[#2E313B] text-white focus:outline-none focus:border-[#EA580C] rounded-xs"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#EA580C] hover:bg-[#C2410C] active:translate-y-0.5 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>{loading ? 'MEMVERIFIKASI...' : 'MASUK KE WORKSPACE KEPANITIAAN'}</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-[#262830] text-[10px] font-mono text-[#787B86] text-center">
              DEFAULT DEMO // hmti@janabadra.ac.id &bull; password123
            </div>
          </div>

        </div>
      </main>

      {/* Footer Identity */}
      <footer className="border-t border-[#1E2024] p-4 text-center font-mono text-[10px] text-[#575A65]">
        UNIVERSITAS JANABADRA YOGYAKARTA &bull; PROTOKOL AKSES RESMI ORGANISASI KEMAHASISWAAN
      </footer>
    </div>
  );
};
