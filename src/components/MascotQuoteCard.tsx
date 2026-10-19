import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { subscribeMascotConfig, MascotConfig, DEFAULT_MASCOT_CONFIG } from '../services/firebase';

const defaultQuotes = [
  {
    text: '“Penampilan yang baik bukan tentang sempurna, tapi tentang versi terbaik dari dirimu sendiri.”',
    author: 'SAE Daily Wisdom',
    reaction: '˘͈ᵕ˘͈',
  },
  {
    text: '“Gaya adalah caramu berbicara tanpa perlu mengeluarkan sepatah kata pun.”',
    author: 'Rachel Zoe',
    reaction: '✨',
  },
  {
    text: '“Pakaian terbaik yang bisa kamu kenakan hari ini adalah rasa percaya dirimu.”',
    author: 'Self Love',
    reaction: '♥',
  },
  {
    text: '“Kenyamanan melahirkan keanggunan. Jadilah dirimu yang paling otentik.”',
    author: 'Fashion Mindset',
    reaction: '◡̈',
  },
];

export const MascotQuoteCard: React.FC = () => {
  const [config, setConfig] = useState<MascotConfig>(DEFAULT_MASCOT_CONFIG);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);

  // Subscribe to live Firestore updates
  useEffect(() => {
    const unsubscribe = subscribeMascotConfig((newConfig) => {
      setConfig(newConfig);
    });
    return () => unsubscribe();
  }, []);

  const handleNextQuote = () => {
    setIsWiggling(true);
    setQuoteIndex((prev) => (prev + 1) % defaultQuotes.length);
    setTimeout(() => setIsWiggling(false), 500);
  };

  // Determine current quote
  const currentQuote = config.companionQuote && quoteIndex === 0
    ? {
        text: config.companionQuote,
        author: config.companionAuthor || 'SAE Daily Wisdom',
        reaction: '˘͈ᵕ˘͈'
      }
    : defaultQuotes[quoteIndex];

  const mascotHeight = config.customSize || 84;
  const mascotImg = config.imageUrl || '/src/assets/images/sae_mascot.png';
  const avatarStyle = config.avatarStyle || 'cutout';
  const [dragOffset, setDragOffset] = useState<number>(config.offsetX || 0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number>(0);
  const initialOffset = useRef<number>(0);

  // Sync dragOffset with external config changes
  useEffect(() => {
    setDragOffset(config.offsetX || 0);
  }, [config.offsetX]);

  // Touch and Mouse Drag handlers for Mascot
  const handleTouchStartMascot = (e: React.TouchEvent) => {
    setIsDragging(true);
    dragStartX.current = e.touches[0].clientX;
    initialOffset.current = dragOffset;
  };

  const handleTouchMoveMascot = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - dragStartX.current;
    // Bound between -30px and 70px to stay elegantly inside phone screen bounds
    const newOffset = Math.max(-25, Math.min(65, initialOffset.current + deltaX));
    setDragOffset(newOffset);
  };

  const handleTouchEndMascot = () => {
    if (!isDragging) return;
    setIsDragging(false);
  };

  const handleMouseDownMascot = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    initialOffset.current = dragOffset;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartX.current;
      const newOffset = Math.max(-25, Math.min(65, initialOffset.current + deltaX));
      setDragOffset(newOffset);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="relative mx-3.5 mt-3 mb-1 shrink-0">
      {/* Outer ambient glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-200/40 via-cyan-100/30 to-indigo-200/40 rounded-[26px] blur-md opacity-60 pointer-events-none" />

      {/* Main Glass Container - Fixed stable height so widget NEVER expands or breaks layout */}
      <div className="relative overflow-visible rounded-[22px] glass-panel border border-white/85 p-2 sm:p-2.5 shadow-[0_8px_24px_-8px_rgba(59,130,246,0.14)] flex items-center justify-between gap-2 h-[70px] max-h-[70px]">
        
        {/* Left Side: Mascot Pop-Out with horizontal draggable movement */}
        <div className="relative flex items-center gap-1.5 pl-0.5 shrink-0 h-full">
          {/* Mascot Anchor with transform translate */}
          <div 
            style={{ transform: `translate(${dragOffset}px, ${config.offsetY || 0}px)` }}
            className={`relative w-14 sm:w-16 h-full flex items-end justify-center shrink-0 transition-transform ${
              isDragging ? 'duration-0' : 'duration-300'
            }`}
          >
            <div
              onTouchStart={handleTouchStartMascot}
              onTouchMove={handleTouchMoveMascot}
              onTouchEnd={handleTouchEndMascot}
              onMouseDown={handleMouseDownMascot}
              onClick={handleNextQuote}
              title="Tahan & geser untuk atur posisi maskot! Klik untuk ganti kutipan."
              className={`absolute bottom-0 flex items-end justify-center cursor-grab active:cursor-grabbing select-none z-10 ${
                isWiggling ? 'scale-110 -rotate-3' : 'hover:scale-105 active:scale-95'
              }`}
            >
              {avatarStyle === 'circle' ? (
                /* Mode Lencana Bulat: Sempurna untuk foto asli kamera / ber-background */
                <div 
                  style={{ width: `${Math.min(mascotHeight, 64)}px`, height: `${Math.min(mascotHeight, 64)}px` }}
                  className="rounded-full ring-2 ring-white/95 shadow-[0_6px_16px_rgba(30,58,138,0.22)] overflow-hidden bg-white shrink-0 mb-1 pointer-events-none"
                >
                  <img
                    src={mascotImg}
                    alt="SAE Brand Mascot"
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                </div>
              ) : avatarStyle === 'rounded' ? (
                /* Mode Squircle: Bingkai persegi sudut bulat elegan */
                <div 
                  style={{ width: `${Math.min(mascotHeight, 64)}px`, height: `${Math.min(mascotHeight, 64)}px` }}
                  className="rounded-2xl ring-2 ring-white/95 shadow-[0_6px_16px_rgba(30,58,138,0.22)] overflow-hidden bg-white shrink-0 mb-1 pointer-events-none"
                >
                  <img
                    src={mascotImg}
                    alt="SAE Brand Mascot"
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                </div>
              ) : (
                /* Mode Cutout Pop-Out: Karakter menyembul ke atas tanpa membesarkan kartu */
                <img
                  src={mascotImg}
                  alt="SAE Brand Mascot"
                  style={{ 
                    height: `${mascotHeight}px`, 
                    maxHeight: `${mascotHeight}px`,
                    maxWidth: `${Math.round(mascotHeight * 1.05)}px` 
                  }}
                  className="w-auto object-contain drop-shadow-[0_8px_16px_rgba(30,58,138,0.22)] select-none pointer-events-none transition-all duration-300"
                />
              )}

              {/* Sparkle decorative dots */}
              <span className="absolute -top-1 -right-0.5 text-blue-500 text-[11px] font-bold animate-pulse pointer-events-none">✦</span>
            </div>
          </div>

          {/* 'You've got this!' Handwritten text */}
          <div className="flex flex-col leading-none select-none">
            <span className="font-handwritten text-[16px] sm:text-[18px] font-bold text-blue-600 tracking-wide transform -rotate-2 drop-shadow-2xs">
              You've
            </span>
            <span className="font-handwritten text-[16px] sm:text-[18px] font-bold text-blue-600 tracking-wide transform -rotate-2 flex items-center gap-0.5 drop-shadow-2xs">
              got this! <span className="text-xs text-blue-500 font-sans">◡̈</span>
            </span>
          </div>
        </div>

        {/* Right Side: Frosted Speech Card Quote */}
        {config.showQuote !== false && (
          <div
            onClick={handleNextQuote}
            className="relative flex-1 bg-white/70 hover:bg-white/85 rounded-xl p-2 sm:p-2.5 border border-white/90 shadow-2xs backdrop-blur-md transition-all cursor-pointer group flex flex-col justify-between h-[54px] sm:h-[58px]"
          >
            <p className="text-[10px] sm:text-[11px] text-slate-700 font-medium leading-[1.3] italic pr-1 line-clamp-2">
              {currentQuote.text}
            </p>

            <div className="flex items-center justify-between mt-0.5 pt-0.5 border-t border-slate-100/60">
              <span className="text-[8.5px] text-slate-400 font-semibold tracking-wider uppercase group-hover:text-blue-500 flex items-center gap-1 transition-colors">
                <RefreshCw className="w-2.5 h-2.5 group-hover:rotate-180 transition-transform duration-500" />
                Ganti
              </span>
              <span className="text-blue-500 font-bold text-[11px] tracking-tighter">
                {currentQuote.reaction}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
