import React from 'react';
import { Home, Compass, User, ShoppingBag } from 'lucide-react';

export type NavTab = 'home' | 'discover' | 'results' | 'profile';

interface BottomNavBarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOpenScan: () => void;
}

// Custom Viewfinder/Scan Brackets Icon with center sparkle matching SAE branding
const ScanBracketsIcon: React.FC<{ className?: string }> = ({ className = 'w-5.5 h-5.5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7 3H5a2 2 0 0 0-2 2v2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <path d="M17 21h2a2 2 0 0 0 2-2v-2" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);

// Custom My Results 3-bar icon
const ResultsBarsIcon: React.FC<{ className?: string }> = ({ className = 'w-4.5 h-4.5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <rect x="4" y="11" width="3.5" height="10" rx="1.75" />
    <circle cx="5.75" cy="7.5" r="1.75" />
    <rect x="10.25" y="7" width="3.5" height="14" rx="1.75" />
    <circle cx="12" cy="3.5" r="1.75" />
    <rect x="16.5" y="13" width="3.5" height="8" rx="1.75" />
    <circle cx="18.25" cy="9.5" r="1.75" />
  </svg>
);

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onChangeTab,
  onOpenScan,
}) => {
  return (
    <div className="relative z-30 px-3 pb-2 pt-2.5 shrink-0 select-none">
      {/* ======================================================== */}
      {/* SCULPTED WAVE DOCK (DOK KACA BERLEKUK DENGAN 5 MENU)      */}
      {/* ======================================================== */}
      <nav
        aria-label="Navigasi Utama"
        className="relative w-full flex items-center justify-between h-[52px] sm:h-[55px] rounded-[30px] bg-gradient-to-b from-white/95 via-white/85 to-white/90 backdrop-blur-2xl border border-white shadow-[0_10px_28px_-6px_rgba(37,99,235,0.18),0_2px_10px_rgba(0,0,0,0.03)] px-2"
      >
        {/* Subtle Sculpted Top Highlight Reflection */}
        <div className="absolute inset-x-4 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-300/60 to-transparent pointer-events-none" />

        {/* 1. HOME TAB */}
        <button
          onClick={() => onChangeTab('home')}
          className="relative flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer group"
        >
          <div className="relative flex items-center justify-center">
            {activeTab === 'home' && (
              <span className="absolute w-7 h-7 rounded-full bg-blue-100/70 -z-10 animate-in zoom-in-75 duration-200" />
            )}
            <Home
              className={`w-[18px] h-[18px] transition-colors duration-200 ${
                activeTab === 'home'
                  ? 'text-blue-600 fill-blue-600'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
          </div>
          <span
            className={`text-[9.5px] font-bold mt-0.5 transition-colors ${
              activeTab === 'home' ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
            }`}
          >
            Home
          </span>
          {activeTab === 'home' && (
            <span className="w-3.5 h-[2px] bg-blue-600 rounded-full mt-0.5 shadow-2xs" />
          )}
        </button>

        {/* 2. ETALASE TAB */}
        <button
          onClick={() => onChangeTab('discover')}
          className="relative flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer group"
          title="Etalase Toko & Promo Pilihan"
        >
          <div className="relative flex items-center justify-center">
            {activeTab === 'discover' && (
              <span className="absolute w-7 h-7 rounded-full bg-blue-100/70 -z-10 animate-in zoom-in-75 duration-200" />
            )}
            <ShoppingBag
              className={`w-[18px] h-[18px] transition-colors duration-200 ${
                activeTab === 'discover'
                  ? 'text-blue-600 stroke-[2.4]'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
          </div>
          <span
            className={`text-[9.5px] font-bold mt-0.5 transition-colors ${
              activeTab === 'discover' ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
            }`}
          >
            Toko
          </span>
          {activeTab === 'discover' && (
            <span className="w-3.5 h-[2px] bg-blue-600 rounded-full mt-0.5 shadow-2xs" />
          )}
        </button>

        {/* 3. CENTER RAISED SCAN BUTTON (SCULPTED WAVE CENTER) */}
        <div className="relative flex flex-col items-center justify-center flex-1 -mt-4.5 z-40">
          <div className="relative group flex flex-col items-center">
            {/* Ultra-Thin Delicate Breathing Glow Ring */}
            <div className="absolute w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400/50 via-blue-500/50 to-sky-400/50 blur-[6px] animate-breathing-halo pointer-events-none" />
            <div className="absolute -inset-0.5 rounded-full border border-cyan-300/40 animate-breathing-halo pointer-events-none" />

            {/* Main Round Floating Scan Button */}
            <button
              onClick={onOpenScan}
              aria-label="Scan Outfit Sekarang"
              title="Scan Outfit dengan SAE AI"
              className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 text-white flex items-center justify-center border-2 border-white shadow-[0_6px_18px_-2px_rgba(37,99,235,0.45)] cursor-pointer overflow-hidden animate-breathing-orb transition-transform duration-300 active:scale-95 hover:brightness-105"
            >
              {/* Subtle top inner reflection */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent pointer-events-none rounded-t-full" />
              <ScanBracketsIcon className="relative z-10 w-5.5 h-5.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
            </button>

            {/* Clear "Scan" Text Label */}
            <span className="text-[9.5px] font-extrabold text-blue-600 mt-0.5 tracking-tight drop-shadow-2xs">
              Scan
            </span>
          </div>
        </div>

        {/* 4. MY RESULTS TAB */}
        <button
          onClick={() => onChangeTab('results')}
          className="relative flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer group"
        >
          <div className="relative flex items-center justify-center">
            {activeTab === 'results' && (
              <span className="absolute w-7 h-7 rounded-full bg-blue-100/70 -z-10 animate-in zoom-in-75 duration-200" />
            )}
            <ResultsBarsIcon
              className={`w-[17px] h-[17px] transition-colors duration-200 ${
                activeTab === 'results'
                  ? 'text-blue-600'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
          </div>
          <span
            className={`text-[9.5px] font-semibold mt-0.5 transition-colors whitespace-nowrap ${
              activeTab === 'results' ? 'text-blue-600 font-bold' : 'text-slate-400 group-hover:text-slate-600'
            }`}
          >
            My Results
          </span>
          {activeTab === 'results' && (
            <span className="w-3.5 h-[2px] bg-blue-600 rounded-full mt-0.5 shadow-2xs" />
          )}
        </button>

        {/* 5. PROFILE TAB */}
        <button
          onClick={() => onChangeTab('profile')}
          className="relative flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer group"
        >
          <div className="relative flex items-center justify-center">
            {activeTab === 'profile' && (
              <span className="absolute w-7 h-7 rounded-full bg-blue-100/70 -z-10 animate-in zoom-in-75 duration-200" />
            )}
            <User
              className={`w-[18px] h-[18px] transition-colors duration-200 ${
                activeTab === 'profile'
                  ? 'text-blue-600 fill-blue-600/20'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
          </div>
          <span
            className={`text-[9.5px] font-semibold mt-0.5 transition-colors ${
              activeTab === 'profile' ? 'text-blue-600 font-bold' : 'text-slate-400 group-hover:text-slate-600'
            }`}
          >
            Profile
          </span>
          {activeTab === 'profile' && (
            <span className="w-3.5 h-[2px] bg-blue-600 rounded-full mt-0.5 shadow-2xs" />
          )}
        </button>
      </nav>
    </div>
  );
};
