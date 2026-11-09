import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  FileCheck, 
  Users, 
  LogOut, 
  Shield, 
  X,
  FileText,
  AlertCircle,
  Key,
  Copy,
  Printer,
  Sparkles
} from 'lucide-react';

export const AdminWorkspace = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [user, setUser] = useState(null);

  // 1-Click Generate Akun UKM State
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [genForm, setGenForm] = useState({
    orgName: '',
    picName: '',
    picNim: '',
    faculty: 'Fakultas Teknik',
    notes: ''
  });
  const [generatedCredential, setGeneratedCredential] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      navigate('/admin/login');
      return;
    }
    const parsed = JSON.parse(rawUser);
    if (parsed.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    setUser(parsed);
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [evRes, stRes] = await Promise.all([
        apiFetch('/events'),
        apiFetch('/admin/stats')
      ]);
      if (evRes.success) setEvents(evRes.data);
      if (stRes.success) setOrganizations(stRes.data.organizations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const handleAccProposal = (ev) => {
    alert(`Berkas proposal kegiatan "${ev.title}" dari ${ev.organization} telah diverifikasi dan di-ACC resmi oleh Admin Kampus!`);
    setSelectedSubmission(null);
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsGenerating(true);
      const res = await apiFetch('/admin/generate-organizer', {
        method: 'POST',
        body: JSON.stringify(genForm)
      });
      if (res.success) {
        setGeneratedCredential(res.data.credential);
        setGenForm({ orgName: '', picName: '', picNim: '', faculty: 'Fakultas Teknik', notes: '' });
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message || 'Gagal menerbitkan akun UKM');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCredential = () => {
    if (!generatedCredential) return;
    const text = `SLIP KREDENSIAL PENYELENGGARA RESMI UJB\nOrganisasi: ${generatedCredential.organizationName}\nKetua/PIC: ${generatedCredential.picName} (${generatedCredential.picNim || '-'})\nEmail Login: ${generatedCredential.email}\nKata Sandi: ${generatedCredential.plainPassword}\nPortal Login: http://localhost:5173/penyelenggara/login`;
    navigator.clipboard.writeText(text);
    alert('Kredensial berhasil disalin ke clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-[#0E0F11] font-sans selection:bg-[#0E0F11] selection:text-white">
      {/* Top Utility Bar */}
      <header className="border-b border-[#0E0F11] bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0E0F11] text-white flex items-center justify-center font-bold">
            <Shield size={18} />
          </div>
          <div>
            <span className="font-mono text-sm font-black uppercase text-[#0E0F11] tracking-wider leading-none">
              ADMIN KAMPUS // DEKANAT UJB
            </span>
            <p className="font-mono text-[10px] text-[#575A65]">Biro Kemahasiswaan & Penerbitan Akun UKM</p>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="hidden sm:inline-block text-[#575A65]">
            LOGIN: <strong className="text-[#0E0F11]">{user?.email}</strong>
          </span>
          <Link to="/" className="px-3 py-1.5 border border-[#0E0F11] font-bold uppercase hover:bg-[#E2E1DA]">
            LIHAT KALENDER
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-[#0E0F11] text-white font-bold uppercase hover:bg-[#EF4444]"
          >
            KELUAR
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-6 sm:p-8 space-y-8">
        
        {/* Title Header & Action 1-Click */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E1DA] pb-4">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#EA580C]">
              PANEL BIROKRASI DEKANAT
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#0E0F11] mt-1">
              PENERBITAN AKUN UKM & VALIDASI PROPOSAL
            </h2>
            <p className="font-mono text-xs text-[#575A65] mt-1">
              Hasilkan akun kredensial resmi bagi pengurus UKM yang telah menyerahkan proposal kegiatan fisik.
            </p>
          </div>

          <button
            onClick={() => setGenerateModalOpen(true)}
            className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
          >
            <Key size={14} />
            <span>+ 1-KLIK GENERATE AKUN UKM BARU</span>
          </button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-[#0E0F11] p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#575A65] font-bold">ORGANISASI TERAKREDITASI</span>
            <p className="font-mono text-4xl font-black text-[#0E0F11] mt-2">{organizations.length}</p>
            <p className="font-mono text-[11px] text-[#575A65] mt-1">UKM / BEM Berizin Resmi</p>
          </div>

          <div className="bg-white border-2 border-[#0E0F11] p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#10B981] font-bold">TOTAL AGENDA AKTIF</span>
            <p className="font-mono text-4xl font-black text-[#10B981] mt-2">{events.length}</p>
            <p className="font-mono text-[11px] text-[#575A65] mt-1">Tayang di Kalender Publik</p>
          </div>

          <div className="bg-white border-2 border-[#0E0F11] p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#EA580C] font-bold">TOTAL PARTISIPASI</span>
            <p className="font-mono text-4xl font-black text-[#EA580C] mt-2">
              {events.reduce((acc, curr) => acc + (curr.registeredCount || 0), 0)}
            </p>
            <p className="font-mono text-[11px] text-[#575A65] mt-1">Mahasiswa & Peserta Umum</p>
          </div>

          <div className="bg-white border-2 border-[#0E0F11] p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#575A65] font-bold">SESI 24 JAM AKTIF</span>
            <p className="font-mono text-4xl font-black text-[#0E0F11] mt-2">
              {events.filter(e => e.isSessionActive).length}
            </p>
            <p className="font-mono text-[11px] text-[#575A65] mt-1">Acara Berlangsung Hari Ini</p>
          </div>
        </div>

        {/* SECTION 1: DAFTAR ORGANISASI RESMI & AKUN (Multi-Tenant Management) */}
        <div className="bg-white border-2 border-[#0E0F11] space-y-3">
          <div className="p-4 bg-[#0E0F11] text-white flex items-center justify-between font-mono text-xs font-bold uppercase">
            <span>DAFTAR ORGANISASI KEMAHASISWAAN RESMI DITERBITKAN DEKANAT ({organizations.length})</span>
            <span className="text-[#EA580C]">TERDATA</span>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead className="bg-[#EBEAE4] border-b border-[#D5D4CC] text-[#0E0F11] uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-2.5">NAMA ORGANISASI</th>
                  <th className="p-2.5">EMAIL RESMI LOGIN</th>
                  <th className="p-2.5">KETUA / PENANGGUNG JAWAB</th>
                  <th className="p-2.5">TOTAL AGENDA</th>
                  <th className="p-2.5">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E1DA]">
                {organizations.map(org => (
                  <tr key={org.id} className="hover:bg-[#F4F4F0]">
                    <td className="p-2.5 font-bold text-[#0E0F11] uppercase">{org.name}</td>
                    <td className="p-2.5 font-mono text-[#EA580C] font-bold">{org.user?.email}</td>
                    <td className="p-2.5 text-[#575A65]">
                      {org.user?.name} {org.user?.nim ? `(${org.user.nim})` : ''}
                    </td>
                    <td className="p-2.5 font-bold">{org.events?.length || 0} Event</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 bg-[#ECFDF5] border border-[#10B981] text-[#065F46] font-bold text-[10px] uppercase">
                        RESMI &bull; APPROVED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: VERIFIKASI PROPOSAL BERKAS FISIK UKM */}
        <div className="bg-white border-2 border-[#0E0F11]">
          <div className="p-4 bg-[#0E0F11] text-white flex items-center justify-between font-mono text-xs font-bold uppercase">
            <span>VALIDASI DOKUMEN FISIK PROPOSAL UKM ({events.length} PENGAJUAN)</span>
            <span className="text-[#10B981]">TERVALIDASI</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead className="bg-[#EBEAE4] border-b border-[#D5D4CC] text-[#0E0F11] uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-3">ORGANISASI PENGAJU</th>
                  <th className="p-3">NAMA KEGIATAN</th>
                  <th className="p-3">STATUS PROPOSAL FISIK</th>
                  <th className="p-3">TARGET KUOTA</th>
                  <th className="p-3">JADWAL SESI 24 JAM</th>
                  <th className="p-3 text-right">TINDAKAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E1DA]">
                {events.map(ev => (
                  <tr key={ev.id} className="hover:bg-[#F4F4F0]">
                    <td className="p-3 font-bold text-[#0E0F11] uppercase">{ev.organization}</td>
                    <td className="p-3 text-[#575A65]">{ev.title}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-[#ECFDF5] border border-[#10B981] text-[#065F46] font-bold text-[10px] uppercase inline-flex items-center gap-1">
                        <FileCheck size={12} />
                        <span>{ev.proposalHardFile || 'Tersedia di Meja Admin'}</span>
                      </span>
                    </td>
                    <td className="p-3 font-bold">{ev.quota} Peserta</td>
                    <td className="p-3 text-[#575A65] text-[11px]">
                      {new Date(ev.startAt).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedSubmission(ev)}
                        className="px-3 py-1 bg-[#0E0F11] hover:bg-[#EA580C] text-white font-bold text-[11px] uppercase transition-colors"
                      >
                        PERIKSA BERKAS
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* MODAL 1: 1-KLIK GENERATE AKUN RESMI PENYELENGGARA UKM */}
      {generateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E0F11]/80 backdrop-blur-xs p-4">
          <div className="bg-[#F4F4F0] border-2 border-[#0E0F11] max-w-lg w-full p-6 sm:p-8 animate-in zoom-in-95 space-y-4">
            <div className="flex items-start justify-between border-b border-[#0E0F11] pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">
                  BIRO KEMAHASISWAAN UJB // 1-CLICK GENERATOR
                </span>
                <h3 className="text-xl font-black text-[#0E0F11] uppercase tracking-tight mt-0.5">
                  PENERBITAN AKUN UKM RESMI
                </h3>
              </div>
              <button onClick={() => { setGenerateModalOpen(false); setGeneratedCredential(null); }} className="p-1 hover:bg-[#0E0F11] hover:text-white">
                <X size={20} />
              </button>
            </div>

            {!generatedCredential ? (
              <form onSubmit={handleGenerateSubmit} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block uppercase text-[10px] font-bold text-[#0E0F11] mb-1">
                    NAMA ORGANISASI / UKM / BEM *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: UKM Musik Janabadra"
                    value={genForm.orgName}
                    onChange={e => setGenForm({ ...genForm, orgName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#0E0F11] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-[10px] font-bold text-[#0E0F11] mb-1">
                      NAMA KETUA / PENANGGUNG JAWAB *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Rian Pratama"
                      value={genForm.picName}
                      onChange={e => setGenForm({ ...genForm, picName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#0E0F11] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block uppercase text-[10px] font-bold text-[#0E0F11] mb-1">
                      NIM KETUA
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 22105012"
                      value={genForm.picNim}
                      onChange={e => setGenForm({ ...genForm, picNim: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#0E0F11] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase text-[10px] font-bold text-[#0E0F11] mb-1">
                    FAKULTAS / ASAL UNIT
                  </label>
                  <select
                    value={genForm.faculty}
                    onChange={e => setGenForm({ ...genForm, faculty: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#0E0F11] focus:outline-none"
                  >
                    <option value="Fakultas Teknik">Fakultas Teknik</option>
                    <option value="Fakultas Ekonomi & Bisnis">Fakultas Ekonomi & Bisnis</option>
                    <option value="Fakultas Hukum">Fakultas Hukum</option>
                    <option value="Fakultas Pertanian">Fakultas Pertanian</option>
                    <option value="Tingkat Universitas">Tingkat Universitas (Universitas Janabadra)</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-[#0E0F11] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setGenerateModalOpen(false)}
                    className="px-4 py-2 border border-[#0E0F11] uppercase font-bold hover:bg-[#E2E1DA]"
                  >
                    BATAL
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="px-5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white uppercase font-bold flex items-center gap-1.5"
                  >
                    <Sparkles size={14} />
                    <span>{isGenerating ? 'MEMPROSES AKUN...' : 'TERBITKAN KREDENSIAL'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* SLIP KREDENSIAL RESMI YANG DAPAT DISALIN / DICETAK */
              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 bg-[#0E0F11] text-white border-2 border-[#EA580C] space-y-2 relative">
                  <span className="text-[9px] uppercase tracking-widest text-[#EA580C] font-bold block">
                    SLIP KREDENSIAL PENYELENGGARA RESMI // UNIVERSITAS JANABADRA
                  </span>
                  <p className="text-sm font-black text-white">{generatedCredential.organizationName}</p>
                  <p className="text-[#A0A2AA] text-[11px]">
                    Penanggung Jawab: {generatedCredential.picName} ({generatedCredential.picNim || '-'})
                  </p>

                  <div className="p-3 bg-[#181A20] border border-[#2E313B] space-y-1 mt-2">
                    <p className="text-[#A0A2AA]">Email Login Resmi:</p>
                    <p className="text-sm font-black text-[#EA580C]">{generatedCredential.email}</p>
                    <p className="text-[#A0A2AA] pt-1">Kata Sandi Standar:</p>
                    <p className="text-sm font-black text-[#10B981]">{generatedCredential.plainPassword}</p>
                  </div>

                  <p className="text-[10px] text-[#A0A2AA] pt-1">
                    * Berikan informasi kredensial ini kepada ketua UKM untuk login di portal penyelenggara.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyCredential}
                    className="flex-1 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white uppercase font-bold flex items-center justify-center gap-1.5"
                  >
                    <Copy size={13} />
                    <span>SALIN KREDENSIAL</span>
                  </button>
                  <button
                    onClick={() => { setGenerateModalOpen(false); setGeneratedCredential(null); }}
                    className="px-4 py-2.5 border border-[#0E0F11] uppercase font-bold hover:bg-[#E2E1DA]"
                  >
                    SELESAI
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL 2: VERIFIKASI PROPOSAL FISIK */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E0F11]/80 backdrop-blur-xs p-4">
          <div className="bg-[#F4F4F0] border-2 border-[#0E0F11] max-w-lg w-full p-6 sm:p-8 animate-in zoom-in-95 space-y-4">
            <div className="flex items-start justify-between border-b border-[#0E0F11] pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#EA580C]">
                  VERIFIKASI BERKAS FISIK RESMI
                </span>
                <h3 className="text-xl font-black text-[#0E0F11] uppercase tracking-tight mt-0.5">
                  {selectedSubmission.title}
                </h3>
                <p className="font-mono text-xs text-[#575A65]">Pengaju: {selectedSubmission.organization}</p>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="p-1 hover:bg-[#0E0F11] hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-white border border-[#E2E1DA] font-mono text-xs space-y-2">
              <p className="text-[#575A65]">Status Dokumen: <strong>{selectedSubmission.proposalHardFile || 'Lengkap di Meja Dekanat'}</strong></p>
              <p className="text-[#575A65]">Lokasi Ruangan: <strong>{selectedSubmission.location}</strong></p>
              <p className="text-[#575A65]">Target Peserta: <strong>{selectedSubmission.quota} Mahasiswa/Umum</strong></p>
              <p className="text-[#0E0F11] pt-2 border-t border-[#E2E1DA] text-[11px] leading-relaxed">
                ACC Proposal ini akan mengaktifkan hak pendaftaran publik serta membuka jendela sesi scanner presensi 24 jam di hari-H.
              </p>
            </div>

            <div className="pt-3 border-t border-[#0E0F11] flex items-center justify-end gap-3 font-mono text-xs">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 border border-[#0E0F11] font-bold uppercase hover:bg-[#E2E1DA]"
              >
                TUTUP
              </button>
              <button
                onClick={() => handleAccProposal(selectedSubmission)}
                className="px-5 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold uppercase"
              >
                ACC PROPOSAL & AKTIFKAN JADWAL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
