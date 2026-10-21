import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  ChevronDown,
  RotateCcw, 
  Share2, 
  Palette, 
  Trash2, 
  ArrowLeft,
  Smile,
  Zap,
  Clock,
  CheckCircle2,
  X,
  MessageCircle,
  Copy,
  Check,
  Download,
  Send,
  Camera
} from 'lucide-react';
import { ScanHistoryItem } from '../types/scanner';
import { 
  subscribePolaroidConfig, 
  PolaroidConfig, 
  DEFAULT_POLAROID_CONFIG 
} from '../services/firebase';

interface ResultsViewProps {
  onBackToHome: () => void;
  onOpenScan: () => void;
  latestItem?: ScanHistoryItem | null;
  historyItems: ScanHistoryItem[];
  onDeleteHistoryItem?: (id: string) => void;
}

type SharePlatform = 'whatsapp' | 'instagram' | 'tiktok';

export const ResultsView: React.FC<ResultsViewProps> = ({ 
  onBackToHome, 
  onOpenScan,
  latestItem,
  historyItems,
  onDeleteHistoryItem
}) => {
  // If there's a latestItem, display it, otherwise display the first history item
  const [selectedItem, setSelectedItem] = useState<ScanHistoryItem | null>(
    latestItem || historyItems[0] || null
  );
  const [polaroidConfig, setPolaroidConfig] = useState<PolaroidConfig>(DEFAULT_POLAROID_CONFIG);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePlatform, setSharePlatform] = useState<SharePlatform>('instagram');
  const [showHistory, setShowHistory] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const polaroidCardRef = useRef<HTMLDivElement>(null);

  // Subscribe to live Polaroid frame settings from Admin
  useEffect(() => {
    const unsub = subscribePolaroidConfig((cfg) => {
      setPolaroidConfig(cfg);
    });
    return () => unsub();
  }, []);

  // Update selected item if a new scan arrives
  useEffect(() => {
    if (latestItem) {
      setSelectedItem(latestItem);
    } else if (!selectedItem && historyItems.length > 0) {
      setSelectedItem(historyItems[0]);
    }
  }, [latestItem, historyItems]);

  const current = selectedItem || historyItems[0];

  // Helper for Frame Styles based on Admin configuration
  const getFrameStyle = () => {
    switch (polaroidConfig.activeFrame) {
      case 'vintage_kraft':
        return {
          wrapper: 'bg-[#f4ebe1] text-[#3d2f24] border-[#d8c5b0] shadow-[0_12px_36px_-6px_rgba(100,70,40,0.25)]',
          rim: 'border-[#cbb39b]/60',
          photoBorder: 'border-[#c4ad95]',
          subtext: 'text-[#6e5845]',
          badge: 'bg-[#ebd4be] text-[#553b26]',
          watermark: 'text-[#5a422d]'
        };
      case 'obsidian_dark':
        return {
          wrapper: 'bg-[#18181b] text-slate-100 border-zinc-700 shadow-[0_16px_40px_-6px_rgba(0,0,0,0.6)]',
          rim: 'border-zinc-700/80',
          photoBorder: 'border-zinc-800',
          subtext: 'text-zinc-400',
          badge: 'bg-zinc-800 text-zinc-200 border-zinc-700',
          watermark: 'text-zinc-400'
        };
      case 'pastel_iridescent':
        return {
          wrapper: 'bg-gradient-to-br from-[#eff6ff] via-[#fdf2f8] to-[#f0fdf4] text-slate-800 border-pink-200/80 shadow-[0_14px_36px_-6px_rgba(244,114,182,0.22)]',
          rim: 'border-pink-200/60',
          photoBorder: 'border-pink-200/80',
          subtext: 'text-slate-600',
          badge: 'bg-pink-100/80 text-pink-700',
          watermark: 'text-pink-600'
        };
      case 'custom_uploaded':
        if (polaroidConfig.customFrameUrl) {
          return {
            wrapper: 'bg-cover bg-center text-slate-900 border-slate-300 shadow-xl',
            customBg: polaroidConfig.customFrameUrl,
            rim: 'border-white/40',
            photoBorder: 'border-white/80',
            subtext: 'text-slate-600',
            badge: 'bg-white/80 text-slate-800 backdrop-blur-md',
            watermark: 'text-slate-900'
          };
        }
        // Fallback to classic white
        return {
          wrapper: 'bg-[#fdfbf7] text-slate-800 border-[#eae5dc] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.2)]',
          rim: 'border-slate-200/80',
          photoBorder: 'border-slate-300/80',
          subtext: 'text-slate-500',
          badge: 'bg-blue-50 text-blue-700 border-blue-100',
          watermark: 'text-slate-700'
        };
      case 'classic_white':
      default:
        return {
          wrapper: 'bg-[#fdfbf7] text-slate-800 border-[#eae5dc] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.2)]',
          rim: 'border-slate-200/80',
          photoBorder: 'border-slate-300/80',
          subtext: 'text-slate-500',
          badge: 'bg-blue-50 text-blue-700 border-blue-100',
          watermark: 'text-slate-700'
        };
    }
  };

  const frameStyle = getFrameStyle();

  // Generate Caption for Social Media
  const getShareCaption = () => {
    if (!current) return '';
    return `Validasi Gaya SAE ✨\n"${current.data.overallVibe}" (${current.data.vibeTag})\n\nPutusan SAE: ${current.data.saeVerdict}\n\nSiap melangkah dengan percaya diri bareng SAE! 🚀\n#SAEStyle #OOTD #SeeYourBetterStyle`;
  };

  // Render HTML5 Canvas and execute direct Native Share Sheet without downloading first
  const handleDirectShare = async () => {
    if (!current) return;
    setIsSharing(true);

    try {
      // 1. Prepare Canvas to render high-res story/post card
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // 9:16 vertical ratio (1080 x 1920 HD Story)
      canvas.width = 1080;
      canvas.height = 1920;

      // Draw background gradient matching platform
      if (sharePlatform === 'instagram') {
        const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
        bgGrad.addColorStop(0, '#4f46e5');
        bgGrad.addColorStop(0.5, '#9333ea');
        bgGrad.addColorStop(1, '#ec4899');
        ctx.fillStyle = bgGrad;
      } else if (sharePlatform === 'whatsapp') {
        const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
        bgGrad.addColorStop(0, '#064e3b');
        bgGrad.addColorStop(0.5, '#047857');
        bgGrad.addColorStop(1, '#059669');
        ctx.fillStyle = bgGrad;
      } else {
        // TikTok
        const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
        bgGrad.addColorStop(0, '#09090b');
        bgGrad.addColorStop(0.5, '#18181b');
        bgGrad.addColorStop(1, '#0284c7');
        ctx.fillStyle = bgGrad;
      }
      ctx.fillRect(0, 0, 1080, 1920);

      // Draw Top Brand Header
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SAE · See Your Better Style', 540, 140);

      // Draw Polaroid Outer Box
      const pWidth = 860;
      const pHeight = 1240;
      const pX = (1080 - pWidth) / 2;
      const pY = 220;

      // Polaroid Background
      ctx.fillStyle = polaroidConfig.activeFrame === 'obsidian_dark' ? '#18181b' : polaroidConfig.activeFrame === 'vintage_kraft' ? '#f4ebe1' : '#fdfbf7';
      ctx.beginPath();
      ctx.roundRect(pX, pY, pWidth, pHeight, 28);
      ctx.fill();

      // Load user photo and draw inside polaroid
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const imgMargin = 40;
          const imgW = pWidth - (imgMargin * 2);
          const imgH = 820;
          const imgX = pX + imgMargin;
          const imgY = pY + imgMargin;

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(imgX, imgY, imgW, imgH, 16);
          ctx.clip();
          ctx.drawImage(img, imgX, imgY, imgW, imgH);
          ctx.restore();

          // Watermark on photo
          if (polaroidConfig.showWatermark) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.beginPath();
            ctx.roundRect(imgX + imgW - 130, imgY + imgH - 52, 115, 38, 8);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 22px serif';
            ctx.textAlign = 'center';
            ctx.fillText(polaroidConfig.watermarkText || 'SAE', imgX + imgW - 72, imgY + imgH - 26);
          }

          // Polaroid Bottom Content
          ctx.textAlign = 'left';
          const textStartX = pX + 50;

          // Vibe Title
          ctx.fillStyle = polaroidConfig.activeFrame === 'obsidian_dark' ? '#ffffff' : '#0f172a';
          ctx.font = 'bold 42px sans-serif';
          ctx.fillText(current.data.overallVibe || 'Aura Menawan', textStartX, pY + 930);

          // Vibe Tag
          ctx.fillStyle = '#0284c7';
          ctx.font = 'bold 28px sans-serif';
          ctx.fillText(current.data.vibeTag || 'Main Character Energy ✨', textStartX, pY + 980);

          // Verdict
          ctx.fillStyle = polaroidConfig.activeFrame === 'obsidian_dark' ? '#cbd5e1' : '#334155';
          ctx.font = '500 26px sans-serif';
          ctx.fillText(current.data.saeVerdict.substring(0, 52) + '...', textStartX, pY + 1040);

          // Timestamp
          ctx.fillStyle = polaroidConfig.activeFrame === 'obsidian_dark' ? '#71717a' : '#64748b';
          ctx.font = '500 22px sans-serif';
          ctx.fillText(current.formattedDate || 'Hari ini', textStartX, pY + 1120);

          // Small SAE Brand Stamp in polaroid corner
          ctx.textAlign = 'right';
          ctx.fillStyle = polaroidConfig.activeFrame === 'obsidian_dark' ? '#a1a1aa' : '#475569';
          ctx.font = 'bold 26px serif';
          ctx.fillText('SAE ✨', pX + pWidth - 50, pY + 1120);

          resolve();
        };
        img.onerror = () => resolve(); // continue if image load fails
        img.src = current.imageUrl;
      });

      // Bottom Story Footer Callout
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Validasi & Percaya Diri Outfit Kamu bareng SAE', 540, 1780);

      // 2. Convert Canvas to Blob File
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png');
      });

      if (!blob) throw new Error('Gagal menghasilkan gambar');

      const file = new File([blob], 'sae-polaroid-style.png', { type: 'image/png' });
      const shareData = {
        title: 'Validasi Gaya Outfit SAE',
        text: getShareCaption(),
        files: [file]
      };

      // 3. Trigger Native Web Share Sheet directly (opens WhatsApp / IG / TikTok directly on mobile)
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else if (navigator.share) {
        // Fallback to text + URL if files not supported by current browser
        await navigator.share({
          title: 'Validasi Gaya Outfit SAE',
          text: getShareCaption(),
          url: window.location.href
        });
      } else {
        // Desktop / Unsupported browser fallback: Download image & copy text
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sae-polaroid-style.png';
        a.click();
        URL.revokeObjectURL(url);
        navigator.clipboard.writeText(getShareCaption());
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2500);
      }
    } catch (err) {
      console.warn('Share notice:', err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyTextOnly = () => {
    navigator.clipboard.writeText(getShareCaption());
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  return (
    <div className="px-3.5 pt-3.5 pb-20 space-y-4 animate-in fade-in duration-200 select-none">
      
      {/* ================= TOP NAVIGATION BAR ================= */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Beranda</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10.5px] font-extrabold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-200">
            Foto Polaroid SAE
          </span>
        </div>
      </div>

      {current ? (
        <div className="space-y-4">
          
          {/* ========================================================================= */}
          {/* 1. KARTU FOTO POLAROID ELEGAN DENGAN WATERMARK "SAE" KECIL                 */}
          {/* ========================================================================= */}
          <div 
            ref={polaroidCardRef}
            style={frameStyle.customBg ? { backgroundImage: `url(${frameStyle.customBg})` } : undefined}
            className={`relative rounded-[24px] p-3.5 sm:p-4.5 border transition-all duration-300 ${frameStyle.wrapper}`}
          >
            {/* Foto Polaroid Utama */}
            <div className={`relative w-full aspect-[4/5] rounded-[16px] overflow-hidden bg-slate-900 shadow-inner border ${frameStyle.photoBorder}`}>
              <img 
                src={current.imageUrl} 
                alt="Foto Cermin" 
                className="w-full h-full object-cover object-center"
              />

              {/* Watermark Tulisan "SAE" Kecil di Pojok Foto */}
              {polaroidConfig.showWatermark && (
                <div className="absolute bottom-2.5 right-2.5 z-10">
                  <div className="px-2 py-0.5 rounded-md bg-black/55 backdrop-blur-md border border-white/30 text-white font-serif font-black tracking-widest text-[11px] shadow-sm flex items-center gap-1">
                    <span>{polaroidConfig.watermarkText || 'SAE'}</span>
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  </div>
                </div>
              )}

              {/* Tag Vibe Mengambang Halus di Kiri Atas Foto */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="px-2 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white text-[9.5px] font-bold border border-white/20 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-300" />
                  <span>{current.data.vibeTag || 'Aura SAE ✨'}</span>
                </span>
              </div>
            </div>

            {/* Bagian Bawah Kertas Polaroid: Teks Validasi SAE & Afirmasi */}
            <div className="pt-3 pb-1 space-y-2">
              
              {/* Judul Vibe & Putusan */}
              <div className="space-y-1">
                <h3 className="font-serif font-black text-lg sm:text-xl tracking-tight leading-tight">
                  {current.data.overallVibe}
                </h3>

                <div className="flex items-center gap-1 text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{current.data.saeVerdict || 'Validasi SAE: 100% Sah & Keren!'}</span>
                </div>
              </div>

              {/* Kalimat Validasi Batin Utama */}
              {current.data.people?.[0]?.validation && (
                <p className={`text-xs leading-relaxed font-medium ${frameStyle.subtext}`}>
                  {current.data.people[0].validation}
                </p>
              )}

              {/* Sentuhan Kilat 30 Detik (Trik Kecil Cerdas) */}
              {current.data.people?.[0]?.humorTweak && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-[11px] leading-relaxed flex items-start gap-2 text-amber-900">
                  <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{current.data.people[0].humorTweak}</span>
                </div>
              )}

              {/* Palet Warna Terbaca & Tanggal */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-[10px]">
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3 h-3 opacity-70" />
                  <span>{current.formattedDate || 'Hari ini'}</span>
                </div>

                {current.data.palette && current.data.palette.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {current.data.palette.map((col, idx) => (
                      <span 
                        key={idx}
                        className="w-3 h-3 rounded-full border border-black/20 shadow-2xs inline-block"
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. SATU TOMBOL BAGIKAN UTAMA (MEMBUKA FRAME PILIHAN BERBAGI LANGSUNG)    */}
          {/* ========================================================================= */}
          <div className="pt-1">
            <button
              onClick={() => setShowShareModal(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-extrabold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Share2 className="w-4 h-4 text-cyan-200" />
              <span>Bagikan Hasil Gaya</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 3. TOMBOL NAVIGASI BAWAH: KEMBALI SCAN & LIHAT RIWAYAT                     */}
          {/* ========================================================================= */}
          <div className="space-y-2 pt-1">
            {/* Tombol Utama: Kembali Scan (Jepret Pose Baru) */}
            <button
              onClick={onOpenScan}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-98"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Buka Cermin (Kembali Scan)</span>
            </button>

            {/* Tombol Toggle Riwayat Scan */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Lihat Riwayat Scan ({historyItems.length})</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
            </button>

            {/* Konten Riwayat (Hanya Terbuka Saat Diklik) */}
            {showHistory && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      selectedItem?.id === item.id
                        ? 'border-blue-500 bg-blue-50/80 shadow-2xs'
                        : 'border-slate-200/80 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-slate-200">
                        <img 
                          src={item.imageUrl} 
                          alt="Thumbnail Riwayat" 
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-[11px] text-slate-800 truncate">
                          {item.data.overallVibe}
                        </h4>
                        <p className="text-[9.5px] text-slate-400 mt-0.5">
                          {item.formattedDate}
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
                          className="p-1 text-slate-300 hover:text-rose-500 rounded-md transition-colors cursor-pointer"
                          title="Hapus riwayat ini"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* 4. MODAL POP-UP PILIHAN FRAME BERBAGI (LANGSUNG KE IG / WA / TIKTOK)       */}
      {/* ========================================================================= */}
      {showShareModal && current && (
        <div 
          onClick={() => setShowShareModal(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl border border-slate-100 space-y-4 max-h-[92dvh] overflow-y-auto no-scrollbar"
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div>
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  <span>Bagikan Hasil Gaya</span>
                </h3>
                <p className="text-[10.5px] text-slate-500">
                  Langsung kirim ke aplikasi tanpa perlu unduh manual.
                </p>
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pilihan Kotak Platform (Menyesuaikan Format) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-700 block">
                Pilih Format Media Sosial:
              </label>

              <div className="grid grid-cols-3 gap-2">
                {/* 1. Instagram Story */}
                <button
                  type="button"
                  onClick={() => setSharePlatform('instagram')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    sharePlatform === 'instagram'
                      ? 'border-pink-500 bg-pink-50/80 shadow-xs ring-2 ring-pink-400/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                    IG
                  </div>
                  <span className="text-[10px] font-bold text-slate-800">Story IG</span>
                  <span className="text-[8.5px] text-pink-600 font-semibold">9:16 Vertikal</span>
                </button>

                {/* 2. WhatsApp Status */}
                <button
                  type="button"
                  onClick={() => setSharePlatform('whatsapp')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    sharePlatform === 'whatsapp'
                      ? 'border-emerald-500 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-400/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                    WA
                  </div>
                  <span className="text-[10px] font-bold text-slate-800">Status WA</span>
                  <span className="text-[8.5px] text-emerald-600 font-semibold">Langsung Kirim</span>
                </button>

                {/* 3. TikTok */}
                <button
                  type="button"
                  onClick={() => setSharePlatform('tiktok')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    sharePlatform === 'tiktok'
                      ? 'border-slate-900 bg-slate-100 shadow-xs ring-2 ring-slate-800/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                    TT
                  </div>
                  <span className="text-[10px] font-bold text-slate-800">TikTok</span>
                  <span className="text-[8.5px] text-slate-600 font-semibold">OOTD Video</span>
                </button>
              </div>
            </div>

            {/* Kotak Frame Preview Sesuai Pilihan */}
            <div className="p-3 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between text-[10.5px] px-1 text-slate-300">
                <span className="font-bold">Pratinjau Format Berbagi</span>
                <span className="text-cyan-400 font-mono text-[9px]">1080 x 1920 px</span>
              </div>

              <div className={`relative w-full aspect-[9/12] rounded-xl overflow-hidden flex flex-col items-center justify-center p-3 border border-white/20 ${
                sharePlatform === 'instagram' 
                  ? 'bg-gradient-to-tr from-purple-900 via-rose-900 to-indigo-900' 
                  : sharePlatform === 'whatsapp' 
                  ? 'bg-gradient-to-tr from-emerald-950 via-teal-900 to-emerald-900' 
                  : 'bg-gradient-to-tr from-zinc-950 via-slate-900 to-cyan-950'
              }`}>
                {/* Mini Header Text */}
                <span className="text-[9px] font-extrabold text-white/90 tracking-widest uppercase mb-1.5 drop-shadow-xs">
                  SAE · See Your Better Style
                </span>

                {/* Mini Polaroid Card Mockup */}
                <div className={`w-[82%] rounded-xl p-2 border shadow-lg ${frameStyle.wrapper} text-center`}>
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-900">
                    <img 
                      src={current.imageUrl} 
                      alt="Mini Preview" 
                      className="w-full h-full object-cover"
                    />
                    {polaroidConfig.showWatermark && (
                      <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded text-[7px] font-serif font-black bg-black/60 text-white">
                        {polaroidConfig.watermarkText || 'SAE'}
                      </span>
                    )}
                  </div>
                  <div className="pt-1.5 space-y-0.5">
                    <span className="block font-black text-[10px] truncate leading-tight">
                      {current.data.overallVibe}
                    </span>
                    <span className="block text-[8px] font-bold text-blue-600 truncate">
                      {current.data.saeVerdict}
                    </span>
                  </div>
                </div>

                {/* Mini Bottom Stamp */}
                <span className="text-[8px] text-white/70 mt-2 font-medium">
                  Validasi Gaya 100% Sah ✨
                </span>
              </div>
            </div>

            {/* Tombol Eksekusi Berbagi Langsung (Mobile Native Share Sheet) */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleDirectShare}
                disabled={isSharing}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
              >
                {isSharing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-cyan-200" />
                    <span>Menyiapkan Berbagi Langsung...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-cyan-200" />
                    <span>Bagikan Langsung ke HP (Tanpa Unduh)</span>
                  </>
                )}
              </button>

              {/* Tombol Cadangan: Salin Teks */}
              <button
                type="button"
                onClick={handleCopyTextOnly}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copyFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Teks & Kutipan Tersalin! ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Salin Teks Validasi</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
