import React from 'react';
import { X, Image as ImageIcon, Check } from 'lucide-react';
import { BackgroundConfig, saveBackgroundConfig } from '../../services/firebase';

interface WallpaperSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: BackgroundConfig;
  onApplyConfig: (newCfg: BackgroundConfig) => void;
}

export const WallpaperSwitcherModal: React.FC<WallpaperSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onApplyConfig,
}) => {
  if (!isOpen) return null;

  const presets = [
    {
      id: 'monas_sunset',
      name: 'Monas Sunset',
      url: '/src/assets/images/user_monas_sunset_bg.jpg',
      desc: 'Hangat & Nuansa Jakarta',
    },
    {
      id: 'glass_studio',
      name: 'Glass Studio',
      url: '/src/assets/images/glass_bg_1791792847652.jpg',
      desc: 'Minimalis & Bersih',
    },
  ];

  const handleSelectPreset = async (url: string) => {
    const updated: BackgroundConfig = {
      ...currentConfig,
      imageUrl: url,
      updatedAt: new Date().toISOString(),
    };
    onApplyConfig(updated);
    try {
      await saveBackgroundConfig(updated, 'user');
    } catch {
      // ignore
    }
  };

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
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Ganti Wallpaper</h3>
              <p className="text-[10px] text-slate-500">Pilih latar belakang aplikasi favorit Anda</p>
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
          {presets.map((preset) => {
            const isSelected = currentConfig.imageUrl === preset.url;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.url)}
                className={`w-full p-2.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-slate-900">{preset.name}</h4>
                  <p className="text-[10px] text-slate-500">{preset.desc}</p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
        >
          Selesai
        </button>
      </div>
    </div>
  );
};
