import React from 'react';
import { ArrowRight, Lightbulb, Sparkles, Star, ChevronRight } from 'lucide-react';

interface HomeOneScreenViewProps {
  onStartAnalysis: () => void;
  onOpenInspiration?: () => void;
  onOpenTips?: () => void;
  onOpenStyleTrend?: () => void;
}

// Custom Viewfinder/Scan Camera Icon matching the glowing circle button in reference
const CameraViewfinderIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7 3H5a2 2 0 0 0-2 2v2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <path d="M17 21h2a2 2 0 0 0 2-2v-2" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
  </svg>
);

export const HomeOneScreenView: React.FC<HomeOneScreenViewProps> = ({
  onStartAnalysis,
  onOpenInspiration,
  onOpenTips,
  onOpenStyleTrend,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between px-4 pt-10 sm:pt-14 pb-4 select-none overflow-hidden">
      
      {/* ======================================================== */}
      {/* SISI KIRI: HERO TITLE, MULAI ANALISIS, & 3 MENU CEPAT     */}
      {/* ======================================================== */}
      <div className="relative z-20 flex flex-col items-start max-w-[260px] sm:max-w-[280px]">
        
        {/* Title: "Hai, kamu! ♡" */}
        <div className="flex flex-col items-start">
          <span 
            className="font-serif italic text-[36px] sm:text-[42px] text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] select-none"
            style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
          >
            Hai,
          </span>
          <h2 className="font-serif font-black text-[42px] sm:text-[48px] text-white leading-none tracking-tight drop-shadow-[0_3px_12px_rgba(0,0,0,0.65)] flex items-center gap-1.5 -mt-1 select-none">
            <span>kamu!</span>
            <span className="text-[34px] font-sans font-light text-white/95">♡</span>
          </h2>
        </div>

        {/* Subtitle Deskripsi */}
        <p className="mt-2 text-[12px] sm:text-[13px] text-white/95 font-medium leading-[1.35] tracking-tight drop-shadow-[0_1px_5px_rgba(0,0,0,0.7)]">
          Temukan outfit terbaikmu dengan analisis AI yang mudah dan cepat.
        </p>

        {/* Garis Aksen Halus */}
        <div className="w-16 h-[2px] bg-white/70 rounded-full my-3.5 shadow-sm" />

        {/* TOMBOL UTAMA: "Mulai Analisis" dengan Lingkaran Biru Bercahaya */}
        <button
          onClick={onStartAnalysis}
          aria-label="Mulai Analisis Outfit"
          className="group inline-flex items-center gap-3 active:scale-95 transition-transform duration-200 cursor-pointer my-1"
        >
          {/* Lingkaran Biru Glowing Viewfinder */}
          <div className="relative flex items-center justify-center">
            <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 p-[2px] shadow-[0_0_24px_rgba(37,99,235,0.85)] group-hover:shadow-[0_0_32px_rgba(56,189,248,1)] group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full rounded-full bg-blue-600/95 backdrop-blur-xs flex items-center justify-center text-white">
                <CameraViewfinderIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </div>
            </div>
            {/* Halo pulse effect */}
            <span className="absolute inset-0 rounded-full bg-blue-400/40 animate-ping pointer-events-none -z-10" />
          </div>

          {/* Teks Mulai Analisis dengan Panah */}
          <div className="flex items-center gap-1.5 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            <span className="font-sans text-[15px] sm:text-[16px] font-black tracking-wide whitespace-nowrap">
              Mulai Analisis
            </span>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" strokeWidth={2.6} />
          </div>
        </button>

        {/* ======================================================== */}
        {/* 3 MENU CEPAT: TIPS HARIAN, INSPIRASI OUTFIT, TREN STYLE  */}
        {/* ======================================================== */}
        <div className="w-full flex flex-col gap-2 mt-4 max-w-[210px]">
          
          {/* 1. Tips Harian */}
          <button
            onClick={onOpenTips || onOpenInspiration}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-black/30 hover:bg-black/40 active:bg-black/50 backdrop-blur-md border border-white/25 text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-lg bg-amber-400/20 flex items-center justify-center">
                <Lightbulb className="w-3.5 h-3.5 text-amber-300 fill-amber-300/40" />
              </div>
              <span className="text-[12px] font-extrabold text-white drop-shadow-xs tracking-tight">
                Tips Harian
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/70 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
          </button>

          {/* 2. Inspirasi Outfit */}
          <button
            onClick={onOpenInspiration}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-black/30 hover:bg-black/40 active:bg-black/50 backdrop-blur-md border border-white/25 text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-lg bg-sky-400/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-sky-300" />
              </div>
              <span className="text-[12px] font-extrabold text-white drop-shadow-xs tracking-tight">
                Inspirasi Outfit
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/70 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
          </button>

          {/* 3. Tren Style */}
          <button
            onClick={onOpenStyleTrend || onOpenInspiration}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-black/30 hover:bg-black/40 active:bg-black/50 backdrop-blur-md border border-white/25 text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-lg bg-yellow-400/20 flex items-center justify-center">
                <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300/40" />
              </div>
              <span className="text-[12px] font-extrabold text-white drop-shadow-xs tracking-tight">
                Tren Style
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/70 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
          </button>

        </div>

      </div>

    </div>
  );
};
