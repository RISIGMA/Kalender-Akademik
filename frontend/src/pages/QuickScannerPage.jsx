import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { Camera, CheckCircle2, AlertCircle, ArrowLeft, ArrowUpRight, Shield, UserCheck } from 'lucide-react';

export const QuickScannerPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  // Panitia Contextual Login (Tanpa password)
  const [nim, setNim] = useState('22102030');
  const [name, setName] = useState('Dimas Prasetyo');
  const [verifiedStaff, setVerifiedStaff] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Scanning State
  const [ticketInput, setTicketInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoadingEvent(true);
        const res = await apiFetch(`/events/${eventId}`);
        if (res.success) {
          setEvent(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingEvent(false);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId]);

  const handleVerifyStaff = async (e) => {
    e.preventDefault();
    try {
      setVerifying(true);
      setAuthError(null);
      const res = await apiFetch('/attendances/verify-scanner', {
        method: 'POST',
        body: JSON.stringify({
          eventId: parseInt(eventId),
          nim,
          name
        })
      });
      if (res.success) {
        setVerifiedStaff(res.data.staff);
      }
    } catch (err) {
      setAuthError(err.message || 'Verifikasi NIM panitia gagal.');
    } finally {
      setVerifying(false);
    }
  };

  const handleScanBarcode = async (e) => {
    if (e) e.preventDefault();
    if (!ticketInput.trim()) return;

    try {
      setScanning(true);
      setScanResult(null);
      setScanError(null);

      const res = await apiFetch('/attendances/scan', {
        method: 'POST',
        body: JSON.stringify({
          ticketCode: ticketInput.trim(),
          scannerNim: verifiedStaff?.nim || nim,
          scannerName: verifiedStaff?.name || name
        })
      });

      if (res.success) {
        setScanResult(res);
        setTicketInput('');
      }
    } catch (err) {
      setScanError(err.message || 'Presensi gagal');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0F11] text-[#F4F4F0] flex flex-col justify-between font-sans selection:bg-[#EA580C] selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-[#1E2024] p-4 sm:px-8 flex items-center justify-between">
        <Link 
          to="/" 
          className="font-mono text-xs text-[#A0A2AA] hover:text-white flex items-center gap-1.5 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft size={14} />
          <span>KEMBALI KE KALENDER</span>
        </Link>
        <span className="font-mono text-[10px] text-[#EA580C] uppercase tracking-widest font-black">
          RAPID SCANNER // MEJA REGISTRASI
        </span>
      </header>

      {/* Main Container (Mobile-First High Contrast Viewport) */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        
        {/* Header Event Info */}
        <div className="border border-[#262830] bg-[#181A20] p-4 mb-4 font-mono text-xs space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-[#EA580C] font-bold block">
            KEGIATAN AKTIF:
          </span>
          <h2 className="font-bold text-white uppercase text-sm line-clamp-1">{event?.title || 'Memuat Kegiatan...'}</h2>
          <p className="text-[#A0A2AA] text-[11px]">{event?.location}</p>
        </div>

        {!verifiedStaff ? (
          /* STEP 1: Verifikasi Panitia via NIM & Nama */
          <div className="bg-[#181A20] border-2 border-[#262830] p-6 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 bg-[#0E0F11] text-[#EA580C] border border-[#262830] flex items-center justify-center mx-auto mb-2">
                <Shield size={20} />
              </div>
              <h3 className="font-mono text-sm font-black uppercase text-white">OTORISASI STAF SCANNER</h3>
              <p className="font-mono text-[11px] text-[#A0A2AA]">
                Masukkan NIM & Nama yang telah didaftarkan pengurus UKM untuk membuka kamera HP.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-[#2A1414] border border-[#EF4444] text-[#FCA5A5] font-mono text-xs">
                {authError}
              </div>
            )}

            <form onSubmit={handleVerifyStaff} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block uppercase text-[10px] font-bold text-[#A0A2AA] mb-1">NIM PANITIA *</label>
                <input
                  type="text"
                  required
                  value={nim}
                  onChange={e => setNim(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0E0F11] border border-[#2E313B] text-white focus:outline-none focus:border-[#EA580C]"
                  placeholder="22102030"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] font-bold text-[#A0A2AA] mb-1">NAMA LENGKAP PANITIA *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0E0F11] border border-[#2E313B] text-white focus:outline-none focus:border-[#EA580C]"
                  placeholder="Dimas Prasetyo"
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-mono text-xs font-bold uppercase transition-all"
              >
                {verifying ? 'MEMVERIFIKASI...' : 'BUKA PEMINDAI BARCODE'}
              </button>
            </form>
          </div>
        ) : (
          /* STEP 2: Viewport Kamera Bidik & Barcode Gun Input */
          <div className="bg-[#181A20] border-2 border-[#262830] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#262830] font-mono text-xs">
              <div>
                <span className="text-[#10B981] font-bold flex items-center gap-1.5">
                  <UserCheck size={14} /> {verifiedStaff.name}
                </span>
                <span className="text-[10px] text-[#A0A2AA]">NIM: {verifiedStaff.nim}</span>
              </div>
              <button
                onClick={() => setVerifiedStaff(null)}
                className="text-[10px] text-[#A0A2AA] hover:text-[#EF4444] uppercase"
              >
                Ganti Petugas
              </button>
            </div>

            {/* Viewport Bidik Kamera Mobile First */}
            <div className="relative aspect-video bg-[#0E0F11] border-2 border-dashed border-[#EA580C]/60 flex flex-col items-center justify-center p-4">
              <div className="w-44 h-28 border border-[#EA580C] relative flex items-center justify-center">
                <div className="w-full h-0.5 bg-[#EF4444] animate-pulse" />
                <span className="absolute bottom-1 font-mono text-[9px] uppercase tracking-widest text-[#EA580C]">
                  ARAHKAN TIKET
                </span>
              </div>
              <p className="font-mono text-[10px] text-[#787B86] mt-2">Kamera Aktif &bull; Sesi 24 Jam</p>
            </div>

            {/* Input Barcode Cepat */}
            <form onSubmit={handleScanBarcode} className="flex gap-2 font-mono text-xs">
              <input
                type="text"
                autoFocus
                placeholder="SCAN / INPUT BARCODE TIKET..."
                value={ticketInput}
                onChange={e => setTicketInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#0E0F11] border border-[#2E313B] text-white focus:outline-none focus:border-[#EA580C]"
              />
              <button
                type="submit"
                disabled={scanning}
                className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold uppercase"
              >
                {scanning ? '...' : 'CHECK-IN'}
              </button>
            </form>

            {/* Notifikasi Hasil Scan */}
            {scanResult && (
              <div className="p-3 bg-[#064E3B] border border-[#10B981] text-white font-mono text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#34D399]">
                  <CheckCircle2 size={16} />
                  <span>PRESENSI BERHASIL!</span>
                </div>
                <p className="text-sm font-black">{scanResult.data?.participant?.name}</p>
                <p className="text-[10px] text-[#A7F3D0]">
                  {scanResult.data?.participant?.nim || scanResult.data?.participant?.institution} &bull; {new Date(scanResult.data?.scannedAt).toLocaleTimeString('id-ID')} WIB
                </p>
              </div>
            )}

            {scanError && (
              <div className="p-3 bg-[#450A0A] border border-[#EF4444] text-[#FCA5A5] font-mono text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#F87171]">
                  <AlertCircle size={16} />
                  <span>PERINGATAN PRESENSI</span>
                </div>
                <p className="text-[11px] leading-relaxed">{scanError}</p>
              </div>
            )}
          </div>
        )}

      </main>

      <footer className="border-t border-[#1E2024] p-4 text-center font-mono text-[10px] text-[#575A65]">
        UNIVERSITAS JANABADRA YOGYAKARTA &bull; PROTOKOL MULTI-SCANNER AUDIT TRAIL
      </footer>
    </div>
  );
};
