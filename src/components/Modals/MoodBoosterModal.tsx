import React, { useState } from 'react';
import { X, Heart, Sparkles, RefreshCw, Share2, Check } from 'lucide-react';

interface MoodBoosterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const affirmations = [
  {
    quote: 'Kamu tidak perlu menjadi orang lain untuk terlihat menawan. Aura terbaikmu memancar ketika kamu merasa nyaman dengan dirimu.',
    source: 'SAE Daily Boost',
    tag: 'Percaya Diri',
  },
  {
    quote: 'Hari baru, energi baru. Senyummu adalah aksesori paling berharga yang melengkapi pakaian apapun yang kamu kenakan hari ini.',
    source: 'Morning Sunshine',
    tag: 'Energi Positif',
  },
  {
    quote: 'Beranilah mengekspresikan warna favoritmu. Jangan takut terlihat berbeda, karena keunikanmu adalah daya tarik terbesarmu!',
    source: 'Fashion Soul',
    tag: 'Keberanian',
  },
  {
    quote: 'Saat kamu merawat caramu berpakaian, kamu sedang menghargai dirimu sendiri dan orang-orang di sekitarmu.',
    source: 'Self Respect',
    tag: 'Menghargai Diri',
  },
];

export const MoodBoosterModal: React.FC<MoodBoosterModalProps> = ({ isOpen, onClose }) => {
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const current = affirmations[index];

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % affirmations.length);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(`"${current.quote}" - ${current.source}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-gradient-to-b from-[#e8f3fc] via-[#f4f9fd] to-[#ffffff] rounded-t-[32px] sm:rounded-[32px] shadow-[0_25px_60px_-15px_rgba(14,116,144,0.3)] border border-sky-200/80 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3.5 border-b border-sky-100/90 bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-pink-500 text-white flex items-center justify-center shadow-xs">
              <Heart className="w-4 h-4" fill="white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 tracking-tight">Mood Booster</h3>
              <p className="text-[11px] text-sky-800/70 font-medium">Kata-kata positif untuk hari yang lebih baik</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-600 border border-sky-100 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="relative rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 p-6 text-white shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full border border-white/30 backdrop-blur-xs">
                {current.tag}
              </span>
              <span className="font-handwritten text-lg font-bold">Better You Everyday ♡</span>
            </div>

            <p className="text-base sm:text-lg font-medium leading-relaxed italic my-2">
              “{current.quote}”
            </p>

            <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/20 text-xs">
              <span className="text-pink-100 font-semibold">{current.source}</span>
              <span className="text-pink-200">◡̈</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-pink-500/25 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Ganti Kata Semangat</span>
            </button>
            <button
              onClick={handleCopy}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Bagikan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
