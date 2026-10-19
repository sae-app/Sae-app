import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  Shirt, 
  Users, 
  Share2, 
  Lightbulb, 
  Heart, 
  CheckCircle2, 
  Palette, 
  Trash2, 
  ArrowLeft,
  Smile,
  Zap,
  Clock,
  RotateCcw,
  Compass,
  Rocket
} from 'lucide-react';
import { ScanHistoryItem } from '../types/scanner';

interface ResultsViewProps {
  onBackToHome: () => void;
  onOpenScan: () => void;
  latestItem?: ScanHistoryItem | null;
  historyItems: ScanHistoryItem[];
  onDeleteHistoryItem?: (id: string) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ 
  onBackToHome, 
  onOpenScan,
  latestItem,
  historyItems,
  onDeleteHistoryItem
}) => {
  // If there's a latestItem, display it as selected, otherwise display the first history item
  const [selectedItem, setSelectedItem] = useState<ScanHistoryItem | null>(
    latestItem || historyItems[0] || null
  );
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [steppedOut, setSteppedOut] = useState<boolean>(false);

  // Update selected item if a new scan arrives
  React.useEffect(() => {
    if (latestItem) {
      setSelectedItem(latestItem);
    } else if (!selectedItem && historyItems.length > 0) {
      setSelectedItem(historyItems[0]);
    }
  }, [latestItem, historyItems]);

  const current = selectedItem || historyItems[0];

  const handleShare = async () => {
    if (!current) return;
    const shareText = `Validasi Gaya SAE ✨\n"${current.data.overallVibe}" (${current.data.vibeTag})\n\nPutusan SAE: ${current.data.saeVerdict}\n\nSiap melangkah dengan percaya diri dan senyuman bareng SAE!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Validasi Outfit SAE',
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    }
  };

  const handleStepOut = () => {
    // Haptic pulse of triumph
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([60, 40, 80]);
    }
    setSteppedOut(true);
    setTimeout(() => {
      onBackToHome();
    }, 1200);
  };

  const getRelationBadge = () => {
    if (!current) return null;
    const type = current.data.relationType;
    const count = current.data.detectedPeopleCount;

    if (type === 'pasangan' || (count === 2 && !type)) {
      return {
        label: 'Sinergi Pasangan',
        color: 'bg-rose-500/20 text-rose-200 border-rose-400/30'
      };
    }
    if (type === 'keluarga') {
      return {
        label: `Harmoni Keluarga (${count} Orang)`,
        color: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
      };
    }
    if (type === 'teman' || count > 2) {
      return {
        label: `Energi Bestie (${count} Orang)`,
        color: 'bg-amber-500/20 text-amber-200 border-amber-400/30'
      };
    }
    return {
      label: 'Personal (Pemeran Utama)',
      color: 'bg-cyan-400/20 text-cyan-200 border-cyan-300/30'
    };
  };

  const relationBadge = getRelationBadge();

  return (
    <div className="px-3.5 py-2.5 space-y-4 animate-in fade-in duration-200 pb-16">
      
      {/* Top Navigation & Status */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Beranda</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Quick Retake Button */}
          <button
            onClick={onOpenScan}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 shadow-xs cursor-pointer transition-all active:scale-95"
            title="Ambil Pose Baru di Cermin"
          >
            <RotateCcw className="w-3 h-3 text-blue-600" />
            <span>Jepret Ulang</span>
          </button>

          <span className="text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-full border border-blue-200">
            Validasi SAE
          </span>
        </div>
      </div>

      {current ? (
        <div className="space-y-3.5">
          {/* MAIN HERO VALIDATION CARD (THE GLOWING MIRROR) */}
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-700 text-white p-4.5 sm:p-5 shadow-[0_16px_36px_-8px_rgba(37,99,235,0.4)] border border-blue-400/40">
            {/* Ambient background shine */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/25 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-indigo-400/25 rounded-full blur-2xl pointer-events-none" />

            {/* Top row: Relation Badge & Indonesian Timezone */}
            <div className="relative z-10 flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10.5px] font-bold tracking-wide border border-white/25 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                  <span>{current.data.vibeTag || 'Aura SAE ✨'}</span>
                </span>
                
                {relationBadge && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${relationBadge.color}`}>
                    <Users className="w-2.5 h-2.5" />
                    <span>{relationBadge.label}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[10.5px] text-blue-100 font-medium bg-black/20 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3 opacity-90 text-cyan-300" />
                <span>{current.data.localTimeInfo || current.formattedDate.split(',')[0]}</span>
              </div>
            </div>

            {/* Vibe Title & Headline */}
            <div className="relative z-10 space-y-1 mb-3.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                {current.data.overallVibe}
              </h2>
              {current.data.timeContext && (
                <p className="text-xs text-cyan-200 font-medium">
                  {current.data.timeContext}
                </p>
              )}
            </div>

            {/* Photo preview + Verdict Pill */}
            <div className="relative z-10 flex gap-3 items-center bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/15 mb-3.5">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-white/30 shadow-md">
                <img 
                  src={current.imageUrl} 
                  alt="Foto Cermin" 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-300 uppercase tracking-wider mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Pengesahan SAE: 100% Sah & Keren</span>
                </div>
                <p className="text-xs text-white font-semibold leading-snug line-clamp-2">
                  {current.data.saeVerdict}
                </p>
              </div>
            </div>

            {/* Relation Synergy Banner (If Duo / Keluarga / Teman) */}
            {(current.data.relationTitle || current.data.duoVibeTitle) && current.data.detectedPeopleCount > 1 && (
              <div className="relative z-10 bg-cyan-950/60 backdrop-blur-md rounded-2xl p-3 border border-cyan-400/30 text-white mb-3">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs mb-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{current.data.relationTitle || current.data.duoVibeTitle}</span>
                </div>
                <p className="text-[11.5px] text-cyan-100/95 leading-relaxed">
                  {current.data.relationDescription || current.data.duoVibeDescription}
                </p>
              </div>
            )}

            {/* Color Palette Indicators */}
            {current.data.palette && current.data.palette.length > 0 && (
              <div className="relative z-10 flex items-center justify-between pt-1 border-t border-white/15">
                <div className="flex items-center gap-1.5 text-[11px] text-blue-100 font-medium">
                  <Palette className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Palet Terbaca:</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {current.data.palette.map((col, idx) => (
                    <div key={idx} className="flex items-center gap-1" title={col.name}>
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-white/70 shadow-xs inline-block"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span className="text-[10px] text-white/90 font-medium">{col.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* INDIVIDUAL VALIDATIONS (FOR PERSONAL OR EACH PERSON) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {current.data.detectedPeopleCount > 1 ? 'Apresiasi & Detail Tiap Orang' : 'Validasi Batin & Karakter'}
                </span>
              </h3>
              <span className="text-[10.5px] text-blue-600 font-bold">100% Rasa Percaya Diri</span>
            </div>

            {current.data.people.map((person, index) => (
              <div 
                key={index}
                className="p-4 rounded-[22px] glass-panel border border-white/90 shadow-sm space-y-3 bg-white/75"
              >
                {/* Person Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 leading-none">
                        {person.identifier}
                      </h4>
                      <p className="text-[10.5px] text-slate-500 mt-0.5 truncate">
                        {person.outfitDetected}
                      </p>
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                </div>

                {/* Validation Text: Heartwarming, Affirming & Deeply Personal */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100/90 text-xs text-slate-800 leading-relaxed font-medium shadow-xs">
                  {person.validation}
                </div>

                {/* Sentuhan Kilat 30 Detik (Humor & Actionable Tweak) */}
                {person.humorTweak && (
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11.5px] text-amber-950 leading-relaxed flex items-start gap-2.5 shadow-xs">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-amber-950 block mb-0.5">Sentuhan Kilat 30 Detik:</strong>
                      <span>{person.humorTweak}</span>
                    </div>
                  </div>
                )}

                {/* Special Praise (Eye-Contact / Smile) */}
                {person.specialPraise && (
                  <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 font-medium px-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{person.specialPraise}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* RITUAL SENYUM & PENGESAHAN LANGKAH (THE STEP-OUT ANCHOR) */}
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-4 shadow-lg border border-emerald-400/30 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-100">
                  Ritual Senyum Sebelum Melangkah
                </h4>
                <p className="text-[11px] text-white/90 font-medium">
                  Cermin SAE sudah memberi restu penuh untuk harimu
                </p>
              </div>
            </div>

            <p className="text-xs text-white leading-relaxed font-medium bg-black/15 p-3 rounded-xl border border-white/10">
              {current.data.stepOutAffirmation || 
                'Tarik napas dalam, hembuskan perlahan... Tersenyumlah 3 detik ke cermin ini. Bahumu tegak, langkahmu hari ini sudah direstui semesta. Berangkat! 🚀'
              }
            </p>

            {/* Big Victory CTA: Tersenyum & Siap Melangkah! */}
            <button
              onClick={handleStepOut}
              disabled={steppedOut}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
                steppedOut 
                  ? 'bg-emerald-300 text-slate-900 animate-pulse'
                  : 'bg-white text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <Smile className="w-4 h-4 text-emerald-700" />
              <span>{steppedOut ? 'Semoga Harimu Menyenangkan! ✨' : 'Tersenyum & Siap Melangkah! 🚀'}</span>
            </button>
          </div>

          {/* Quick Tips Box */}
          {current.data.quickTips && current.data.quickTips.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200/80 space-y-1.5 text-xs text-slate-700">
              <div className="font-bold text-[11px] text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span>Tips Santai dari SAE:</span>
              </div>
              <ul className="space-y-1 pl-4 list-disc marker:text-blue-500 text-[11.5px]">
                {current.data.quickTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Share & Favorite Action Row */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleShare}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
            >
              <Share2 className="w-4 h-4 text-cyan-300" />
              <span>{copyFeedback ? 'Tersalin ke Clipboard! ✓' : 'Bagikan Pengesahan Gaya'}</span>
            </button>

            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isFavorited 
                  ? 'bg-rose-50 border-rose-200 text-rose-600' 
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
              title="Simpan ke Favorit"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>
      ) : null}

      {/* RE-SCAN CTA BUTTON (CLEAN MIRROR ONLY) */}
      <div className="pt-1">
        <button
          onClick={onOpenScan}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition-all cursor-pointer"
        >
          <Shirt className="w-4 h-4 text-cyan-200" />
          <span>Buka Cermin SAE (Jepret Baru)</span>
        </button>
      </div>

      {/* RECENT SCANS HISTORY LIST */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
            Riwayat Validasi ({historyItems.length})
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">Ketuk untuk lihat kembali</span>
        </div>

        <div className="space-y-2">
          {historyItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                selectedItem?.id === item.id
                  ? 'border-blue-500 bg-blue-50/80 shadow-xs'
                  : 'border-slate-200/80 bg-white/70 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-200">
                  <img 
                    src={item.imageUrl} 
                    alt={item.data.overallVibe} 
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      {item.data.vibeTag || 'Aura SAE'}
                    </span>
                    {item.data.detectedPeopleCount > 1 && (
                      <span className="text-[9.5px] font-semibold text-cyan-800 bg-cyan-100 px-1.5 py-0.2 rounded-full">
                        {item.data.detectedPeopleCount} Orang
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 truncate mt-1">
                    {item.data.overallVibe}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    <span>{item.formattedDate}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {onDeleteHistoryItem && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistoryItem(item.id);
                    }}
                    className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus riwayat ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
