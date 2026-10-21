import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
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
  Copy,
  Check,
  Send,
  Camera,
  Heart,
  FileText
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
  const [selectedItem, setSelectedItem] = useState<ScanHistoryItem | null>(
    latestItem || historyItems[0] || null
  );
  const [polaroidConfig, setPolaroidConfig] = useState<PolaroidConfig>(DEFAULT_POLAROID_CONFIG);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePlatform, setSharePlatform] = useState<SharePlatform>('instagram');
  const [showDetailedInfo, setShowDetailedInfo] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const polaroidCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = subscribePolaroidConfig((cfg) => {
      setPolaroidConfig(cfg);
    });
    return () => unsub();
  }, []);

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
          wrapper: 'bg-[#f4ebe1] text-[#3d2f24] border-[#d8c5b0] shadow-[0_18px_45px_-8px_rgba(100,70,40,0.28)]',
          rim: 'border-[#cbb39b]/60',
          photoBorder: 'border-[#c4ad95]',
          subtext: 'text-[#6e5845]',
          badge: 'bg-[#ebd4be] text-[#553b26]',
          watermark: 'text-[#5a422d]'
        };
      case 'obsidian_dark':
        return {
          wrapper: 'bg-[#18181b] text-slate-100 border-zinc-700 shadow-[0_20px_50px_-8px_rgba(0,0,0,0.65)]',
          rim: 'border-zinc-700/80',
          photoBorder: 'border-zinc-800',
          subtext: 'text-zinc-400',
          badge: 'bg-zinc-800 text-zinc-200 border-zinc-700',
          watermark: 'text-zinc-400'
        };
      case 'pastel_iridescent':
        return {
          wrapper: 'bg-gradient-to-br from-[#eff6ff] via-[#fdf2f8] to-[#f0fdf4] text-slate-800 border-pink-200/80 shadow-[0_18px_45px_-8px_rgba(244,114,182,0.25)]',
          rim: 'border-pink-200/60',
          photoBorder: 'border-pink-200/80',
          subtext: 'text-slate-600',
          badge: 'bg-pink-100/80 text-pink-700',
          watermark: 'text-pink-600'
        };
      case 'custom_uploaded':
        if (polaroidConfig.customFrameUrl) {
          return {
            wrapper: 'bg-cover bg-center text-slate-900 border-slate-300 shadow-2xl',
            customBg: polaroidConfig.customFrameUrl,
            rim: 'border-white/40',
            photoBorder: 'border-white/80',
            subtext: 'text-slate-600',
            badge: 'bg-white/80 text-slate-800 backdrop-blur-md',
            watermark: 'text-slate-900'
          };
        }
        return {
          wrapper: 'bg-[#fcfbf9] text-slate-800 border-[#eae6df] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.22)]',
          rim: 'border-slate-200/80',
          photoBorder: 'border-slate-300/70',
          subtext: 'text-slate-500',
          badge: 'bg-blue-50 text-blue-700 border-blue-100',
          watermark: 'text-slate-700'
        };
      case 'classic_white':
      default:
        return {
          wrapper: 'bg-[#fcfbf9] text-slate-800 border-[#eae6df] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.22)]',
          rim: 'border-slate-200/80',
          photoBorder: 'border-slate-300/70',
          subtext: 'text-slate-500',
          badge: 'bg-blue-50 text-blue-700 border-blue-100',
          watermark: 'text-slate-700'
        };
    }
  };

  const frameStyle = getFrameStyle();

  // Short, punchy confidence booster text for polaroid frame
  const getPunchyQuote = () => {
    if (!current) return '100% Sah & Percaya Diri! Hari ini giliranmu bersinar.';
    // Clean up to 1-2 punchy sentences max
    const verdict = current.data.saeVerdict || '';
    if (verdict.includes(':')) {
      return verdict.split(':')[1]?.trim() || verdict;
    }
    return verdict || 'Kamu tidak perlu izin siapapun untuk merasa keren hari ini!';
  };

  // Caption for Social Media sharing
  const getShareCaption = () => {
    if (!current) return '';
    return `Validasi Gaya SAE ✨\n"${current.data.overallVibe}"\n\n"${getPunchyQuote()}"\n\nSee Your Better Style with SAE 🚀 #SAEStyle #OOTD`;
  };

  // Render ONLY the aesthetic Polaroid photo card to HTML5 Canvas (WITHOUT any surrounding background!)
  const handleDirectShare = async () => {
    if (!current) return;
    setIsSharing(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // Authentic Polaroid dimensions (crisp high-res photo card)
      // Authentic Polaroid dimensions (crisp high-res photo card)
      const cardWidth = 860;
      const cardHeight = 1120;
      canvas.width = cardWidth;
      canvas.height = cardHeight;

      // 0. Ensure canvas is completely transparent outside the physical card
      ctx.clearRect(0, 0, cardWidth, cardHeight);

      // 1. Draw Physical Polaroid Card (Murni Bingkai Foto, TANPA Latar Belakang Luar)
      const cardRadius = 32;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, cardWidth, cardHeight, cardRadius);
      ctx.clip();

      if (polaroidConfig.activeFrame === 'obsidian_dark') {
        ctx.fillStyle = '#141417';
        ctx.fillRect(0, 0, cardWidth, cardHeight);
      } else if (polaroidConfig.activeFrame === 'vintage_kraft') {
        ctx.fillStyle = '#f3e8d8';
        ctx.fillRect(0, 0, cardWidth, cardHeight);
      } else if (polaroidConfig.activeFrame === 'pastel_iridescent') {
        const grad = ctx.createLinearGradient(0, 0, cardWidth, cardHeight);
        grad.addColorStop(0, '#fbf5f8');
        grad.addColorStop(0.5, '#f4f8fd');
        grad.addColorStop(1, '#f2fbf7');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cardWidth, cardHeight);
      } else {
        // Classic Studio White / Natural Cotton Paper
        ctx.fillStyle = '#faf8f5';
        ctx.fillRect(0, 0, cardWidth, cardHeight);
      }
      ctx.restore();

      // Delicate card border stroke
      ctx.strokeStyle = polaroidConfig.activeFrame === 'obsidian_dark' 
        ? '#2e2e34' 
        : polaroidConfig.activeFrame === 'vintage_kraft'
        ? '#d6c2ac'
        : '#e8e3d9';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(1, 1, cardWidth - 2, cardHeight - 2, cardRadius);
      ctx.stroke();

      // 2. Load and draw user photo
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const margin = 38;
          const photoW = cardWidth - (margin * 2);
          const photoH = 780;
          const photoX = margin;
          const photoY = margin;

          // Clip photo to rounded corners
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(photoX, photoY, photoW, photoH, 20);
          ctx.clip();
          ctx.drawImage(img, photoX, photoY, photoW, photoH);
          ctx.restore();

          // Subtle photo inner border for editorial feel
          ctx.strokeStyle = polaroidConfig.activeFrame === 'obsidian_dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(photoX, photoY, photoW, photoH, 20);
          ctx.stroke();

          // Watermark Logo "SAE ✦" kecil elegan di pojok kanan bawah foto
          if (polaroidConfig.showWatermark) {
            const wmWidth = 120;
            const wmHeight = 36;
            const wmX = photoX + photoW - wmWidth - 14;
            const wmY = photoY + photoH - wmHeight - 14;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
            ctx.beginPath();
            ctx.roundRect(wmX, wmY, wmWidth, wmHeight, 10);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px serif';
            ctx.textAlign = 'center';
            ctx.fillText(polaroidConfig.watermarkText || 'SAE ✦', wmX + (wmWidth / 2), wmY + 25);
          }

          // Chic Vibe Pill di pojok kiri atas foto
          const vibePillText = current.data.vibeTag || 'Aura SAE ✨';
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.beginPath();
          ctx.roundRect(photoX + 14, photoY + 14, 150, 32, 16);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = '600 15px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(vibePillText.length > 18 ? vibePillText.substring(0, 16) + '..' : vibePillText, photoX + 28, photoY + 35);

          // 3. Dagu Bawah Polaroid: Tipografi Estetik & Afirmasi Singkat
          ctx.textAlign = 'left';
          const textStartX = margin + 10;

          // Judul Overall Vibe (Elegan & Berkarakter)
          ctx.fillStyle = polaroidConfig.activeFrame === 'obsidian_dark' ? '#f4f4f5' : '#0f172a';
          ctx.font = 'bold 36px serif';
          const vibeTitle = current.data.overallVibe || 'Aura Tenang Berkelas ✨';
          ctx.fillText(vibeTitle.length > 34 ? vibeTitle.substring(0, 32) + '...' : vibeTitle, textStartX, photoY + photoH + 72);

          // Kutipan Afirmasi Percaya Diri Singkat (1 Kalimat Menghipnotis)
          ctx.fillStyle = polaroidConfig.activeFrame === 'obsidian_dark' ? '#a1a1aa' : '#334155';
          ctx.font = 'italic 500 24px sans-serif';
          const quote = getPunchyQuote();
          ctx.fillText(`"${quote.length > 56 ? quote.substring(0, 53) + '...' : quote}"`, textStartX, photoY + photoH + 130);

          // Garis pemisah tipis estetik
          ctx.strokeStyle = polaroidConfig.activeFrame === 'obsidian_dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(textStartX, photoY + photoH + 172);
          ctx.lineTo(cardWidth - margin - 10, photoY + photoH + 172);
          ctx.stroke();

          // Cap Analog Film & Tanggal di Kiri Bawah
          ctx.fillStyle = polaroidConfig.activeFrame === 'obsidian_dark' ? '#71717a' : '#64748b';
          ctx.font = '600 19px monospace';
          ctx.fillText(`SAE FILM 400 • ${current.formattedDate || '2026'}`, textStartX, photoY + photoH + 215);

          // Monogram Stempel Kanan: SAE ♡ VERIFIED
          ctx.textAlign = 'right';
          ctx.fillStyle = polaroidConfig.activeFrame === 'obsidian_dark' ? '#d4d4d8' : '#1e293b';
          ctx.font = 'bold 21px serif';
          ctx.fillText('SAE ♡ VERIFIED', cardWidth - margin - 10, photoY + photoH + 215);

          resolve();
        };
        img.onerror = () => resolve();
        img.src = current.imageUrl;
      });

      // Convert Canvas to Blob File (pure Polaroid card PNG)
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png');
      });

      if (!blob) throw new Error('Gagal merender bingkai polaroid');

      const file = new File([blob], 'sae-polaroid-style.png', { type: 'image/png' });
      const shareData = {
        title: 'Validasi Gaya SAE',
        text: getShareCaption(),
        files: [file]
      };

      // Native Web Share API: directly opens Instagram Stories / WhatsApp Status on mobile without downloading
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else if (navigator.share) {
        await navigator.share({
          title: 'Validasi Gaya SAE',
          text: getShareCaption(),
          url: window.location.href
        });
      } else {
        // Fallback for desktop: download pure card image and copy caption
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sae-polaroid.png';
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

        <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-200">
          Foto Polaroid SAE
        </span>
      </div>

      {current ? (
        <div className="space-y-4">
          
          {/* ========================================================================= */}
          {/* 1. BINGKAI POLAROID ESTETIK (RINGKAS: FOTO + TULISAN SAE + AFIRMASI SINGKAT)*/}
          {/* ========================================================================= */}
          <div className="relative pt-2">
            
            {/* Aksen Selotip Washi Tape Estetik di Atas Bingkai */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-24 h-5.5 bg-white/70 backdrop-blur-md border border-white/60 -rotate-1 rounded-xs shadow-xs pointer-events-none flex items-center justify-center">
              <span className="text-[8px] font-mono text-slate-400 font-bold uppercase tracking-widest opacity-60">
                SAE MEMORY
              </span>
            </div>

            {/* Kartu Polaroid Fisik */}
            <div 
              ref={polaroidCardRef}
              style={frameStyle.customBg ? { backgroundImage: `url(${frameStyle.customBg})` } : undefined}
              className={`relative rounded-[26px] p-3.5 sm:p-4 border transition-all duration-300 ${frameStyle.wrapper}`}
            >
              {/* Foto Utama Polaroid (Aspect 4:5 Sinematik) */}
              <div className={`relative w-full aspect-[4/5] rounded-[18px] overflow-hidden bg-slate-900 shadow-inner border ${frameStyle.photoBorder}`}>
                <img 
                  src={current.imageUrl} 
                  alt="Foto Outfit" 
                  className="w-full h-full object-cover object-center"
                />

                {/* Watermark Logo "SAE ✦" Elegan di Pojok Foto */}
                {polaroidConfig.showWatermark && (
                  <div className="absolute bottom-2.5 right-2.5 z-10">
                    <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/25 text-white font-serif font-black tracking-widest text-[11px] shadow-sm flex items-center gap-1">
                      <span>{polaroidConfig.watermarkText || 'SAE ✦'}</span>
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    </div>
                  </div>
                )}

                {/* Vibe Tag Ringkas di Kiri Atas */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[9.5px] font-bold border border-white/20 flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-2.5 h-2.5 text-cyan-300" />
                    <span>{current.data.vibeTag || 'Aura SAE ✨'}</span>
                  </span>
                </div>
              </div>

              {/* Dagu Bawah Polaroid: HANYA Judul Vibe & 1 Kalimat Pembangun Percaya Diri Singkat */}
              <div className="pt-3 pb-0.5 space-y-1 text-left">
                <h3 className="font-serif font-black text-lg sm:text-xl tracking-tight leading-snug">
                  {current.data.overallVibe}
                </h3>

                <p className="text-xs sm:text-[13px] font-semibold text-blue-600 leading-snug italic">
                  "{getPunchyQuote()}"
                </p>

                {/* Tanggal & Stamp SAE Estetik */}
                <div className="flex items-center justify-between pt-2 text-[10px] opacity-80 font-medium border-t border-slate-200/50">
                  <span className="font-mono text-[9px] tracking-wide">SAE FILM 400 • {current.formattedDate || '2026'}</span>
                  <span className="font-serif font-black tracking-wider text-[10px]">SAE ♡ VERIFIED</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. SATU TOMBOL BAGIKAN UTAMA (KIRIM POLAROID MURNI TANPA BACKGROUND LUAR)  */}
          {/* ========================================================================= */}
          <div className="pt-0.5">
            <button
              onClick={() => setShowShareModal(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-extrabold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Share2 className="w-4 h-4 text-cyan-200" />
              <span>Bagikan Hasil Gaya</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 3. KETERANGAN PANJANG HASIL SCAN (DI BAWAH POLAROID & TOMBOL BAGIKAN)     */}
          {/* ========================================================================= */}
          <div className="rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs overflow-hidden">
            
            {/* Header Accordion Keterangan Detail */}
            <button
              type="button"
              onClick={() => setShowDetailedInfo(!showDetailedInfo)}
              className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6.5 h-6.5 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">Keterangan Lengkap Hasil Analisis</h4>
                  <p className="text-[10px] text-slate-500">Ulasan karakter pakaian, sentuhan kilat & palet warna</p>
                </div>
              </div>

              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDetailedInfo ? 'rotate-180' : ''}`} />
            </button>

            {/* Konten Keterangan Panjang */}
            {showDetailedInfo && (
              <div className="px-3.5 pb-4 pt-1 space-y-3 border-t border-slate-100 text-xs text-slate-700 animate-in fade-in duration-150">
                
                {/* 1. Ulasan Karakter Mendalam */}
                {current.data.people?.[0] && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                    <span className="font-extrabold text-[11px] text-blue-900 block">
                      Apresiasi Karakter Outfit:
                    </span>
                    <p className="text-[11.5px] text-slate-700 leading-relaxed font-medium">
                      {current.data.people[0].validation}
                    </p>
                    {current.data.people[0].specialPraise && (
                      <p className="text-[11px] text-indigo-700 font-semibold pt-1">
                        ✨ {current.data.people[0].specialPraise}
                      </p>
                    )}
                  </div>
                )}

                {/* 2. Sentuhan Kilat 30 Detik */}
                {current.data.people?.[0]?.humorTweak && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-950 leading-relaxed flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-extrabold block text-amber-950">Sentuhan Kilat 30 Detik:</strong>
                      <span>{current.data.people[0].humorTweak}</span>
                    </div>
                  </div>
                )}

                {/* 3. Palet Warna Terbaca */}
                {current.data.palette && current.data.palette.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                      <Palette className="w-3.5 h-3.5 text-blue-600" />
                      <span>Palet Warna Terdeteksi:</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {current.data.palette.map((col, idx) => (
                        <div key={idx} className="flex items-center gap-1" title={col.name}>
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-2xs inline-block"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span className="text-[10px] text-slate-600 font-semibold">{col.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Ritual Senyum Melangkah */}
                {current.data.stepOutAffirmation && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 leading-relaxed flex items-start gap-2">
                    <Smile className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-extrabold block text-emerald-950">Ritual Senyum Sebelum Melangkah:</strong>
                      <span>{current.data.stepOutAffirmation}</span>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 4. NAVIGASI BAWAH: KEMBALI SCAN & LIHAT RIWAYAT                            */}
          {/* ========================================================================= */}
          <div className="space-y-2 pt-1">
            <button
              onClick={onOpenScan}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-98"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Buka Cermin (Kembali Scan)</span>
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Lihat Riwayat Scan ({historyItems.length})</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
            </button>

            {/* Riwayat Scan Sebelumnya */}
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
      {/* 5. MODAL POP-UP BAGIKAN BINGKAI POLAROID MURNI (TANPA BACKGROUND LUAR)    */}
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
                  <span>Bagikan Foto Polaroid</span>
                </h3>
                <p className="text-[10.5px] text-slate-500">
                  Langsung kirim foto polaroid estetik tanpa latar belakang tambahan.
                </p>
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pratinjau MURNI Foto Polaroid Estetik (Tanpa Background Luar) */}
            <div className="p-4 rounded-2xl bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:10px_10px] bg-slate-100/90 border border-slate-200/80 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
              <div className="flex items-center gap-1.5 mb-2.5 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 shadow-2xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span className="text-[9px] font-extrabold uppercase tracking-wider">
                  Murni Bingkai Foto (Tanpa Background Luar)
                </span>
              </div>

              {/* Mock Polaroid Card Cutout (Murni Bingkai Polaroid) */}
              <div className={`w-[85%] rounded-[20px] p-2.5 border shadow-xl ${frameStyle.wrapper} text-left`}>
                <div className="relative w-full aspect-[4/5] rounded-[14px] overflow-hidden bg-slate-900 border border-black/10">
                  <img 
                    src={current.imageUrl} 
                    alt="Pratinjau Polaroid" 
                    className="w-full h-full object-cover"
                  />
                  {polaroidConfig.showWatermark && (
                    <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-serif font-black bg-black/60 backdrop-blur-xs text-white border border-white/20">
                      {polaroidConfig.watermarkText || 'SAE ✦'}
                    </span>
                  )}
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[7.5px] font-bold bg-black/50 backdrop-blur-xs text-white border border-white/20">
                    {current.data.vibeTag || 'Aura SAE ✨'}
                  </span>
                </div>

                <div className="pt-2 pb-0.5 space-y-0.5">
                  <h4 className="font-serif font-black text-xs text-slate-900 truncate leading-tight">
                    {current.data.overallVibe}
                  </h4>
                  <p className="text-[10px] font-semibold text-blue-600 line-clamp-1 leading-tight">
                    "{getPunchyQuote()}"
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[8px] text-slate-400 font-medium border-t border-slate-200/50">
                    <span className="font-mono text-[7.5px]">SAE FILM 400</span>
                    <span className="font-serif font-black text-[8px] text-slate-700">SAE ♡ VERIFIED</span>
                  </div>
                </div>
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
                    <span>Menyiapkan Foto Polaroid...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-cyan-200" />
                    <span>Bagikan Polaroid ke Status WA / IG / TikTok</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyTextOnly}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copyFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Teks Tersalin! ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Salin Caption Teks Validasi</span>
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
