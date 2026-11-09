import React, { useState } from 'react';
import { apiFetch } from '../api/client';
import { Camera, CheckCircle2, AlertCircle, X, Shield, ArrowRight, UserCheck } from 'lucide-react';

export const ScannerView = ({ activeEvent, onClose }) => {
  const [nim, setNim] = useState('22102030');
  const [name, setName] = useState('Dimas Prasetyo');
  const [isStaffVerified, setIsStaffVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [staffInfo, setStaffInfo] = useState(null);

  // Scan state
  const [ticketInput, setTicketInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  // 1. Verifikasi NIM & Nama Panitia untuk event ini (Kontekstual tanpa password)
  const handleVerifyStaff = async (e) => {
    e.preventDefault();
    if (!nim || !name) return;

    try {
      setVerifying(true);
      setScanError(null);
      const res = await apiFetch('/attendances/verify-scanner', {
        method: 'POST',
        body: JSON.stringify({
          eventId: activeEvent?.id,
          nim,
          name
        })
      });

      if (res.success) {
        setIsStaffVerified(true);
        setStaffInfo(res.data.staff);
      }
    } catch (err) {
      setScanError(err.message || 'Verifikasi petugas scanner gagal');
    } finally {
      setVerifying(false);
    }
  };

  // 2. Submit Barcode / QR Code Presensi
  const handleProcessBarcode = async (codeToScan) => {
    const code = codeToScan || ticketInput;
    if (!code.trim()) return;

    try {
      setScanning(true);
      setScanResult(null);
      setScanError(null);

      const res = await apiFetch('/attendances/scan', {
        method: 'POST',
        body: JSON.stringify({
          ticketCode: code.trim(),
          scannerNim: staffInfo?.nim || nim,
          scannerName: staffInfo?.name || name
        })
      });

      if (res.success) {
        setScanResult(res);
        setTicketInput('');
      }
    } catch (err) {
      setScanError(err.message || 'Presensi gagal diproses');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 flex flex-col">
        {/* Header Scanner */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold leading-tight">Pemindai Barcode Presensi</h3>
              <p className="text-[10px] text-slate-400 font-medium">Universitas Janabadra &bull; Sesi 24 Jam</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Detail Event Konteks */}
        <div className="bg-blue-50/60 p-3 border-b border-blue-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wider">Event:</span>
            <p className="font-extrabold text-slate-900 line-clamp-1">{activeEvent?.title || 'Kegiatan Kampus UJB'}</p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Sesi Terbuka
          </span>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {!isStaffVerified ? (
            /* STEP 1: Login Kontekstual Tanpa Password untuk Panitia Scanner */
            <form onSubmit={handleVerifyStaff} className="space-y-3">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Shield size={24} />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">Otorisasi Petugas Scanner</h4>
                <p className="text-[11px] text-slate-500">
                  Masukkan NIM dan Nama Anda yang telah didaftarkan oleh ketua panitia untuk membuka pemindai.
                </p>
              </div>

              {scanError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{scanError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">NIM Panitia *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 22102030"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-600 outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Lengkap Panitia *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dimas Prasetyo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-600 outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{verifying ? 'Memvalidasi Panitia...' : 'Masuk & Aktifkan Scanner'}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          ) : (
            /* STEP 2: Kamera / Pemindai Barcode Aktif & Input Manual */
            <div className="space-y-4">
              {/* Petugas Banner Info (Audit Trail) */}
              <div className="p-2.5 rounded-xl bg-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <UserCheck size={16} className="text-emerald-600" />
                  <div>
                    <p className="font-extrabold text-slate-900 leading-none">{staffInfo?.name || name}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">NIM: {staffInfo?.nim || nim} &bull; {staffInfo?.roleName || 'Petugas Meja'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsStaffVerified(false)}
                  className="text-[10px] font-bold text-slate-400 hover:text-red-600"
                >
                  Ganti
                </button>
              </div>

              {/* Viewport Bidik Kamera Scanner (Mobile First UI) */}
              <div className="relative aspect-video rounded-2xl bg-slate-950 flex flex-col items-center justify-center border-2 border-dashed border-blue-500/50 overflow-hidden text-center p-4">
                <div className="w-40 h-28 border-2 border-amber-400 rounded-xl relative flex items-center justify-center">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-400" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-400" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-400" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-400" />
                  <span className="w-full h-0.5 bg-red-500 absolute animate-pulse shadow-sm shadow-red-500" />
                  <p className="text-[10px] text-amber-300 font-mono">ARAHKAN BARCODE</p>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Kamera aktif &bull; Mendukung scan cepat via HP</p>
              </div>

              {/* Form Input Barcode Manual / Barcode Scanner Gun */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleProcessBarcode(); }}
                className="space-y-2"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Tempel / Ketik Kode Barcode (Contoh: TKT-UJB-...)"
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-600 outline-hidden font-mono"
                  />
                  <button
                    type="submit"
                    disabled={scanning}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    {scanning ? 'Scan...' : 'Check-In'}
                  </button>
                </div>
              </form>

              {/* Feedback Notifikasi Audio Visual */}
              {scanResult && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1 animate-in zoom-in-95">
                  <div className="flex items-center gap-1.5 font-extrabold text-emerald-800">
                    <CheckCircle2 size={16} />
                    <span>{scanResult.message}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Peserta: <strong>{scanResult.data?.participant?.name}</strong> ({scanResult.data?.participant?.nim || scanResult.data?.participant?.institution})
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Pukul {new Date(scanResult.data?.scannedAt).toLocaleTimeString('id-ID')} WIB &bull; Dicatat oleh: {scanResult.data?.scannedByName}
                  </p>
                </div>
              )}

              {scanError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs space-y-1 animate-in zoom-in-95">
                  <div className="flex items-center gap-1.5 font-extrabold text-red-800">
                    <AlertCircle size={16} />
                    <span>Perhatian!</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{scanError}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
