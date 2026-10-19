import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ChevronRight, ChevronLeft, ArrowRight, Palette, Sun, Heart, CheckCircle2, Volume2 } from 'lucide-react';
import { MascotConfig, DEFAULT_MASCOT_CONFIG, subscribeMascotConfig } from '../services/firebase';

export interface TornPaperCard {
  id: string;
  category: string;
  title: string;
  description: string;
  badge?: string;
  highlightText?: string;
  actionText?: string;
  actionType: 'check' | 'inspiration' | 'tips' | 'mood';
  palette?: { name: string; hex: string }[];
}

export const DEFAULT_TORN_CARDS: TornPaperCard[] = [
  {
    id: 'card_palette_today',
    category: 'Harmoni Warna OOTD',
    title: 'Kombinasi Earthy & Denim Santai',
    description: 'Padukan warna netral hangat dengan denim untuk look rapi yang tetap ramah dan bersahabat di segala suasana.',
    badge: 'Formula 60-30-10 ✨',
    highlightText: '60% Khaki Sand, 30% Sky Denim, 10% Amber Aksesori.',
    actionText: 'Cek Harmoni Warna',
    actionType: 'inspiration',
    palette: [
      { name: 'Khaki Sand', hex: '#d2b48c' },
      { name: 'Sky Denim', hex: '#60a5fa' },
      { name: 'Warm Cream', hex: '#fdfbf7' },
      { name: 'Amber Gold', hex: '#f59e0b' },
    ],
  },
  {
    id: 'card_jakarta_style',
    category: 'Jakarta Streetwear Tip',
    title: 'Kemeja Linen Rileks + Straight Chino',
    description: 'Siluet santai berpori bikin kamu tetap sejuk di cuaca 31°C namun tetap berwibawa saat melangkah di kafe atau kantor.',
    badge: 'Cuaca Tropis ☀️',
    highlightText: 'Buka 1 kancing atas & gulung lengan 2 lipatan.',
    actionText: 'Lihat Ide Gaya',
    actionType: 'tips',
  },
  {
    id: 'card_posture_secret',
    category: 'Karisma & Postur',
    title: 'Aturan 3 Detik: Bahu Rileks & Senyum Tipis',
    description: 'Bukan hanya pakaian yang membuatmu memesona, tapi bagaimana tubuhmu membawakannya dengan bangga.',
    badge: 'Mindset SAE 🤍',
    highlightText: 'Tegakkan tulang punggung, biarkan senyummu menyapa ruangan.',
    actionText: 'Buka Tips Postur',
    actionType: 'mood',
  },
  {
    id: 'card_confidence_affirmation',
    category: 'Booster Percaya Diri',
    title: 'Gayamu Adalah Cermin Keberanianmu',
    description: 'Tak perlu izin siapa pun untuk merasa memukau hari ini. Pakaian terbaik adalah senyuman dan kenyamanan dirimu.',
    badge: 'Daily Mood 🌟',
    highlightText: 'Validasi SAE: 100% Siap Bersinar Hari Ini!',
    actionText: 'Klaim Mood Hari Ini',
    actionType: 'mood',
  },
];

const MASCOT_CHEER_LINES = [
  '“Kombinasi outfit kamu hari ini bakal curi perhatian!”',
  '“Yuk foto sekarang, aku bantu cek keserasian warnanya!”',
  '“Senyum kamu adalah aksesori paling mahal hari ini!”',
  '“Bahu santai, pandangan mantap. Kamu terlihat keren!”',
  '“Pede aja! Gaya kamu punya cerita dan autentik banget.”',
];

interface TornPaperBannerProps {
  onSelectAction: (type: 'check' | 'inspiration' | 'tips' | 'mood') => void;
  onOpenScan?: () => void;
}

export const TornPaperBanner: React.FC<TornPaperBannerProps> = ({
  onSelectAction,
  onOpenScan,
}) => {
  const [cards] = useState<TornPaperCard[]>(DEFAULT_TORN_CARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mascotConfig, setMascotConfig] = useState<MascotConfig>(DEFAULT_MASCOT_CONFIG);
  const [mascotQuoteIndex, setMascotQuoteIndex] = useState(0);
  const [mascotBouncing, setMascotBouncing] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Subscribe to mascot config from Firebase
  useEffect(() => {
    const unsub = subscribeMascotConfig((cfg) => setMascotConfig(cfg));
    return () => unsub();
  }, []);

  // Auto carousel rotation
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, cards.length]);

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
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > 40) {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    } else if (delta < -40) {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }
    touchStartX.current = null;
    setIsPaused(false);
  };

  const handleMascotClick = () => {
    setMascotBouncing(true);
    const nextIdx = (mascotQuoteIndex + 1) % MASCOT_CHEER_LINES.length;
    setMascotQuoteIndex(nextIdx);

    // Optional subtle speech readout if supported
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(MASCOT_CHEER_LINES[nextIdx].replace(/[“”]/g, ''));
        utterance.lang = 'id-ID';
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // ignore
    }

    setTimeout(() => setMascotBouncing(false), 600);
  };

  const currentCard = cards[currentIndex];

  return (
    <div
      className="relative mx-3.5 my-1.5 shrink-0 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ======================================================== */}
      {/* 1. ROYAL BLUE WASHI TAPE STRIP (SELOTIP WASHI BIRU)      */}
      {/* ======================================================== */}
      <div 
        className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center justify-center"
      >
        <div className="relative px-6 py-1 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 text-white shadow-[0_2px_8px_rgba(37,99,235,0.35)] -rotate-1 rounded-[2px] border-y border-white/40 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-ping" />
          <span className="text-[10px] font-black tracking-widest uppercase drop-shadow-xs">
            SAE SCRAPBOOK
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. AUTHENTIC TORN PAPER CONTAINER                        */}
      {/* ======================================================== */}
      <div className="relative rounded-t-[22px] bg-[#fbf9f5] border border-amber-900/15 shadow-[0_12px_28px_-8px_rgba(15,23,42,0.28)] pt-4 pb-3 px-4 overflow-hidden">
        
        {/* Soft Parchment Paper Texture Accents */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(#4a3728 1px, transparent 1px)`,
            backgroundSize: '14px 14px',
          }}
        />

        {/* Paper Corner Subtle Curl Highlight */}
        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-amber-100/60 to-transparent pointer-events-none" />

        {/* Top Meta Header on Paper */}
        <div className="flex items-center justify-between border-b border-amber-900/10 pb-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100/80 text-blue-700 border border-blue-200/60">
              {currentCard.category}
            </span>
            {currentCard.badge && (
              <span className="text-[9px] font-bold text-amber-800/80 bg-amber-100/60 px-2 py-0.5 rounded-full">
                {currentCard.badge}
              </span>
            )}
          </div>

          {/* Quick Page Counter & Prev/Next Mini Toggles */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 mr-1">
              {currentIndex + 1}/{cards.length}
            </span>
            <button
              onClick={handlePrev}
              aria-label="Catatan sebelumnya"
              className="w-5 h-5 rounded-full bg-amber-100/80 hover:bg-amber-200/90 text-amber-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Catatan selanjutnya"
              className="w-5 h-5 rounded-full bg-amber-100/80 hover:bg-amber-200/90 text-amber-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Main Card Content Body */}
        <div className="min-h-[125px] flex flex-col justify-between py-1">
          <div>
            <h3 className="font-serif text-[17px] sm:text-[18px] font-bold text-slate-900 leading-snug tracking-tight">
              {currentCard.title}
            </h3>
            <p className="text-[12px] sm:text-[12.5px] text-slate-600 leading-relaxed font-sans mt-1.5">
              {currentCard.description}
            </p>
          </div>

          {/* Special Palette Swatches if available */}
          {currentCard.palette && (
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Palet:
              </span>
              <div className="flex items-center gap-1.5">
                {currentCard.palette.map((color, i) => (
                  <div
                    key={i}
                    title={color.name}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-slate-200/80 shadow-2xs"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-[10px] font-semibold text-slate-700">
                      {color.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row Inside Paper */}
          <div className="mt-3.5 pt-2.5 border-t border-dashed border-amber-900/15 flex items-center justify-between">
            <span className="text-[10.5px] font-semibold text-amber-900/70 italic flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              {currentCard.highlightText || 'Tips kurasi harian SAE'}
            </span>

            <button
              onClick={() => onSelectAction(currentCard.actionType)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer"
            >
              <span>{currentCard.actionText || 'Buka'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex justify-center items-center gap-1.5 mt-3">
          {cards.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ke slide ${idx + 1}`}
              className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                currentIndex === idx
                  ? 'w-5 bg-blue-600'
                  : 'w-1.5 bg-amber-900/20 hover:bg-amber-900/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. TORN JAGGED PAPER BOTTOM EDGE (TEPI KERTAS SOBEK)     */}
      {/* ======================================================== */}
      <div className="relative w-full h-4 -mt-0.5 overflow-hidden pointer-events-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.08)]">
        <svg
          viewBox="0 0 1200 40"
          preserveAspectRatio="none"
          className="w-full h-full text-[#fbf9f5] fill-current"
        >
          <path d="M0,0 L1200,0 L1200,8 L1175,28 L1150,12 L1120,32 L1090,10 L1060,26 L1030,8 L1000,34 L970,12 L940,28 L910,6 L880,30 L850,14 L820,32 L790,8 L760,26 L730,12 L700,34 L670,10 L640,28 L610,8 L580,30 L550,14 L520,32 L490,6 L460,26 L430,10 L400,34 L370,12 L340,28 L310,8 L280,30 L250,14 L220,32 L190,8 L160,26 L130,10 L100,34 L70,12 L40,28 L15,8 L0,24 Z" />
        </svg>
      </div>

      {/* ======================================================== */}
      {/* 4. CHIBI MASCOT WITH SPEECH BUBBLE (IKONIK & INTERAKTIF) */}
      {/* ======================================================== */}
      <div className="relative flex items-center justify-between px-2 pt-2 pb-1">
        
        {/* Interactive Speech Bubble */}
        <div 
          onClick={handleMascotClick}
          className="flex-1 mr-3 p-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white shadow-[0_6px_20px_rgba(0,0,0,0.08)] cursor-pointer group active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black text-blue-600 flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Sapaan Sahabat SAE
            </span>
            <span className="text-[9.5px] text-slate-400 group-hover:text-blue-600 flex items-center gap-0.5">
              <Volume2 className="w-3 h-3" />
              Ketuk untuk bicara
            </span>
          </div>
          <p className="text-[12px] font-medium text-slate-800 leading-snug italic">
            {MASCOT_CHEER_LINES[mascotQuoteIndex]}
          </p>
        </div>

        {/* Mascot Avatar Sticker with Thumbs Up */}
        <div
          onClick={handleMascotClick}
          className={`relative cursor-pointer transition-transform duration-300 ${
            mascotBouncing ? 'scale-110 -rotate-3' : 'hover:scale-105'
          }`}
          title="Ketuk Maskot SAE untuk motivasi kilat!"
        >
          <div className="absolute -inset-1 rounded-full bg-blue-400/20 blur-sm pointer-events-none" />
          <img
            src="/src/assets/images/mascot_transparent.png"
            alt="Mascot SAE"
            className="w-20 h-20 sm:w-22 sm:h-22 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.22)]"
          />
        </div>
      </div>
    </div>
  );
};
