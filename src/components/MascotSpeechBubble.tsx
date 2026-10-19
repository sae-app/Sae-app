import React from 'react';
import { MascotQuoteShape } from '../services/firebase';

interface MascotSpeechBubbleProps {
  text: string;
  shape?: MascotQuoteShape | 'custom_image';
  position?: 'beside' | 'above';
  customImageUrl?: string;
  showText?: boolean;
  onClick?: () => void;
  scale?: 'sm' | 'md' | 'lg' | 'card_preview';
  className?: string;
}

export const MascotSpeechBubble: React.FC<MascotSpeechBubbleProps> = ({
  text,
  shape = 'watercolor_bubble',
  position = 'beside',
  customImageUrl = '',
  showText = true,
  onClick,
  scale = 'md',
  className = '',
}) => {
  // Scaling factors
  const isSmall = scale === 'sm';
  const isPreview = scale === 'card_preview';

  // =========================================================================
  // 0. GAMBAR KUSTOM UNGGAHAN SENDIRI (CUSTOM UPLOADED IMAGE)
  const isCustomImageActive = shape === 'custom_image' || (shape !== 'watercolor_bubble' && Boolean(customImageUrl && customImageUrl.trim().length > 0));
  if (isCustomImageActive && customImageUrl && customImageUrl.trim().length > 0) {
    return (
      <div
        onClick={onClick}
        className={`relative select-none transition-transform duration-200 cursor-pointer ${className}`}
      >
        <div className="relative inline-flex items-center justify-center">
          <img
            src={customImageUrl || '/src/assets/images/sae_chibi_girl_cutout.png'}
            alt="Kotak Sapaan Kustom"
            className={`object-contain pointer-events-none select-none drop-shadow-md ${
              isSmall ? 'max-h-[55px] max-w-[130px]' : 'max-h-[110px] max-w-[230px]'
            }`}
          />
          {showText && text && (
            <div className="absolute inset-0 flex items-center justify-center p-2 text-center pointer-events-none">
              <span
                className={`font-sans font-black text-slate-900 leading-tight drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)] px-2 py-0.5 rounded-lg bg-white/60 backdrop-blur-[1px] ${
                  isSmall ? 'text-[8px]' : 'text-[11.5px] sm:text-[12.5px]'
                }`}
              >
                {text}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 1. WATERCOLOR BUBBLE (PERSIS GAMBAR REFERENSI USER)
  // =========================================================================
  // Fitur:
  // - Bentuk oval organik sapuan kuas cat air
  // - Border ganda cat air biru cerah (#2563eb & #38bdf8)
  // - Pantulan cahaya kilau lengkung di kanan atas
  // - Aksen getar ekspresi ceria (\ - /) di kiri & kanan
  // - Ekor kuas lancip di sudut kanan bawah mengarah ke maskot
  // =========================================================================
  if (shape === 'watercolor_bubble' || !shape) {
    if (isSmall) {
      // Scaled down for Mobile Phone Simulator preview in Admin
      return (
        <div
          onClick={onClick}
          className={`relative select-none ${className}`}
        >
          {/* Main Watercolor Frame */}
          <div className="relative px-2.5 py-1.5 rounded-[18px] bg-gradient-to-br from-white via-[#f0f8ff] to-[#e0f2fe] border-[2px] border-[#2563eb] shadow-[0_3px_10px_rgba(37,99,235,0.25)] text-center min-w-[85px] max-w-[125px]">
            {/* Top right gloss glint */}
            <div className="absolute top-1 right-2 w-6 h-2 rounded-full bg-white/70 rotate-[-15deg] pointer-events-none filter blur-[0.4px]" />
            
            {/* Cheer sparkles / dashes */}
            <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 text-[7px] text-[#38bdf8] font-bold pointer-events-none select-none">
              彡
            </span>
            <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 text-[7px] text-[#38bdf8] font-bold pointer-events-none select-none">
              ミ
            </span>

            {/* Bubble Tail pointing down-right towards mascot */}
            <div className="absolute -bottom-1.5 right-3 w-0 h-0 border-l-[4px] border-l-transparent border-r-[3px] border-r-transparent border-t-[6px] border-t-[#2563eb]" />
            <div className="absolute -bottom-1 right-3.5 w-0 h-0 border-l-[3px] border-l-transparent border-r-[2px] border-r-transparent border-t-[5px] border-t-[#e0f2fe]" />

            <p className="font-sans font-black text-[8px] text-[#0f3f8e] leading-tight tracking-tight">
              {text}
            </p>
          </div>
        </div>
      );
    }

    // Default Medium / Full Screen Home View
    return (
      <div
        onClick={onClick}
        className={`relative select-none transition-transform duration-200 ${className}`}
      >
        {/* Glow halo */}
        <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-blue-400/25 to-sky-300/30 blur-sm pointer-events-none" />

        {/* Outer Organic Watercolor Bubble */}
        <div className="relative px-4 py-2.5 sm:px-5 sm:py-3 rounded-[26px] bg-gradient-to-br from-white via-[#f4f9ff] to-[#dcf0fe] border-[2.5px] border-[#2563eb] shadow-[0_8px_24px_-4px_rgba(20,82,180,0.3),inset_0_2px_4px_rgba(255,255,255,0.9)] text-center flex flex-col items-center justify-center min-w-[120px] max-w-[175px] sm:max-w-[200px]">
          
          {/* Top-Right Curved Gloss Glint (Seperti pada gambar referensi) */}
          <div className="absolute top-1.5 right-3 w-10 sm:w-12 h-3.5 rounded-full bg-gradient-to-b from-white/90 to-white/20 rotate-[-18deg] pointer-events-none filter blur-[0.5px]" />

          {/* Left Decorative Cheer Dashes */}
          <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 pointer-events-none select-none">
            <span className="w-2.5 h-[2px] bg-[#38bdf8] rounded-full rotate-[-25deg] shadow-xs" />
            <span className="w-2.5 h-[2px] bg-[#38bdf8] rounded-full rotate-[15deg] shadow-xs ml-0.5" />
          </div>

          {/* Right Decorative Cheer Dashes */}
          <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 pointer-events-none select-none">
            <span className="w-2.5 h-[2px] bg-[#38bdf8] rounded-full rotate-[25deg] shadow-xs" />
            <span className="w-2.5 h-[2px] bg-[#38bdf8] rounded-full rotate-[-15deg] shadow-xs mr-0.5" />
          </div>

          {/* Speech Tail pointing down-right towards the mascot */}
          {position === 'beside' ? (
            <>
              {/* Outer stroke tail */}
              <div 
                className="absolute -bottom-2.5 right-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[4px] border-r-transparent border-t-[10px] border-t-[#2563eb] rotate-[20deg]" 
              />
              {/* Inner fill tail */}
              <div 
                className="absolute -bottom-1.5 right-4.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[3px] border-r-transparent border-t-[8px] border-t-[#dcf0fe] rotate-[20deg]" 
              />
            </>
          ) : (
            <>
              <div className="absolute right-6 -bottom-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[5px] border-r-transparent border-t-[9px] border-t-[#2563eb]" />
              <div className="absolute right-6 -bottom-1.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[7px] border-t-[#dcf0fe]" />
            </>
          )}

          {/* Mascot Greeting Typography (Rich Blue, Friendly & Bold) */}
          <p className="relative z-10 font-sans font-black text-[12px] sm:text-[13.5px] text-[#0c377c] leading-snug tracking-tight drop-shadow-2xs text-center">
            {text}
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. SOFT CLOUD (AWAN GELEMBUNG LEMBUT)
  // =========================================================================
  if (shape === 'soft_cloud') {
    return (
      <div onClick={onClick} className={`relative select-none ${className}`}>
        <div className={`relative px-3.5 py-2.5 rounded-[24px] bg-gradient-to-b from-white via-white/95 to-[#e6f4ff] border-2 border-sky-300 shadow-[0_6px_20px_rgba(56,189,248,0.22)] text-center flex flex-col items-center justify-center ${
          isSmall ? 'min-w-[85px] max-w-[125px] text-[8px] px-2 py-1.5 rounded-[18px]' : 'min-w-[115px] max-w-[170px]'
        }`}>
          {/* Cloud Bubble Top Scallops */}
          <div className="absolute -top-1 left-3 w-4 h-2 bg-white rounded-full border-t border-sky-200 pointer-events-none" />
          <div className="absolute -top-1.5 right-4 w-6 h-2.5 bg-white rounded-full border-t border-sky-200 pointer-events-none" />

          {/* Tail */}
          <div className={`absolute -bottom-2 right-4 w-0 h-0 border-l-[5px] border-l-transparent border-r-[3px] border-r-transparent border-t-[8px] border-t-sky-300 ${
            isSmall ? '-bottom-1.5 border-t-[5px]' : ''
          }`} />

          <p className={`relative z-10 font-sans font-extrabold text-[#0369a1] leading-tight tracking-tight ${
            isSmall ? 'text-[8px]' : 'text-[12px] sm:text-[13px]'
          }`}>
            {text}
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. STYLIST PILL (KAPSUL LANSKAP MELEBAR MODERN)
  // =========================================================================
  if (shape === 'stylist_pill') {
    return (
      <div onClick={onClick} className={`relative select-none ${className}`}>
        <div className={`relative rounded-full bg-gradient-to-r from-white via-[#f0f8ff] to-white border-2 border-[#1d4ed8] shadow-[0_4px_16px_rgba(29,78,216,0.2)] text-center flex items-center justify-center ${
          isSmall ? 'px-2.5 py-1 min-w-[90px] max-w-[130px]' : 'px-4 py-2 sm:px-5 sm:py-2.5 min-w-[120px] max-w-[185px]'
        }`}>
          <div className="absolute inset-x-2 top-0 h-1/2 bg-gradient-to-b from-white/70 to-transparent rounded-t-full pointer-events-none" />
          <p className={`relative z-10 font-serif font-black text-[#0f2942] leading-tight tracking-tight ${
            isSmall ? 'text-[8.5px]' : 'text-[12px] sm:text-[13px]'
          }`}>
            {text}
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. SKETCH COMIC (BALON SKETSA MANGA CHIBI MINIMALIS)
  // =========================================================================
  if (shape === 'sketch_comic') {
    return (
      <div onClick={onClick} className={`relative select-none ${className}`}>
        <div className={`relative rounded-[20px] bg-white/95 border-2 border-slate-800 shadow-[2px_3px_0px_#1e293b] text-center flex flex-col items-center justify-center ${
          isSmall ? 'px-2 py-1.5 min-w-[85px] max-w-[120px]' : 'px-3.5 py-2.5 min-w-[115px] max-w-[165px]'
        }`}>
          {/* Manga Sharp Tail */}
          <div className={`absolute -bottom-2 right-3 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[8px] border-t-slate-800 ${
            isSmall ? '-bottom-1.5 border-t-[5px]' : ''
          }`} />

          <p className={`relative z-10 font-sans font-black text-slate-900 leading-tight ${
            isSmall ? 'text-[8px]' : 'text-[12px] sm:text-[12.5px]'
          }`}>
            {text}
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. STYLIST ASYMMETRIC (KARTU SUDUT LENGKUNG ASIMETRIS LEMBUT)
  // =========================================================================
  if (shape === 'stylist_asymmetric') {
    return (
      <div onClick={onClick} className={`relative select-none ${className}`}>
        <div className={`relative rounded-2xl rounded-br-xs bg-white/95 backdrop-blur-md border border-sky-200/90 shadow-[0_6px_20px_-2px_rgba(15,23,42,0.12),0_2px_8px_rgba(59,130,246,0.1)] text-center flex flex-col items-center justify-center ${
          isSmall ? 'px-2 py-1.5 min-w-[75px] max-w-[115px]' : 'px-3.5 py-2.5 min-w-[105px] max-w-[155px]'
        }`}>
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent rounded-t-2xl pointer-events-none" />
          <p className={`relative z-10 font-serif font-black text-[#0f2942] leading-snug tracking-tight ${
            isSmall ? 'text-[8px]' : 'text-[11.5px] sm:text-[12.5px]'
          }`}>
            {text}
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 6. CLASSIC BUBBLE / CHIC CAPSULE (FALLBACKS)
  // =========================================================================
  return (
    <div onClick={onClick} className={`relative select-none ${className}`}>
      <div className={`relative rounded-[22px] bg-[#edf6ff]/95 border-2 border-[#5ba4fc] shadow-xs text-center flex flex-col items-center justify-center ${
        isSmall ? 'px-2 py-1 min-w-[75px] max-w-[115px]' : 'px-3.5 py-2 min-w-[100px] max-w-[145px]'
      }`}>
        <div className="absolute right-4 -bottom-1.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-[#5ba4fc]" />
        <p className={`font-serif italic font-extrabold text-[#1d4ed8] leading-tight ${
          isSmall ? 'text-[8px]' : 'text-[11.5px] sm:text-[12.5px]'
        }`}>
          {text}
        </p>
      </div>
    </div>
  );
};
