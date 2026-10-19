import React from 'react';
import { X, User, Sparkles, Heart, Award, ChevronRight, ShieldCheck } from 'lucide-react';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin?: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose, onOpenAdmin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-gradient-to-b from-[#e8f3fc] via-[#f4f9fd] to-[#ffffff] rounded-t-[32px] sm:rounded-[32px] shadow-[0_25px_60px_-15px_rgba(14,116,144,0.3)] border border-sky-200/80 overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3.5 border-b border-sky-100/90 bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-600 text-white flex items-center justify-center shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 tracking-tight">Profil Gaya Kamu</h3>
              <p className="text-[11px] text-sky-800/70 font-medium">Preferensi & statistik gaya personal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-600 border border-sky-100 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {/* User Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center gap-3.5 shadow-md shadow-blue-500/20">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center font-bold text-xl backdrop-blur-md">
              SAE
            </div>
            <div>
              <h4 className="font-bold text-base">Kamu (Fashion Explorer)</h4>
              <p className="text-xs text-blue-100">Gaya: Casual Chic & Korean Clean</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                  Level 3: Style Master
                </span>
              </div>
            </div>
          </div>

          {/* Style Attributes */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Undertone</span>
              <p className="font-bold text-sm text-slate-800 mt-0.5">Neutral - Cool</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Check</span>
              <p className="font-bold text-sm text-slate-800 mt-0.5">24 Outfit</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Skor Rata-rata</span>
              <p className="font-bold text-sm text-blue-600 mt-0.5">94.8 / 100</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Warna Favorit</span>
              <p className="font-bold text-sm text-slate-800 mt-0.5">Sky Blue & White</p>
            </div>
          </div>

          {/* Quick Menu */}
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white overflow-hidden">
            {/* Tombol Akses Admin Portal */}
            <button
              onClick={() => {
                onClose();
                onOpenAdmin?.();
              }}
              className="w-full px-4 py-3.5 text-left flex items-center justify-between text-xs font-bold text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100/70 transition-colors cursor-pointer group"
            >
              <span className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-indigo-950 font-bold">Admin Portal</span>
                    <span className="text-[9px] bg-indigo-200/80 text-indigo-800 px-1.5 py-0.2 rounded-full font-bold">Pengelola</span>
                  </div>
                  <p className="text-[10px] text-indigo-700/80 font-normal mt-0.5">Kelola foto maskot, posisi geser, & 5 banner</p>
                </div>
              </span>
              <ChevronRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                onClose();
              }}
              className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-semibold text-blue-700 bg-blue-50/50 hover:bg-blue-50 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Pasang SAE di Layar HP Kamu</span>
              </span>
              <ChevronRight className="w-4 h-4 text-blue-500" />
            </button>
            <button className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
              <span>Outfit Tersimpan (12)</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
            {/* Notification and Preferences */}
            <button className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
              <span>Pengaturan Notifikasi Harian</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
