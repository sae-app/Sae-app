import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HomeGreetingHeroProps {
  onStartAnalysis: () => void;
  userName?: string;
}

export const HomeGreetingHero: React.FC<HomeGreetingHeroProps> = ({
  onStartAnalysis,
}) => {
  return (
    <div className="px-5 pt-3 pb-1 select-none z-20">
      <div className="flex flex-col items-start max-w-[260px]">
        {/* Title Besar Serif (Persis Sesuai Gambar Referensi) */}
        <h2 className="font-serif text-[32px] sm:text-[36px] font-black text-[#0f2942] leading-[1.08] tracking-tight drop-shadow-2xs">
          Hai, kamu!
        </h2>

        {/* Subjudul 3 Baris (Persis Sesuai Gambar Referensi) */}
        <p className="font-sans text-[13px] sm:text-[14px] font-semibold text-[#0f2942]/90 leading-snug tracking-tight mt-2 mb-3 max-w-[215px]">
          Yuk mulai hari ini dengan outfit yang bikin kamu lebih percaya diri.
        </p>

        {/* Tombol Kapsul Biru Mengkilap (Persis Sesuai Gambar Referensi) */}
        <button
          onClick={onStartAnalysis}
          aria-label="Mulai Analisis Outfit Sekarang"
          className="relative group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0c377c] via-[#1452b4] to-[#2563eb] hover:from-[#0f3f8e] hover:to-[#1d4ed8] text-white shadow-[0_8px_22px_-4px_rgba(20,82,180,0.5)] active:scale-95 transition-all duration-200 cursor-pointer border border-white/45 overflow-hidden"
        >
          {/* Subtle glossy top light reflection */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-full pointer-events-none" />

          <span className="relative z-10 text-[12.5px] sm:text-[13px] font-extrabold tracking-tight whitespace-nowrap">
            Mulai Analisis
          </span>
          <ArrowRight className="relative z-10 w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
