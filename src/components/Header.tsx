import React, { useState } from 'react';
import { Bell, Download, Smartphone, X, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenAdmin?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenAdmin,
  unreadCount = 2,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sae_pwa_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    try {
      localStorage.setItem('sae_pwa_dismissed', 'true');
    } catch {
      // Safely ignore storage error
    }
  };

  const tapCountRef = React.useRef(0);
  const tapTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleBrandSecretTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 2500);

    // Buka admin setelah 3 ketukan cepat pada logo SAE
    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      if (onOpenAdmin) {
        onOpenAdmin();
      } else {
        window.location.hash = '#admin';
      }
    }
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 pt-3.5 pb-1 z-20 shrink-0 select-none">
        {/* Pojok kiri atas: Tulisan SAE putih elegan & lebih besar (ketuk 3x untuk akses admin rahasia) */}
        <div 
          onClick={handleBrandSecretTap}
          className="cursor-pointer active:scale-95 transition-all select-none flex flex-col py-0.5"
          title="SAE (Ketuk 3x untuk Akses Admin)"
        >
          <span className="font-serif text-[42px] sm:text-[48px] font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] leading-none select-none">
            SAE
          </span>
        </div>

        {/* Action Controls: Lonceng Notifikasi & PWA Install Kapsul */}
        <div className="flex items-center gap-2">
          {/* Kapsul [ 📲 Install App | ✕ ] */}
          {!isInstalled && !isDismissed && (
            <div className="flex items-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xs border border-white/40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={handleInstallClick}
                aria-label="Install Aplikasi SAE"
                title="Pasang aplikasi SAE ke menu HP"
                className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 hover:brightness-105 active:scale-95 transition-all cursor-pointer text-[10px] font-bold"
              >
                <Download className="w-3 h-3 text-white shrink-0" />
                <span className="whitespace-nowrap">Install</span>
              </button>
              <div className="w-[1px] h-3 bg-white/30" />
              <button
                onClick={handleDismiss}
                aria-label="Tutup dan sembunyikan ajakan install"
                title="Tutup (tidak muncul lagi)"
                className="pl-1.5 pr-2 py-1 text-white/80 hover:text-white hover:bg-white/20 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Lonceng Notifikasi Bulat Transparan Kaca Kristal */}
          <button
            onClick={onOpenNotifications}
            aria-label="Notifikasi"
            className="relative w-9 h-9 rounded-full bg-white/20 hover:bg-white/35 active:bg-white/40 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all active:scale-95 border border-white/40 backdrop-blur-md cursor-pointer"
          >
            <Bell className="w-4 h-4 text-white drop-shadow-xs" strokeWidth={2.2} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>
        </div>
      </header>

      {/* Modal Panduan Pasang untuk iPhone / Browser */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm bg-gradient-to-b from-[#e8f3fc] via-[#f4f9fd] to-[#ffffff] rounded-t-[32px] sm:rounded-[32px] p-6 shadow-[0_25px_60px_-15px_rgba(14,116,144,0.3)] border border-sky-200/80 text-slate-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/pwa-192x192.png"
                  alt="SAE App Icon"
                  className="w-12 h-12 rounded-2xl shadow-md border border-white/50 object-cover"
                />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Pasang Aplikasi SAE</h3>
                  <p className="text-xs text-sky-800/70">Muncul di halaman menu HP kamu</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-600 border border-sky-100 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
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
                    Pilih <strong>"Add to Home Screen"</strong> (Tambah ke Layar Utama) <PlusSquare className="inline w-3.5 h-3.5 text-blue-600 mx-1" />.
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
              /* Android One-Click */
              <div className="space-y-3 pt-1">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Aplikasi SAE akan langsung terpasang di layar utama HP kamu. Ringan, cepat, dan bisa dibuka layar penuh kapan saja.
                </p>
                <button
                  onClick={async () => {
                    await install();
                    setShowGuideModal(false);
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Pasang Sekarang (Gratis)</span>
                </button>
              </div>
            ) : (
              /* Panduan Umum / Desktop */
              <div className="space-y-3 pt-1 text-xs text-slate-600">
                <p className="leading-relaxed">
                  Buka link aplikasi ini di browser ponsel kamu (Google Chrome di Android atau Safari di iPhone) untuk langsung memasangnya ke layar menu HP.
                </p>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 text-blue-700 font-medium">
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <span>Kompatibel 100% untuk Android & iPhone</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
