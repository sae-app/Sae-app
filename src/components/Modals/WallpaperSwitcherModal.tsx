import React, { useState } from 'react';
import { X, Check, Image as ImageIcon, Sparkles, Sliders, Upload, RefreshCw } from 'lucide-react';
import { BackgroundConfig, saveBackgroundConfig } from '../../services/firebase';

export interface WallpaperPreset {
  id: string;
  name: string;
  subtitle: string;
  category: 'Ikonik' | 'Minimalis' | 'Urban' | 'Daylight';
  thumbnail: string;
  defaultOpacity: number;
  defaultBlur: number;
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'monas_golden_hour',
    name: 'Jakarta Monas Pagi',
    subtitle: 'Golden hour hangat dengan Monas ikonik (Sesuai Referensi)',
    category: 'Ikonik',
    thumbnail: '/src/assets/images/jakarta_monas_bg_1792081781159.jpg',
    defaultOpacity: 45,
    defaultBlur: 1,
  },
  {
    id: 'minimal_studio',
    name: 'Studio Travertine Mewah',
    subtitle: 'Interior beige krem estetik dengan bayangan palem',
    category: 'Minimalis',
    thumbnail: '/src/assets/images/minimal_studio_bg_1792081797432.jpg',
    defaultOpacity: 40,
    defaultBlur: 1,
  },
  {
    id: 'scbd_night',
    name: 'SCBD City Lights',
    subtitle: 'Gemerlap malam modern gedung pencakar langit Jakarta',
    category: 'Urban',
    thumbnail: '/src/assets/images/jakarta_night_bg_1792081811403.jpg',
    defaultOpacity: 50,
    defaultBlur: 2,
  },
  {
    id: 'botanical_daylight',
    name: 'Daylight Clean Studio',
    subtitle: 'Nuansa ruangan cerah dengan aksen daun segar',
    category: 'Daylight',
    thumbnail: '/src/assets/images/glass_bg_1791792847652.jpg',
    defaultOpacity: 30,
    defaultBlur: 2,
  },
];

interface WallpaperSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: BackgroundConfig;
  onApplyConfig: (config: BackgroundConfig) => void;
}

export const WallpaperSwitcherModal: React.FC<WallpaperSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onApplyConfig,
}) => {
  const [selectedUrl, setSelectedUrl] = useState<string>(
    currentConfig.imageUrl || WALLPAPER_PRESETS[0].thumbnail
  );
  const [opacity, setOpacity] = useState<number>(currentConfig.opacity ?? 45);
  const [blur, setBlur] = useState<number>(currentConfig.blur ?? 1);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'presets' | 'adjust'>('presets');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: WallpaperPreset) => {
    setSelectedUrl(preset.thumbnail);
    setOpacity(preset.defaultOpacity);
    setBlur(preset.defaultBlur);

    const updated: BackgroundConfig = {
      ...currentConfig,
      imageUrl: preset.thumbnail,
      opacity: preset.defaultOpacity,
      blur: preset.defaultBlur,
      updatedAt: new Date().toISOString(),
    };
    onApplyConfig(updated);
    saveBackgroundConfig(updated, 'user_quick_switch').catch(() => {});
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setSelectedUrl(customUrlInput.trim());
    const updated: BackgroundConfig = {
      ...currentConfig,
      imageUrl: customUrlInput.trim(),
      opacity,
      blur,
      updatedAt: new Date().toISOString(),
    };
    onApplyConfig(updated);
    saveBackgroundConfig(updated, 'user_custom_url').catch(() => {});
    setCustomUrlInput('');
  };

  const handleSliderChange = (newOpacity: number, newBlur: number) => {
    setOpacity(newOpacity);
    setBlur(newBlur);
    const updated: BackgroundConfig = {
      ...currentConfig,
      imageUrl: selectedUrl,
      opacity: newOpacity,
      blur: newBlur,
      updatedAt: new Date().toISOString(),
    };
    onApplyConfig(updated);
  };

  const handleSaveAndClose = async () => {
    setIsSaving(true);
    const updated: BackgroundConfig = {
      ...currentConfig,
      imageUrl: selectedUrl,
      opacity,
      blur,
      updatedAt: new Date().toISOString(),
    };
    onApplyConfig(updated);
    try {
      await saveBackgroundConfig(updated, 'user_wallpaper_modal');
    } catch {
      // Ignored
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-slate-100 flex flex-col max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="relative px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50/50 via-white to-blue-50/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Ganti Wallpaper Home
              </h3>
              <p className="text-[11px] text-slate-500">
                Pilih suasana latar belakang aplikasi SAE favoritmu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-5 pt-2 bg-slate-50/50 gap-2">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'presets'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Pilihan Suasana ({WALLPAPER_PRESETS.length})
          </button>
          <button
            onClick={() => setActiveTab('adjust')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'adjust'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Atur Kejernihan & Blur
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[58vh]">
          {activeTab === 'presets' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {WALLPAPER_PRESETS.map((preset) => {
                  const isSelected = selectedUrl === preset.thumbnail;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`group relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-200 aspect-[9/14] flex flex-col justify-end p-3 ${
                        isSelected
                          ? 'border-blue-600 shadow-lg shadow-blue-500/25 scale-[1.02]'
                          : 'border-slate-200 hover:border-slate-300 opacity-85 hover:opacity-100'
                      }`}
                    >
                      {/* Image Preview */}
                      <img
                        src={preset.thumbnail}
                        alt={preset.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Dark Gradient Overlay for text contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md animate-in zoom-in-75">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}

                      {/* Category tag */}
                      <span className="relative z-10 text-[9px] font-extrabold uppercase tracking-wider text-cyan-300 mb-1">
                        {preset.category}
                      </span>

                      {/* Name & Subtitle */}
                      <div className="relative z-10 text-white">
                        <h4 className="text-xs font-bold leading-tight">
                          {preset.name}
                        </h4>
                        <p className="text-[9.5px] text-slate-300 line-clamp-1 mt-0.5">
                          {preset.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Image URL Option */}
              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                  Atau Pasang Link Gambar / Wallpaper Sendiri:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                  <button
                    onClick={handleApplyCustomUrl}
                    disabled={!customUrlInput.trim()}
                    className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white disabled:opacity-40 cursor-pointer transition-all"
                  >
                    Pasang
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Tab: Adjust Sliders */
            <div className="space-y-5 py-2">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-900 leading-relaxed">
                  Atur transparansi dan keburaman agar teks menu Home tetap kontras dan nyaman dibaca dengan suasana latar belakang pilihanmu.
                </p>
              </div>

              {/* Opacity Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Kejelasan Gambar (Opacity)</span>
                  <span className="font-extrabold text-blue-600">{opacity}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="80"
                  value={opacity}
                  onChange={(e) => handleSliderChange(Number(e.target.value), blur)}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Lembut / Samar (15%)</span>
                  <span>Terang Kontras (80%)</span>
                </div>
              </div>

              {/* Blur Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Efek Bokeh / Blur</span>
                  <span className="font-extrabold text-blue-600">{blur} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={blur}
                  onChange={(e) => handleSliderChange(opacity, Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Sangat Tajam (0px)</span>
                  <span>Bokeh Halus (8px)</span>
                </div>
              </div>

              {/* Quick Reset to Default Monas Settings */}
              <button
                onClick={() => handleSliderChange(45, 1)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Kembalikan Pengaturan Standar (Golden Hour)
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handleSaveAndClose}
            disabled={isSaving}
            className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            {isSaving ? 'Menyimpan...' : 'Terapkan Wallpaper'}
          </button>
        </div>

      </div>
    </div>
  );
};
