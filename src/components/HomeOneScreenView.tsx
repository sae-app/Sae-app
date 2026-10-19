import React from 'react';
import { Lightbulb, Sparkles, Star, ChevronRight } from 'lucide-react';

interface HomeOneScreenViewProps {
  onStartAnalysis?: () => void;
  onOpenInspiration?: () => void;
  onOpenTips?: () => void;
  onOpenStyleTrend?: () => void;
}

export const HomeOneScreenView: React.FC<HomeOneScreenViewProps> = ({
  onStartAnalysis: _onStartAnalysis,
  onOpenInspiration,
  onOpenTips,
  onOpenStyleTrend,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between px-4 pt-10 sm:pt-14 pb-3 select-none overflow-hidden">
      
      {/* ======================================================== */}
      {/* SISI KIRI ATAS: HERO TITLE & SUBTITLE                     */}
      {/* ======================================================== */}
      <div className="relative z-20 flex flex-col items-start max-w-[260px] sm:max-w-[280px]">
        
        {/* Title: "Hai, kamu! ♡" */}
        <div className="flex flex-col items-start">
          <span 
            className="font-serif italic text-[36px] sm:text-[42px] text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] select-none"
            style={{ fontFamily: "'Playfair Display', 'Georgia', serif' " }}
          >
            Hai,
          </span>
          <h2 className="font-serif font-black text-[42px] sm:text-[48px] text-white leading-none tracking-tight drop-shadow-[0_3px_12px_rgba(0,0,0,0.65)] flex items-center gap-1.5 -mt-1 select-none">
            <span>kamu!</span>
            <span className="text-[34px] font-sans font-light text-amber-300 drop-shadow-[0_1px_8px_rgba(251,191,36,0.5)]">♡</span>
          </h2>
        </div>

        {/* Subtitle Deskripsi */}
        <p className="mt-2 text-[12px] sm:text-[13px] text-white/95 font-medium leading-[1.35] tracking-tight drop-shadow-[0_1px_5px_rgba(0,0,0,0.7)]">
          Temukan outfit terbaikmu dengan analisis AI yang mudah dan cepat.
        </p>

        {/* Garis Aksen Halus Khas SAE Asal */}
        <div className="w-16 h-[2.5px] bg-gradient-to-r from-amber-400 via-yellow-300 to-transparent rounded-full my-3.5 shadow-sm" />
      </div>

      {/* ======================================================== */}
      {/* SISI KIRI BAWAH: 3 MENU KAPSUL KACA (POSISI LEBIH KE BAWAH)*/}
      {/* Berbaris ke bawah, posisinya lebih ke bawah di atas wallpaper*/}
      {/* ======================================================== */}
      <div className="relative z-20 flex flex-col items-start max-w-[185px] mb-2 sm:mb-3">
        <div className="w-full flex flex-col gap-2">
          
          {/* 1. Tips Harian (Aksen Amber Hangat Asal) */}
          <button
            onClick={onOpenTips || onOpenInspiration}
            className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-white/20 hover:bg-white/30 active:bg-white/35 backdrop-blur-md border border-white/40 text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-5.5 h-5.5 rounded-lg bg-amber-400/25 border border-amber-300/40 flex items-center justify-center shrink-0 shadow-xs">
                <Lightbulb className="w-3.5 h-3.5 text-amber-200 fill-amber-300/40" />
              </div>
              <span className="text-[11.5px] font-bold text-white drop-shadow-xs tracking-tight">
                Tips Harian
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/70 group-hover:translate-x-0.5 group-hover:text-white transition-all shrink-0" />
          </button>

          {/* 2. Inspirasi Outfit (Aksen Sky Cyan Segar Asal) */}
          <button
            onClick={onOpenInspiration}
            className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-white/20 hover:bg-white/30 active:bg-white/35 backdrop-blur-md border border-white/40 text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-5.5 h-5.5 rounded-lg bg-sky-400/25 border border-sky-300/40 flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-sky-200" />
              </div>
              <span className="text-[11.5px] font-bold text-white drop-shadow-xs tracking-tight">
                Inspirasi Outfit
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/70 group-hover:translate-x-0.5 group-hover:text-white transition-all shrink-0" />
          </button>

          {/* 3. Tren Style (Aksen Yellow/Emas Asal) */}
          <button
            onClick={onOpenStyleTrend || onOpenInspiration}
            className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-white/20 hover:bg-white/30 active:bg-white/35 backdrop-blur-md border border-white/40 text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-5.5 h-5.5 rounded-lg bg-yellow-400/25 border border-yellow-300/40 flex items-center justify-center shrink-0 shadow-xs">
                <Star className="w-3.5 h-3.5 text-yellow-200 fill-yellow-300/40" />
              </div>
              <span className="text-[11.5px] font-bold text-white drop-shadow-xs tracking-tight">
                Tren Style
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/70 group-hover:translate-x-0.5 group-hover:text-white transition-all shrink-0" />
          </button>

        </div>
      </div>

    </div>
  );
};

