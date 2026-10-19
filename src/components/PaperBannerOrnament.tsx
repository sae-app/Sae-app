import React from 'react';
import { PaperBannerConfig } from '../services/firebase';
import { Sparkles } from 'lucide-react';

interface PaperBannerOrnamentProps {
  config: PaperBannerConfig;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  isInteractive?: boolean;
}

export const PaperBannerOrnament: React.FC<PaperBannerOrnamentProps> = ({
  config,
  className = '',
  style = {},
  onClick,
  isInteractive = false,
}) => {
  if (config.enabled === false) return null;

  const transformStyle: React.CSSProperties = {
    transform: `translate(${config.offsetX || 0}px, ${config.offsetY || 0}px) scale(${(config.scale || 100) / 100}) rotate(${config.rotate || 0}deg)`,
    transformOrigin: 'center center',
    opacity: (config.opacity ?? 100) / 100,
    ...style,
  };

  // 1. Kustom Gambar yang Diunggah Pengguna
  if (config.imageUrl) {
    return (
      <div
        onClick={onClick}
        style={transformStyle}
        className={`relative shrink-0 select-none transition-transform duration-75 ${
          isInteractive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
        } ${className}`}
      >
        <img
          src={config.imageUrl}
          alt="Spanduk Sobekan Kertas"
          referrerPolicy="no-referrer"
          className="w-auto max-w-[320px] sm:max-w-[360px] max-h-[180px] object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.18)] filter transition-all select-none pointer-events-none"
          draggable={false}
        />
        {config.title && (
          <div className="absolute inset-0 flex items-center justify-center p-3 text-center">
            <span className="font-serif text-[13px] font-bold text-[#1f2937]/90 tracking-wide drop-shadow-2xs">
              {config.title}
            </span>
          </div>
        )}
      </div>
    );
  }

  // 2. Sobekan Kertas Bawaan Estetik Realistis (Realistic Editorial Torn Paper Strip)
  return (
    <div
      onClick={onClick}
      style={transformStyle}
      className={`relative w-[290px] sm:w-[330px] shrink-0 select-none transition-transform duration-75 filter drop-shadow-[0_12px_24px_rgba(15,41,66,0.14)] ${
        isInteractive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
      } ${className}`}
    >
      {/* Container Sobekan Kertas Bertekstur Ivory Lembut */}
      <div className="relative w-full bg-[#fbf9f4] border-x border-[#ebe5d8]/80 text-[#1e293b] overflow-hidden py-3 px-4 shadow-[inset_0_1px_4px_rgba(255,255,255,0.8),inset_0_-1px_4px_rgba(0,0,0,0.03)]">
        
        {/* Efek Sobekan Gerigi Serat Kertas Atas (Torn Paper Edge Top) */}
        <div 
          className="absolute -top-1.5 inset-x-0 h-2 bg-[#fbf9f4] z-10"
          style={{
            clipPath: 'polygon(0% 100%, 2% 30%, 4% 95%, 6% 40%, 8% 85%, 10% 20%, 13% 90%, 15% 35%, 18% 85%, 21% 15%, 24% 90%, 27% 45%, 30% 95%, 33% 25%, 36% 85%, 39% 30%, 42% 100%, 45% 40%, 48% 90%, 51% 20%, 54% 85%, 57% 35%, 60% 95%, 63% 15%, 66% 90%, 69% 45%, 72% 85%, 75% 25%, 78% 95%, 81% 35%, 84% 90%, 87% 20%, 90% 85%, 93% 40%, 96% 95%, 98% 30%, 100% 100%)',
            boxShadow: '0 -2px 4px rgba(0,0,0,0.04)'
          }}
        />

        {/* Efek Sobekan Gerigi Serat Kertas Bawah (Torn Paper Edge Bottom) */}
        <div 
          className="absolute -bottom-1.5 inset-x-0 h-2 bg-[#fbf9f4] z-10"
          style={{
            clipPath: 'polygon(0% 0%, 2% 70%, 4% 5%, 6% 60%, 8% 15%, 10% 80%, 13% 10%, 15% 65%, 18% 15%, 21% 85%, 24% 10%, 27% 55%, 30% 5%, 33% 75%, 36% 15%, 39% 70%, 42% 0%, 45% 60%, 48% 10%, 51% 80%, 54% 15%, 57% 65%, 60% 5%, 63% 85%, 66% 10%, 69% 55%, 72% 15%, 75% 75%, 78% 5%, 81% 65%, 84% 10%, 87% 80%, 90% 15%, 93% 60%, 96% 5%, 98% 70%, 100% 0%)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
          }}
        />

        {/* Aksen Selotip Washi Tape Transparan di Pojok Kiri Atas */}
        <div 
          className="absolute -top-1.5 left-6 w-12 h-4 bg-amber-100/60 backdrop-blur-[1px] rotate-[-6deg] border border-white/60 shadow-xs pointer-events-none z-20"
          style={{
            clipPath: 'polygon(0% 15%, 100% 0%, 95% 85%, 5% 100%)'
          }}
        />

        {/* Konten Spanduk Sobekan Kertas */}
        {config.title ? (
          <div className="relative z-0 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600/70" />
                <span className="font-sans text-[8.5px] font-black tracking-widest text-slate-500 uppercase">
                  SAE
                </span>
                <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-400" />
              </div>
              <p className="font-serif text-[12px] sm:text-[13px] font-black text-[#0f2942] leading-snug tracking-tight mt-0.5">
                {config.title}
              </p>
            </div>
          </div>
        ) : (
          /* Polos Estetik Minimalis (Hanya serat kertas natural & aksen washi tape elegan) */
          <div className="relative z-0 h-6 flex items-center justify-center opacity-40">
            <div className="h-0.5 w-16 bg-amber-900/10 rounded-full" />
          </div>
        )}

        {/* Tekstur Garis Halus Serat Kertas */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-900/[0.015] to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
