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
    <div className="relative w-full h-full flex flex-col justify-between px-4 pt-14 sm:pt-20 pb-3 select-none overflow-hidden">
      
      {/* ======================================================== */}
      {/* SISI KIRI ATAS: HERO TITLE & SUBTITLE                     */}
      {/* Posisi diturunkan ke bawah sedikit sesuai permintaan      */}
      {/* ======================================================== */}
      <div className="relative z-20 flex flex-col items-start max-w-[260px] sm:max-w-[280px] mt-2 sm:mt-3">
        
        {/* Title: "Hai, kamu! ♡" (Dipertahankan) */}
        <div className="flex flex-col items-start">
          <span 
            className="font-serif italic text-[36px] sm:text-[42px] text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] select-none"
            style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
          >
            Hai,
          </span>
          <h2 className="font-serif font-black text-[42px] sm:text-[48px] text-white leading-none tracking-tight drop-shadow-[0_3px_12px_rgba(0,0,0,0.65)] flex items-center gap-1.5 -mt-1 select-none">
            <span>kamu!</span>
            <span className="text-[34px] font-sans font-light text-amber-300 drop-shadow-[0_1px_8px_rgba(251,191,36,0.5)]">♡</span>
          </h2>
        </div>

        {/* Slogan Baru: "Tampil percaya diri, mulai dari gayamu" */}
        <p className="mt-2 text-[12.5px] sm:text-[13.5px] text-white/95 font-medium leading-[1.35] tracking-tight drop-shadow-[0_1px_6px_rgba(0,0,0,0.75)]">
          Tampil percaya diri, mulai dari gayamu
        </p>

        {/* Garis Aksen Halus Khas SAE */}
        <div className="w-16 h-[2.5px] bg-gradient-to-r from-amber-400 via-yellow-300 to-transparent rounded-full my-3 shadow-sm" />
      </div>

      {/* ======================================================== */}
      {/* SISI KIRI BAWAH: 3 KOTAK GLASS                            */}
      {/* Ukuran lebih kecil & posisi dinaikkan lebih ke atas        */}
      {/* ======================================================== */}
      <div className="relative z-20 flex flex-col items-start max-w-[150px] sm:max-w-[160px] mb-20 sm:mb-24">
        <div className="w-full flex flex-col gap-1.5">
          
          {/* 1. Tips Harian (Aksen Amber Hangat) */}
          <button
            onClick={onOpenTips || onOpenInspiration}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/35 backdrop-blur-md border border-white/40 text-white shadow-[0_3px_12px_rgba(0,0,0,0.14)] transition-all active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <div className="w-4.5 h-4.5 rounded-md bg-amber-400/25 border border-amber-300/40 flex items-center justify-center shrink-0 shadow-2xs">
                <Lightbulb className="w-3 h-3 text-amber-200 fill-amber-300/40" />
              </div>
              <span className="text-[10.5px] font-bold text-white drop-shadow-2xs tracking-tight">
                Tips Harian
              </span>
            </div>
            <ChevronRight className="w-3 h-3 text-white/70 group-hover:translate-x-0.5 group-hover:text-white transition-all shrink-0" />
          </button>

          {/* 2. Inspirasi Outfit (Aksen Sky Cyan Segar) */}
          <button
            onClick={onOpenInspiration}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/35 backdrop-blur-md border border-white/40 text-white shadow-[0_3px_12px_rgba(0,0,0,0.14)] transition-all active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <div className="w-4.5 h-4.5 rounded-md bg-sky-400/25 border border-sky-300/40 flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-3 h-3 text-sky-200" />
              </div>
              <span className="text-[10.5px] font-bold text-white drop-shadow-2xs tracking-tight">
                Inspirasi Outfit
              </span>
            </div>
            <ChevronRight className="w-3 h-3 text-white/70 group-hover:translate-x-0.5 group-hover:text-white transition-all shrink-0" />
          </button>

          {/* 3. Tren Style (Aksen Yellow/Emas) */}
          <button
            onClick={onOpenStyleTrend || onOpenInspiration}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/35 backdrop-blur-md border border-white/40 text-white shadow-[0_3px_12px_rgba(0,0,0,0.14)] transition-all active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <div className="w-4.5 h-4.5 rounded-md bg-yellow-400/25 border border-yellow-300/40 flex items-center justify-center shrink-0 shadow-2xs">
                <Star className="w-3 h-3 text-yellow-200 fill-yellow-300/40" />
              </div>
              <span className="text-[10.5px] font-bold text-white drop-shadow-2xs tracking-tight">
                Tren Style
              </span>
            </div>
            <ChevronRight className="w-3 h-3 text-white/70 group-hover:translate-x-0.5 group-hover:text-white transition-all shrink-0" />
          </button>

        </div>
      </div>

    </div>
  );
};

