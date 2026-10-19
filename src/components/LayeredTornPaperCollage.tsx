import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import { 
  subscribeBannersConfig, 
  BannerItem, 
  DEFAULT_BANNERS,
  subscribeMascotConfig,
  MascotConfig,
  DEFAULT_MASCOT_CONFIG
} from '../services/firebase';

export interface CollageCardItem {
  id: number;
  text: string;
  category?: string;
  highlight?: string;
}

export const DEFAULT_COLLAGE_CARDS: CollageCardItem[] = [
  {
    id: 1,
    text: 'Hari ini cocok untuk warna-warna earth tone yang bikin kamu terlihat lebih fresh.',
    category: 'Saran Warna Hari Ini',
    highlight: 'Warm Earthy Vibes 🍂',
  },
  {
    id: 2,
    text: 'Padukan kemeja linen rileks dengan celana straight cut untuk look santai tapi berkelas.',
    category: 'Inspirasi Gaya',
    highlight: 'Casual Jakarta Chic ✨',
  },
  {
    id: 3,
    text: 'Rahasia postur 3 detik: bahu rileks & senyum tipis bikin penampilanmu 2x lebih memesona.',
    category: 'Karisma & Postur',
    highlight: 'Confidence Booster 🤍',
  },
  {
    id: 4,
    text: 'Formula 60-30-10: 60% warna dasar, 30% warna kedua, 10% aksen bikin gayamu auto harmonis.',
    category: 'Tips Padu Padan',
    highlight: 'Color Harmony Rule 🎨',
  },
  {
    id: 5,
    text: 'Kamu tidak perlu izin siapa pun untuk merasa keren hari ini. Pakai yang membuatmu bangga melangkah!',
    category: 'Mood Booster',
    highlight: 'Self Love Everyday 🌟',
  },
];

interface LayeredTornPaperCollageProps {
  onOpenScan?: () => void;
  onOpenInspiration?: () => void;
}

export const LayeredTornPaperCollage: React.FC<LayeredTornPaperCollageProps> = ({
  onOpenScan,
  onOpenInspiration,
}) => {
  const [cards, setCards] = useState<CollageCardItem[]>(DEFAULT_COLLAGE_CARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);
  const [bubbleTextIndex, setBubbleTextIndex] = useState(0);
  const [mascotConfig, setMascotConfig] = useState<MascotConfig>(DEFAULT_MASCOT_CONFIG);
  const touchStartX = useRef<number | null>(null);

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

  // Sync with Firestore banners if available
  useEffect(() => {
    const unsub = subscribeBannersConfig((banners: BannerItem[]) => {
      if (Array.isArray(banners) && banners.length > 0) {
        const mapped: CollageCardItem[] = banners.map((b, idx) => ({
          id: b.id || idx + 1,
          text: b.title || DEFAULT_COLLAGE_CARDS[idx % DEFAULT_COLLAGE_CARDS.length].text,
          category: b.tagline || 'Saran Gaya SAE',
          highlight: b.subtitle || 'Tips Harian',
        }));
        setCards(mapped);
      }
    });
    return () => unsub();
  }, []);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 35) {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    } else if (diff < -35) {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }
    touchStartX.current = null;
  };

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

  const currentCard = cards[currentIndex] || DEFAULT_COLLAGE_CARDS[0];

  return (
    <div
      className="relative w-full flex-1 flex flex-col justify-end px-3 pb-1 select-none pointer-events-auto"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ======================================================== */}
      {/* 1. STICKY NOTE ATAS KANAN DENGAN 2 SELOTIP WASHI BIRU    */}
      {/* ======================================================== */}
      <div className="absolute right-4 top-2 sm:top-4 z-20 w-44 sm:w-48 transform rotate-[4deg] transition-transform duration-300 hover:rotate-1">
        {/* Selotip Washi Biru Kiri Atas */}
        <div className="absolute -top-2.5 left-2 w-9 h-4 bg-sky-400/80 backdrop-blur-xs shadow-xs rounded-[1.5px] border-y border-white/50 -rotate-12 z-30 pointer-events-none" />

        {/* Selotip Washi Biru Kanan Atas */}
        <div className="absolute -top-2.5 right-2 w-9 h-4 bg-sky-400/80 backdrop-blur-xs shadow-xs rounded-[1.5px] border-y border-white/50 rotate-8 z-30 pointer-events-none" />

        {/* Kertas Kotak Robek Kecil */}
        <div className="relative bg-[#fcfbf7] rounded-[4px] p-3 pt-4 shadow-[0_8px_20px_-4px_rgba(15,23,42,0.25)] border border-amber-900/10 overflow-hidden">
          {/* Subtle paper texture */}
          <div 
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#4a3728 1px, transparent 1px)`,
              backgroundSize: '10px 10px',
            }}
          />

          {/* Tulisan Tangan / Artistik Script Style */}
          <div className="relative text-center">
            <p className="font-serif italic font-extrabold text-[15px] sm:text-[16px] text-[#1e4a7a] leading-tight tracking-tight drop-shadow-2xs">
              Good <br />
              Style <br />
              Builds <br />
              Confidence <br />
              in You ♡
            </p>
            {/* Coretan riang */}
            <div className="flex justify-center gap-1 mt-1 text-[#3b82f6] opacity-70">
              <span className="text-[10px] font-mono leading-none">- - -</span>
            </div>
          </div>
        </div>

        {/* Robekan bergerigi tipis di bawah sticky note */}
        <div className="w-full h-2 -mt-0.5 pointer-events-none overflow-hidden drop-shadow-2xs">
          <svg viewBox="0 0 100 12" preserveAspectRatio="none" className="w-full h-full text-[#fcfbf7] fill-current">
            <path d="M0,0 L100,0 L96,8 L92,3 L88,9 L84,2 L80,8 L76,3 L72,9 L68,2 L64,8 L60,3 L56,9 L52,2 L48,8 L44,3 L40,9 L36,2 L32,8 L28,3 L24,9 L20,2 L16,8 L12,3 L8,9 L4,2 L0,8 Z" />
          </svg>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN TORN PAPER SHEET (KIRI BAWAH)                    */}
      {/* ======================================================== */}
      <div className="relative z-10 w-[84%] max-w-[310px] mr-auto mt-16 sm:mt-20">
        
        {/* Tepi Sobekan Atas Kertas Utama */}
        <div className="w-full h-3 -mb-0.5 pointer-events-none overflow-hidden drop-shadow-2xs">
          <svg viewBox="0 0 100 12" preserveAspectRatio="none" className="w-full h-full text-[#fefdfb] fill-current">
            <path d="M0,12 L100,12 L97,3 L93,9 L89,4 L85,10 L81,3 L77,9 L73,4 L69,10 L65,3 L61,9 L57,4 L53,10 L49,3 L45,9 L41,4 L37,10 L33,3 L29,9 L25,4 L21,10 L17,3 L13,9 L9,4 L5,10 L0,3 Z" />
          </svg>
        </div>

        {/* Isi Lembaran Kertas Sobek Utama */}
        <div className="relative bg-[#fefdfb] px-4 py-3 shadow-[0_12px_28px_-6px_rgba(15,23,42,0.22)] border-x border-amber-900/10">
          
          {/* Subtle textured paper overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#4a3728 1px, transparent 1px)`,
              backgroundSize: '12px 12px',
            }}
          />

          {/* Teks Rekomendasi Utama (Persis Sesuai Gambar Referensi) */}
          <div className="relative z-10 pr-2">
            <p className="text-[13.5px] sm:text-[14.5px] font-sans font-semibold text-[#0f2942] leading-snug tracking-tight">
              {currentCard.text}
            </p>
          </div>

          {/* Navigasi Ganti Pilihan Mini di Pojok Bawah Kertas */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-dashed border-amber-900/15 text-[10px] text-slate-400">
            <div className="flex items-center gap-1 font-bold text-slate-500">
              <span>{currentIndex + 1} dari {cards.length} pilihan</span>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                aria-label="Pilihan sebelumnya"
                className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Pilihan berikutnya"
                className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Tepi Sobekan Bawah Kertas Utama */}
        <div className="w-full h-3 -mt-0.5 pointer-events-none overflow-hidden drop-shadow-2xs">
          <svg viewBox="0 0 100 12" preserveAspectRatio="none" className="w-full h-full text-[#fefdfb] fill-current">
            <path d="M0,0 L100,0 L96,8 L92,3 L88,9 L84,2 L80,8 L76,3 L72,9 L68,2 L64,8 L60,3 L56,9 L52,2 L48,8 L44,3 L40,9 L36,2 L32,8 L28,3 L24,9 L20,2 L16,8 L12,3 L8,9 L4,2 L0,8 Z" />
          </svg>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. BALON SAPAAN MELINGKAR BIRU & MASKOT CHIBI            */}
      {/*    (POJOK KANAN BAWAH DI ATAS MENU PROFILE)              */}
      {/* ======================================================== */}
      <div className="relative w-full flex items-end justify-between -mt-4 z-30">
        
        {/* Balon Sapaan Lingkaran Bergaris Biru (Sesuai Referensi Gambar) */}
        <div 
          onClick={handleMascotClick}
          className="relative ml-2 sm:ml-4 mb-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
          title="Ketuk untuk mendengar suara SAE"
        >
          {/* Hand-drawn circular blue speech bubble */}
          <div className="relative px-3.5 py-2.5 rounded-[26px] bg-[#edf6ff]/95 backdrop-blur-md border-2 border-[#5ba4fc] shadow-[0_4px_16px_rgba(59,130,246,0.22)] text-center flex flex-col items-center justify-center min-w-[125px] sm:min-w-[140px]">
            <p className="font-serif italic font-extrabold text-[12.5px] sm:text-[13.5px] text-[#1d4ed8] leading-tight tracking-tight drop-shadow-2xs">
              {bubbleCheers[bubbleTextIndex]}
            </p>
            <span className="text-[9px] text-[#3b82f6] font-sans font-semibold mt-0.5 flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
              <Volume2 className="w-2.5 h-2.5" />
              ketuk aku
            </span>

            {/* Ekor Balon Mengarah ke Maskot di Kanan */}
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[9px] border-l-[#5ba4fc]" />
          </div>
        </div>

        {/* Karakter Maskot Chibi SAE Cewek (Di Atas Navigasi Bar dengan Ukuran & Posisi Dinamis dari Admin) */}
        <div
          onClick={handleMascotClick}
          style={{
            transform: `translate(${mascotConfig.offsetX || 0}px, ${mascotConfig.offsetY || 0}px)`,
          }}
          className={`relative shrink-0 cursor-pointer transition-transform duration-300 mr-1 sm:mr-2 -mb-2.5 z-40 ${
            isWiggling ? 'scale-110 -rotate-6' : 'hover:scale-105'
          }`}
          title="SAE Chibi Mascot - Ketuk untuk sapaan ceria!"
        >
          {/* Subtle soft ground shadow */}
          <div 
            style={{ width: `${Math.round((mascotConfig.customSize || 155) * 0.7)}px` }}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 h-4 bg-slate-950/25 rounded-full blur-[4px] pointer-events-none" 
          />

          {/* Maskot Cutout Transparan Sesuai Referensi & Dikontrol Ukuran Dinamis */}
          <img
            src={mascotConfig.imageUrl || "/src/assets/images/sae_chibi_girl_cutout.png"}
            alt="Mascot SAE"
            style={{
              height: `${mascotConfig.customSize || 155}px`,
              maxHeight: `${mascotConfig.customSize || 155}px`,
            }}
            className="w-auto object-contain drop-shadow-[0_8px_18px_rgba(15,23,42,0.3)] pointer-events-none select-none transition-all duration-150"
          />
        </div>

      </div>
    </div>
  );
};
