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
        
        {/* Title: "Hai, kamu! ♡" */}
        <div className="flex flex-col items-start">
          <span 
            className="font-serif italic text-[36px] sm:text-[42px] text-[#E9E5D9] leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)] select-none"
            style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
          >
            Hai,
          </span>
          <h2 className="font-serif font-black text-[42px] sm:text-[48px] text-[#E9E5D9] leading-none tracking-tight drop-shadow-[0_3px_12px_rgba(0,0,0,0.7)] flex items-center gap-1.5 -mt-1 select-none">
            <span>kamu!</span>
            <span className="text-[34px] font-sans font-light text-[#A69D8E] drop-shadow-[0_1px_8px_rgba(166,157,142,0.4)]">♡</span>
          </h2>
        </div>

        {/* Slogan: "Tampil percaya diri, mulai dari gayamu" */}
        <p className="mt-2 text-[12.5px] sm:text-[13.5px] text-[#E9E5D9]/95 font-medium leading-[1.35] tracking-tight drop-shadow-[0_1px_6px_rgba(0,0,0,0.75)]">
          Tampil percaya diri, mulai dari gayamu
        </p>

        {/* Garis Aksen Halus Khas SAE (Taupe ke Champagne) */}
        <div className="w-16 h-[2.5px] bg-gradient-to-r from-[#A69D8E] via-[#E9E5D9] to-transparent rounded-full my-3 shadow-xs" />
      </div>

      {/* ======================================================== */}
      {/* SISI KIRI BAWAH: 3 KOTAK GLASS (Quiet Luxury Styling)     */}
      {/* Ukuran presisi & kontras tinggi di atas wallpaper foto   */}
      {/* ======================================================== */}
      <div className="relative z-20 flex flex-col items-start max-w-[150px] sm:max-w-[160px] mb-20 sm:mb-24">
        <div className="w-full flex flex-col gap-1.5">
          
          {/* 1. Tips Harian (Charcoal Glass dengan Aksen Taupe & Champagne) */}
          <button
            onClick={onOpenTips || onOpenInspiration}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#343640]/40 hover:bg-[#343640]/55 active:bg-[#343640]/65 backdrop-blur-md border border-[#E9E5D9]/30 text-[#E9E5D9] shadow-[0_4px_14px_rgba(52,54,64,0.25)] transition-all active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <div className="w-4.5 h-4.5 rounded-md bg-[#A69D8E]/30 border border-[#A69D8E]/50 flex items-center justify-center shrink-0 shadow-2xs">
                <Lightbulb className="w-3 h-3 text-[#E9E5D9] fill-[#E9E5D9]/30" />
              </div>
              <span className="text-[10.5px] font-bold text-[#E9E5D9] drop-shadow-2xs tracking-tight">
                Tips Harian
              </span>
            </div>
            <ChevronRight className="w-3 h-3 text-[#E9E5D9]/70 group-hover:translate-x-0.5 group-hover:text-[#E9E5D9] transition-all shrink-0" />
          </button>

          {/* 2. Inspirasi Outfit */}
          <button
            onClick={onOpenInspiration}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#343640]/40 hover:bg-[#343640]/55 active:bg-[#343640]/65 backdrop-blur-md border border-[#E9E5D9]/30 text-[#E9E5D9] shadow-[0_4px_14px_rgba(52,54,64,0.25)] transition-all active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <div className="w-4.5 h-4.5 rounded-md bg-[#E9E5D9]/20 border border-[#E9E5D9]/40 flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#E9E5D9]" />
              </div>
              <span className="text-[10.5px] font-bold text-[#E9E5D9] drop-shadow-2xs tracking-tight">
                Inspirasi Outfit
              </span>
            </div>
            <ChevronRight className="w-3 h-3 text-[#E9E5D9]/70 group-hover:translate-x-0.5 group-hover:text-[#E9E5D9] transition-all shrink-0" />
          </button>

          {/* 3. Tren Style */}
          <button
            onClick={onOpenStyleTrend || onOpenInspiration}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#343640]/40 hover:bg-[#343640]/55 active:bg-[#343640]/65 backdrop-blur-md border border-[#E9E5D9]/30 text-[#E9E5D9] shadow-[0_4px_14px_rgba(52,54,64,0.25)] transition-all active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <div className="w-4.5 h-4.5 rounded-md bg-[#A69D8E]/30 border border-[#A69D8E]/50 flex items-center justify-center shrink-0 shadow-2xs">
                <Star className="w-3 h-3 text-[#E9E5D9] fill-[#E9E5D9]/30" />
              </div>
              <span className="text-[10.5px] font-bold text-[#E9E5D9] drop-shadow-2xs tracking-tight">
                Tren Style
              </span>
            </div>
            <ChevronRight className="w-3 h-3 text-[#E9E5D9]/70 group-hover:translate-x-0.5 group-hover:text-[#E9E5D9] transition-all shrink-0" />
          </button>

        </div>
      </div>

    </div>
  );
};

