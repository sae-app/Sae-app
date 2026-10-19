import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

// Custom Hanger SVG Icon matching SAE rounded hanger
const HangerIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 4a2.5 2.5 0 0 1 2.5 2.5c0 1.2-.8 2-2 2.5L3 14a2 2 0 0 0 1 3h16a2 2 0 0 0 1-3L12 9" />
  </svg>
);

// Custom Sliders/Bars Icon matching Tips & Panduan
const SlidersBarsIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <rect x="4" y="9" width="3" height="11" rx="1.5" />
    <circle cx="5.5" cy="6" r="2.2" />

    <rect x="10.5" y="5" width="3" height="15" rx="1.5" />
    <circle cx="12" cy="16" r="2.2" fill="#fff" opacity="0.3" />

    <rect x="17" y="11" width="3" height="9" rx="1.5" />
    <circle cx="18.5" cy="8" r="2.2" />
  </svg>
);

interface FeatureGridProps {
  onSelectFeature: (featureId: 'check' | 'inspiration' | 'tips' | 'mood') => void;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ onSelectFeature }) => {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mx-3.5 my-1 shrink-0 select-none">
      {/* 1. Cek Outfit */}
      <button
        onClick={() => onSelectFeature('check')}
        className="group relative flex items-center gap-2.5 p-2.5 sm:p-3 rounded-[20px] glass-card-interactive text-left overflow-hidden h-[66px] sm:h-[70px] cursor-pointer"
      >
        <div className="absolute -top-3 -left-3 w-16 h-16 bg-blue-300/15 rounded-full blur-md pointer-events-none" />

        {/* Left Icon Bubble */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300">
          <HangerIcon className="w-5 h-5 text-white" />
        </div>

        {/* Right Content */}
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-[13px] sm:text-[14px] text-slate-800 leading-tight truncate">
            Cek Outfit
          </h3>
          <p className="text-[10px] sm:text-[10.5px] text-slate-500 font-medium leading-tight truncate mt-0.5">
            Penilaian kilat
          </p>
        </div>
      </button>

      {/* 2. Inspirasi */}
      <button
        onClick={() => onSelectFeature('inspiration')}
        className="group relative flex items-center gap-2.5 p-2.5 sm:p-3 rounded-[20px] glass-card-interactive text-left overflow-hidden h-[66px] sm:h-[70px] cursor-pointer"
      >
        <div className="absolute -top-3 -right-3 w-16 h-16 bg-purple-300/15 rounded-full blur-md pointer-events-none" />

        {/* Left Icon Bubble */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-gradient-to-b from-purple-400 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300">
          <Sparkles className="w-5 h-5 text-white" fill="white" />
        </div>

        {/* Right Content */}
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-[13px] sm:text-[14px] text-slate-800 leading-tight truncate">
            Inspirasi
          </h3>
          <p className="text-[10px] sm:text-[10.5px] text-slate-500 font-medium leading-tight truncate mt-0.5">
            Ide gaya OOTD
          </p>
        </div>
      </button>

      {/* 3. Tips & Panduan */}
      <button
        onClick={() => onSelectFeature('tips')}
        className="group relative flex items-center gap-2.5 p-2.5 sm:p-3 rounded-[20px] glass-card-interactive text-left overflow-hidden h-[66px] sm:h-[70px] cursor-pointer"
      >
        <div className="absolute -top-3 -left-3 w-16 h-16 bg-teal-300/15 rounded-full blur-md pointer-events-none" />

        {/* Left Icon Bubble */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-gradient-to-b from-teal-400 to-cyan-600 flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300">
          <SlidersBarsIcon className="w-5 h-5 text-white" />
        </div>

        {/* Right Content */}
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-[13px] sm:text-[14px] text-slate-800 leading-tight truncate">
            Tips & Panduan
          </h3>
          <p className="text-[10px] sm:text-[10.5px] text-slate-500 font-medium leading-tight truncate mt-0.5">
            Rahasia tampil PD
          </p>
        </div>
      </button>

      {/* 4. Mood Booster */}
      <button
        onClick={() => onSelectFeature('mood')}
        className="group relative flex items-center gap-2.5 p-2.5 sm:p-3 rounded-[20px] glass-card-interactive text-left overflow-hidden h-[66px] sm:h-[70px] cursor-pointer"
      >
        <div className="absolute -top-3 -right-3 w-16 h-16 bg-pink-300/15 rounded-full blur-md pointer-events-none" />

        {/* Left Icon Bubble */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-gradient-to-b from-pink-400 to-rose-500 flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300">
          <Heart className="w-5 h-5 text-white" fill="white" />
        </div>

        {/* Right Content */}
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-[13px] sm:text-[14px] text-slate-800 leading-tight truncate">
            Mood Booster
          </h3>
          <p className="text-[10px] sm:text-[10.5px] text-slate-500 font-medium leading-tight truncate mt-0.5">
            Semangat positif
          </p>
        </div>
      </button>
    </div>
  );
};
