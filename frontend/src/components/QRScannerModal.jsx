import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, CheckCircle2, AlertCircle } from 'lucide-react';

export const QRScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const scannerRef = useRef(null);
  const processingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const html5QrCode = new Html5Qrcode('qr-reader');
    scannerRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 200, height: 200 } },
      async (text) => {
        if (processingRef.current) return;
        processingRef.current = true;
        await handleCode(text);
        setTimeout(() => { processingRef.current = false; }, 2000);
      },
      () => {}
    ).catch(() => {
      setError('Kamera tidak dapat diakses. Gunakan input kode tiket manual di bawah.');
    });

    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, [isOpen]);

  const handleCode = async (code) => {
    try {
      const res = await onScanSuccess(code);
      setSuccess(res);
      setError(null);
      setScanCount(c => c + 1);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message);
      setSuccess(null);
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleManual = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleCode(manualCode.trim());
    setManualCode('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg w-full max-w-lg border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-navy-700" aria-hidden="true" />
            <h3 className="font-bold text-slate-900 text-sm">Pemindai Presensi</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Dipindai: <strong className="text-slate-800">{scanCount}</strong></span>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded" aria-label="Tutup pemindai">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {success && (
            <div className="flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded text-sm">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-800">{success.data?.participant?.name || 'Berhasil'}</p>
                <p className="text-xs text-emerald-700">
                  NIM: {success.data?.participant?.nim || '-'} | {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-slate-900 rounded-lg overflow-hidden" style={{ minHeight: '280px' }}>
            <div id="qr-reader" className="w-full" />
          </div>

          <details className="border-t border-slate-200 pt-3">
            <summary className="text-xs font-semibold text-slate-600">Kamera bermasalah? Input kode manual</summary>
            <form onSubmit={handleManual} className="flex gap-2 mt-2">
              <label htmlFor="manual-ticket" className="sr-only">Kode tiket</label>
              <input
                id="manual-ticket"
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                placeholder="TKT-1-4-9823"
                className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm font-mono uppercase"
              />
              <button type="submit" className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded min-h-[40px]">
                Check-in
              </button>
            </form>
          </details>
        </div>
      </div>
    </div>
  );
};
