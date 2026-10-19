import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X, Share, PlusSquare, Smartphone, Sparkles, Check } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Jika sudah terpasang sebagai aplikasi mandiri (standalone), sembunyikan otomatis
  if (isInstalled || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setIsOpen(false);
      }
    } else if (isIOS) {
      setIsOpen(true);
    } else {
      // Browser desktop atau generic
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Floating Gentle Pill Notification at the top or subtle prompt */}
      <div className="mx-3.5 my-1 z-20 shrink-0">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 p-2.5 text-white shadow-md flex items-center justify-between gap-2.5">
          {/* Ambient light blur */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs truncate">Pasang SAE di Menu HP Kamu</p>
              <p className="text-[10px] text-blue-100 truncate">1 Klik, ringan & langsung fullscreen</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-white text-blue-700 font-extrabold text-[11px] shadow-xs hover:bg-blue-50 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>Install</span>
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              aria-label="Tutup"
              className="w-6 h-6 rounded-full hover:bg-white/20 text-white/80 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Guided Modal for iOS / Browser Instructions */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm bg-white rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl border border-white/90 text-slate-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-black text-xl shadow-md">
                  ✦
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Pasang Aplikasi SAE</h3>
                  <p className="text-xs text-slate-500">Muncul di halaman menu HP</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              /* Panduan Safari iOS */
              <div className="space-y-3 pt-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="font-semibold text-slate-800">Cara pasang di iPhone / iPad (Safari):</p>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <p>
                    Tekan tombol <strong>Bagikan (Share)</strong> <Share className="inline w-3.5 h-3.5 text-blue-600 mx-1" /> di bilah bawah browser Safari.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <p>
                    Geser ke bawah dan pilih <strong>"Add to Home Screen"</strong> (Tambah ke Layar Utama) <PlusSquare className="inline w-3.5 h-3.5 text-blue-600 mx-1" />.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <p>
                    Tekan <strong>"Add"</strong> di pojok kanan atas. Ikon SAE langsung muncul di menu HP kamu!
                  </p>
                </div>
              </div>
            ) : isInstallable ? (
              /* Android / Chromium One-Click */
              <div className="space-y-3 pt-1">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Aplikasi SAE akan langsung terpasang di layar utama HP kamu. Ringan, cepat, dan bisa dibuka layar penuh kapan saja.
                </p>
                <button
                  onClick={async () => {
                    await install();
                    setIsOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Pasang Sekarang (Gratis)</span>
                </button>
              </div>
            ) : (
              /* Desktop / Browser Preview */
              <div className="space-y-3 pt-1 text-xs text-slate-600">
                <p className="leading-relaxed">
                  Buka link aplikasi ini di ponsel kamu (Chrome di Android atau Safari di iOS) untuk langsung menginstalnya ke layar menu HP.
                </p>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 text-blue-700 font-medium">
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <span>Kompatibel 100% dengan Android & iPhone</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      )}
    </>
  );
};
