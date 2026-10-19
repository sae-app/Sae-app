import React from 'react';
import { X, Bell, Sparkles, CheckCircle2, Clock } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const notifications = [
  {
    id: 1,
    title: 'Outfit Hari Ini Cocok Banget! 🌟',
    desc: 'Penilaian gayamu pagi ini tembus skor 96/100! Palet denim dan putih membuat tampilanmu segar seharian.',
    time: '1 jam yang lalu',
    unread: true,
  },
  {
    id: 2,
    title: 'Tips Cuaca & Gaya Hari Ini ⛅',
    desc: 'Suhu cerah sedikit berangin. Kenakan outer ringan atau kemeja katun agar tetap adem dan modis.',
    time: '4 jam yang lalu',
    unread: true,
  },
  {
    id: 3,
    title: 'Inspirasi Gaya Baru Tersedia!',
    desc: 'Lihat 5 paduan warna pastel untuk akhir pekan di tab Inspirasi.',
    time: 'Kemarin',
    unread: false,
  },
];

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-gradient-to-b from-[#e8f3fc] via-[#f4f9fd] to-[#ffffff] rounded-t-[32px] sm:rounded-[32px] shadow-[0_25px_60px_-15px_rgba(14,116,144,0.3)] border border-sky-200/80 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3.5 border-b border-sky-100/90 bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-600 text-white flex items-center justify-center shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 tracking-tight">Notifikasi Gaya</h3>
              <p className="text-[11px] text-sky-800/70 font-medium">Kabar terbaru seputar outfit & gayamu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-600 border border-sky-100 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3 bg-transparent">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all ${
                item.unread
                  ? 'bg-blue-50/70 border-blue-200/90 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                {item.unread && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{item.desc}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2.5 font-medium">
                <Clock className="w-3 h-3" />
                <span>{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
