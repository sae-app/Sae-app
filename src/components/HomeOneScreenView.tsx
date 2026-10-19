import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { 
  subscribeMascotConfig,
  MascotConfig,
  DEFAULT_MASCOT_CONFIG
} from '../services/firebase';

interface HomeOneScreenViewProps {
  onStartAnalysis: () => void;
  onOpenInspiration?: () => void;
}

export const HomeOneScreenView: React.FC<HomeOneScreenViewProps> = ({
  onStartAnalysis,
}) => {
  const [isWiggling, setIsWiggling] = useState(false);
  const [bubbleTextIndex, setBubbleTextIndex] = useState(0);
  const [mascotConfig, setMascotConfig] = useState<MascotConfig>(DEFAULT_MASCOT_CONFIG);

  const bubbleCheers = [
    mascotConfig.companionQuote || 'Hai! Aku SAE di sini! ♡',
    'Outfit kamu kece banget hari ini! ✨',
    'Yuk cek cermin, aku bantu nilai ya! 📸',
    'Senyum dulu yuk, auto makin cakep! ◡̈',
    'Pede aja, kamu unik & keren! 🌸',
  ];

  // Subscribe to mascot configuration from Firebase (size & position)
  useEffect(() => {
    const unsubMascot = subscribeMascotConfig((cfg) => {
      setMascotConfig(cfg);
    });
    return () => unsubMascot();
  }, []);

  const handleMascotClick = () => {
    setIsWiggling(true);
    const nextIdx = (bubbleTextIndex + 1) % bubbleCheers.length;
    setBubbleTextIndex(nextIdx);

    // Friendly speech audio readout
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(bubbleCheers[nextIdx].replace(/[♡✨📸◡̈🌸]/g, ''));
        speech.lang = 'id-ID';
        speech.rate = 1.05;
        window.speechSynthesis.speak(speech);
      }
    } catch {
      // ignore
    }

    setTimeout(() => setIsWiggling(false), 600);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-3.5 pt-2 pb-1 select-none pointer-events-auto overflow-hidden">
      


      {/* ======================================================== */}
      {/* 2. ZONA ATAS: HEADER SALAM EDITORIAL & TOMBOL MULAI      */}
      {/* ======================================================== */}
      <div className="relative w-full flex items-start justify-between pt-16 sm:pt-20 z-20">
        <div className="flex flex-col items-start max-w-[240px] sm:max-w-[270px]">
          <h2 className="font-serif text-[30px] sm:text-[34px] font-black text-[#0f2942] leading-[1.05] tracking-tight drop-shadow-2xs">
            Hai, kamu!
          </h2>

          <button
            onClick={onStartAnalysis}
            aria-label="Mulai Analisis Outfit Sekarang"
            className="mt-3.5 relative group inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full bg-gradient-to-r from-[#0c377c] via-[#1452b4] to-[#2563eb] hover:from-[#0f3f8e] hover:to-[#1d4ed8] text-white shadow-[0_6px_20px_-3px_rgba(20,82,180,0.45)] active:scale-95 transition-all duration-200 cursor-pointer border border-white/50 overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-full pointer-events-none" />
            <span className="relative z-10 text-[12px] sm:text-[13px] font-extrabold tracking-tight whitespace-nowrap">
              Mulai Analisis
            </span>
            <ArrowRight className="relative z-10 w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MASKOT CHIBI SAE (BERDIRI BERSIH TANPA BALON & SPANDUK) */}
      {/* ======================================================== */}
      <div className="relative w-full z-20 mt-auto flex items-end justify-end pr-3 pb-3 pointer-events-auto">
        {/* Maskot Chibi SAE (Fleksibel Ukuran & Posisi Nudge Sesuai Pengaturan Admin) */}
        <div
          onClick={handleMascotClick}
          style={{
            transform: `translate(${mascotConfig.offsetX || 0}px, ${mascotConfig.offsetY || 0}px)`,
          }}
          className={`relative shrink-0 cursor-pointer transition-transform duration-300 z-20 ${
            isWiggling ? 'scale-110 -rotate-6' : 'hover:scale-105'
          }`}
          title="SAE Chibi Mascot - Ketuk untuk sapaan ceria!"
        >
          {/* Aksen coretan doodle di samping kepala maskot */}
          <div className="absolute -left-2 top-4 flex flex-col gap-0.5 text-[#38bdf8] font-black text-[8px] pointer-events-none select-none">
            <span className="rotate-[-25deg]">-</span>
            <span className="rotate-[-10deg]">-</span>
          </div>

          {/* Ground shadow tepat di bawah kaki maskot */}
          <div 
            style={{ width: `${Math.round((mascotConfig.customSize || 170) * 0.65)}px` }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-2.5 bg-slate-950/20 rounded-full blur-[2px] pointer-events-none" 
          />

          {/* Maskot Cutout */}
          <img
            src={mascotConfig.imageUrl || "/src/assets/images/sae_chibi_girl_cutout.png"}
            alt="Mascot SAE"
            style={{
              height: `${mascotConfig.customSize || 170}px`,
              maxHeight: `${mascotConfig.customSize || 170}px`,
            }}
            className="w-auto object-contain drop-shadow-[0_8px_18px_rgba(15,23,42,0.3)] pointer-events-none select-none transition-all duration-150"
          />
        </div>
      </div>
    </div>
  );
};
