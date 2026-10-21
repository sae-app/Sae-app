import React from 'react';
import { X, Bell, Sparkles, Tag, CheckCircle2 } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: 'Selamat Datang di SAE!',
      message: 'Mulai hari ini dengan validasi outfit cerdas untuk membangun rasa percaya diri Anda.',
      time: 'Baru saja',
      icon: Sparkles,
      iconColor: 'text-amber-500 bg-amber-100',
    },
    {
      id: 2,
      title: 'Promo Spesial Mitra Toko',
      message: 'Jelajahi diskon dan penawaran menarik dari brand mitra pilihan di menu Toko.',
      time: '2 jam lalu',
      icon: Tag,
      iconColor: 'text-blue-500 bg-blue-100',
    },
    {
      id: 3,
      title: 'Fitur Bingkai Polaroid Aktif',
      message: 'Kini hasil validasi gaya Anda otomatis dibingkai polaroid yang siap dibagikan ke IG & WA.',
      time: 'Kemarin',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500 bg-emerald-100',
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-white rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl border border-slate-100 space-y-4 max-h-[85dvh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Notifikasi SAE</h3>
              <p className="text-[10px] text-slate-500">Kabar terbaru dan inspirasi gaya</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {notifications.map((notif) => {
            const Icon = notif.icon;
            return (
              <div 
                key={notif.id}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 transition-all flex items-start gap-3"
              >
                <div className={`w-8 h-8 rounded-xl ${notif.iconColor} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-xs text-slate-800">{notif.title}</h4>
                    <span className="text-[9px] text-slate-400 shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-[10.5px] text-slate-600 mt-0.5 leading-snug">{notif.message}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
