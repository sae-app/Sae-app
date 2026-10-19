import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Check, 
  RefreshCw, 
  Maximize2, 
  Sparkles,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Hand,
  Layers,
  HelpCircle,
  FileText
} from 'lucide-react';
import { 
  BackgroundConfig, 
  MascotQuoteShape, 
  PaperBannerConfig, 
  DEFAULT_PAPER_BANNER_CONFIG 
} from '../../services/firebase';
import { MascotSpeechBubble } from '../MascotSpeechBubble';
import { PaperBannerOrnament } from '../PaperBannerOrnament';

interface MascotFullScreenEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  customSize: number;
  offsetX: number;
  offsetY: number;
  bgConfig: BackgroundConfig;
  companionQuote?: string;
  showQuote?: boolean;
  quoteShape?: MascotQuoteShape;
  quotePosition?: 'beside' | 'above';
  quoteOffsetX?: number;
  quoteOffsetY?: number;
  quoteScale?: number;
  quoteCustomImageUrl?: string;
  quoteShowText?: boolean;
  paperBannerConfig?: PaperBannerConfig;
  onSave: (
    newOffsetX: number, 
    newOffsetY: number, 
    newSize: number,
    newQuoteOffsetX?: number,
    newQuoteOffsetY?: number,
    newQuoteScale?: number,
    newBannerOffsetX?: number,
    newBannerOffsetY?: number,
    newBannerScale?: number,
    newBannerRotate?: number,
    newBannerOpacity?: number,
    newBannerEnabled?: boolean
  ) => Promise<void>;
}

export const MascotFullScreenEditor: React.FC<MascotFullScreenEditorProps> = ({
  isOpen,
  onClose,
  imageUrl,
  customSize: initialSize,
  offsetX: initialOffsetX,
  offsetY: initialOffsetY,
  bgConfig,
  companionQuote = 'Hai! Aku SAE di sini! ♡',
  showQuote = true,
  quoteShape = 'watercolor_bubble',
  quotePosition = 'beside',
  quoteOffsetX: initialQuoteX = 0,
  quoteOffsetY: initialQuoteY = 0,
  quoteScale: initialQuoteScale = 100,
  quoteCustomImageUrl = '',
  quoteShowText = true,
  paperBannerConfig,
  onSave,
}) => {
  // Mascot state
  const [mascotX, setMascotX] = useState<number>(initialOffsetX);
  const [mascotY, setMascotY] = useState<number>(initialOffsetY);
  const [mascotSize, setMascotSize] = useState<number>(initialSize);

  // Quote bubble state
  const [quoteX, setQuoteX] = useState<number>(initialQuoteX);
  const [quoteY, setQuoteY] = useState<number>(initialQuoteY);
  const [quoteScale, setQuoteScale] = useState<number>(initialQuoteScale);

  // Spanduk Sobekan Kertas state (Layer 2)
  const initialBanner = paperBannerConfig || DEFAULT_PAPER_BANNER_CONFIG;
  const [bannerX, setBannerX] = useState<number>(initialBanner.offsetX ?? 0);
  const [bannerY, setBannerY] = useState<number>(initialBanner.offsetY ?? 20);
  const [bannerScale, setBannerScale] = useState<number>(initialBanner.scale ?? 100);
  const [bannerRotate, setBannerRotate] = useState<number>(initialBanner.rotate ?? -2);
  const [bannerOpacity, setBannerOpacity] = useState<number>(initialBanner.opacity ?? 100);
  const [bannerEnabled, setBannerEnabled] = useState<boolean>(initialBanner.enabled ?? true);

  // Interaction mode & target: 'banner' | 'mascot' | 'quote'
  const [activeTarget, setActiveTarget] = useState<'banner' | 'mascot' | 'quote'>('banner');
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [gestureNotice, setGestureNotice] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showGuidelines, setShowGuidelines] = useState<boolean>(true);

  // Multi-pointer tracking for pinch-to-zoom & twist-to-rotate
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartAngleRef = useRef<number | null>(null);
  const pinchStartValueRef = useRef<number>(0);
  const pinchStartRotateRef = useRef<number>(0);
  const dragStartRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const bannerContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync state whenever editor opens
  useEffect(() => {
    if (isOpen) {
      setMascotX(initialOffsetX);
      setMascotY(initialOffsetY);
      setMascotSize(initialSize);
      setQuoteX(initialQuoteX);
      setQuoteY(initialQuoteY);
      setQuoteScale(initialQuoteScale);
      
      const b = paperBannerConfig || DEFAULT_PAPER_BANNER_CONFIG;
      setBannerX(b.offsetX ?? 0);
      setBannerY(b.offsetY ?? 20);
      setBannerScale(b.scale ?? 100);
      setBannerRotate(b.rotate ?? -2);
      setBannerOpacity(b.opacity ?? 100);
      setBannerEnabled(b.enabled !== false);
      setActiveTarget('banner');
    }
  }, [isOpen, initialOffsetX, initialOffsetY, initialSize, initialQuoteX, initialQuoteY, initialQuoteScale, paperBannerConfig]);

  if (!isOpen) return null;

  // --- POINTER GESTURE HANDLER (DRAG + PINCH + ROTATE) ---
  const handlePointerDown = (target: 'banner' | 'mascot' | 'quote', e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveTarget(target);
    setIsInteracting(true);

    const targetEl = e.currentTarget as HTMLElement;
    targetEl.setPointerCapture(e.pointerId);

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1) {
      // Single touch / mouse: Start Drag
      let originX = mascotX;
      let originY = mascotY;
      if (target === 'quote') {
        originX = quoteX;
        originY = quoteY;
      } else if (target === 'banner') {
        originX = bannerX;
        originY = bannerY;
      }

      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        originX,
        originY,
      };

      const label = target === 'banner' ? 'Spanduk Kertas' : target === 'mascot' ? 'Maskot' : 'Balon Sapaan';
      setGestureNotice(`👆 Geser ${label}`);
    } else if (activePointersRef.current.size === 2) {
      // Two fingers: Start Pinch-to-zoom + Twist-to-rotate!
      dragStartRef.current = null;
      const points = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      const angle = Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x) * (180 / Math.PI);
      
      pinchStartDistRef.current = dist;
      pinchStartAngleRef.current = angle;

      if (target === 'banner') {
        pinchStartValueRef.current = bannerScale;
        pinchStartRotateRef.current = bannerRotate;
        setGestureNotice(`🤏 Cubit untuk ukuran, putar jari untuk rotasi spanduk kertas!`);
      } else if (target === 'mascot') {
        pinchStartValueRef.current = mascotSize;
        setGestureNotice(`🤏 Cubit / Rentangkan untuk ubah ukuran Maskot`);
      } else {
        pinchStartValueRef.current = quoteScale;
        setGestureNotice(`🤏 Cubit / Rentangkan untuk ubah ukuran Balon`);
      }
    }
  };

  const handlePointerMove = (target: 'banner' | 'mascot' | 'quote', e: React.PointerEvent) => {
    if (!activePointersRef.current.has(e.pointerId)) return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Handle Pinch & Twist (2 fingers gesture)
    if (activePointersRef.current.size >= 2 && pinchStartDistRef.current) {
      const points = Array.from(activePointersRef.current.values());
      const currentDist = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      const ratio = currentDist / pinchStartDistRef.current;

      if (target === 'banner') {
        // 1. Skala Ukuran
        const nextScale = Math.max(30, Math.min(260, Math.round(pinchStartValueRef.current * ratio)));
        setBannerScale(nextScale);

        // 2. Sudut Rotasi dari Putaran 2 Jari
        if (pinchStartAngleRef.current !== null) {
          const currentAngle = Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x) * (180 / Math.PI);
          const angleDelta = Math.round(currentAngle - pinchStartAngleRef.current);
          let newRot = pinchStartRotateRef.current + angleDelta;
          // Normalisasi antara -180 dan 180 derajat
          if (newRot > 180) newRot -= 360;
          if (newRot < -180) newRot += 360;
          setBannerRotate(newRot);
          setGestureNotice(`🤏 Skala: ${nextScale}% | 🔄 Rotasi: ${newRot}°`);
        } else {
          setGestureNotice(`🤏 Skala Spanduk: ${nextScale}%`);
        }
      } else if (target === 'mascot') {
        const nextSize = Math.max(90, Math.min(280, Math.round(pinchStartValueRef.current * ratio)));
        setMascotSize(nextSize);
        setGestureNotice(`🤏 Ukuran Maskot: ${nextSize}px`);
      } else {
        const nextScale = Math.max(40, Math.min(220, Math.round(pinchStartValueRef.current * ratio)));
        setQuoteScale(nextScale);
        setGestureNotice(`🤏 Skala Balon: ${nextScale}%`);
      }
      return;
    }

    // Handle Drag (1 finger / mouse)
    if (dragStartRef.current && activePointersRef.current.size === 1) {
      const deltaX = Math.round(e.clientX - dragStartRef.current.startX);
      const deltaY = Math.round(e.clientY - dragStartRef.current.startY);

      if (target === 'banner') {
        const nextX = Math.max(-280, Math.min(280, dragStartRef.current.originX + deltaX));
        const nextY = Math.max(-380, Math.min(380, dragStartRef.current.originY + deltaY));
        setBannerX(nextX);
        setBannerY(nextY);
        setGestureNotice(`Spanduk Kertas X: ${nextX}px | Y: ${nextY}px`);
      } else if (target === 'mascot') {
        const nextX = Math.max(-340, Math.min(140, dragStartRef.current.originX + deltaX));
        const nextY = Math.max(-220, Math.min(90, dragStartRef.current.originY + deltaY));
        setMascotX(nextX);
        setMascotY(nextY);
        setGestureNotice(`Maskot X: ${nextX}px | Y: ${nextY}px`);
      } else {
        const nextX = Math.max(-250, Math.min(250, dragStartRef.current.originX + deltaX));
        const nextY = Math.max(-250, Math.min(250, dragStartRef.current.originY + deltaY));
        setQuoteX(nextX);
        setQuoteY(nextY);
        setGestureNotice(`Balon X: ${nextX}px | Y: ${nextY}px`);
      }
    }
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent) => {
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size === 0) {
      setIsInteracting(false);
      dragStartRef.current = null;
      pinchStartDistRef.current = null;
      pinchStartAngleRef.current = null;
      setTimeout(() => setGestureNotice(''), 1500);
    } else if (activePointersRef.current.size === 1) {
      // Re-anchor single finger drag if one finger lifted
      const remainingPoint = Array.from(activePointersRef.current.values())[0];
      let originX = mascotX;
      let originY = mascotY;
      if (activeTarget === 'quote') {
        originX = quoteX;
        originY = quoteY;
      } else if (activeTarget === 'banner') {
        originX = bannerX;
        originY = bannerY;
      }
      dragStartRef.current = {
        startX: remainingPoint.x,
        startY: remainingPoint.y,
        originX,
        originY,
      };
      pinchStartDistRef.current = null;
      pinchStartAngleRef.current = null;
    }
  };

  // Mouse wheel zoom support for desktop
  const handleWheel = (target: 'banner' | 'mascot' | 'quote', e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = Math.sign(e.deltaY);
    if (target === 'banner') {
      setBannerScale((prev) => Math.max(30, Math.min(260, prev - delta * 5)));
    } else if (target === 'mascot') {
      setMascotSize((prev) => Math.max(90, Math.min(280, prev - delta * 5)));
    } else {
      setQuoteScale((prev) => Math.max(40, Math.min(220, prev - delta * 5)));
    }
  };

  // Dedicated Desktop / Mouse Rotation Knob Handler
  const handleRotationKnobDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Find center of banner element
    const rect = bannerContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const initialPointerAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const initialRot = bannerRotate;

    const onPointerMove = (evt: PointerEvent) => {
      const currentPointerAngle = Math.atan2(evt.clientY - centerY, evt.clientX - centerX) * (180 / Math.PI);
      const deltaAngle = Math.round(currentPointerAngle - initialPointerAngle);
      let newRot = Math.round(initialRot + deltaAngle);
      if (newRot > 180) newRot -= 360;
      if (newRot < -180) newRot += 360;
      setBannerRotate(newRot);
      setGestureNotice(`🔄 Rotasi Spanduk: ${newRot}°`);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      setTimeout(() => setGestureNotice(''), 1500);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Corner handle drag resize for mouse users
  const handleCornerResizeDown = (target: 'banner' | 'mascot' | 'quote', e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    let initialVal = mascotSize;
    if (target === 'quote') initialVal = quoteScale;
    if (target === 'banner') initialVal = bannerScale;

    const onPointerMove = (evt: PointerEvent) => {
      const deltaY = Math.round(evt.clientY - startY);
      if (target === 'banner') {
        const nextScale = Math.max(30, Math.min(260, initialVal + deltaY));
        setBannerScale(nextScale);
        setGestureNotice(`Skala Spanduk: ${nextScale}%`);
      } else if (target === 'mascot') {
        const nextSize = Math.max(90, Math.min(280, initialVal + deltaY));
        setMascotSize(nextSize);
        setGestureNotice(`Ukuran Maskot: ${nextSize}px`);
      } else {
        const nextScale = Math.max(40, Math.min(220, initialVal + deltaY));
        setQuoteScale(nextScale);
        setGestureNotice(`Skala Balon: ${nextScale}%`);
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      setTimeout(() => setGestureNotice(''), 1500);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleSaveAndLock = async () => {
    setIsSaving(true);
    try {
      await onSave(
        mascotX, 
        mascotY, 
        mascotSize, 
        quoteX, 
        quoteY, 
        quoteScale,
        bannerX,
        bannerY,
        bannerScale,
        bannerRotate,
        bannerOpacity,
        bannerEnabled
      );
      onClose();
    } catch (err) {
      console.error('Failed to save position & scale:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none overflow-hidden touch-none">
      
      {/* ======================================================== */}
      {/* 1. TOP FLOATING CONTROL BAR (STICKY HEADER)              */}
      {/* ======================================================== */}
      <header className="relative z-50 flex items-center justify-between px-3 sm:px-6 py-2 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-lg shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali</span>
          </button>
          
          <div className="hidden md:flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-extrabold text-blue-300">Editor Geser, Cubit & Putar</span>
          </div>
        </div>

        {/* Live Active Target Switcher: 3 Pill Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* TAB 1: SPANDUK KERTAS (LAYER 2) */}
          <button
            onClick={() => setActiveTarget('banner')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border whitespace-nowrap ${
              activeTarget === 'banner'
                ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-500/30'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <span>📜 Spanduk Kertas</span>
            <span className="text-[10px] opacity-90 font-mono">({bannerScale}% | {bannerRotate}°)</span>
          </button>

          {/* TAB 2: MASKOT */}
          <button
            onClick={() => setActiveTarget('mascot')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border whitespace-nowrap ${
              activeTarget === 'mascot'
                ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <span>🎭 Maskot</span>
            <span className="text-[10px] opacity-80 font-mono">({mascotSize}px)</span>
          </button>

          {/* TAB 3: BALON SAPAAN */}
          <button
            onClick={() => setActiveTarget('quote')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border whitespace-nowrap ${
              activeTarget === 'quote'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/30'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <span>💬 Balon</span>
            <span className="text-[10px] opacity-80 font-mono">({quoteScale}%)</span>
          </button>
        </div>

        {/* Actions Right */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveAndLock}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 hover:brightness-110 text-white font-black text-xs shadow-md shadow-emerald-500/30 cursor-pointer active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>{isSaving ? 'Menyimpan...' : '✓ Simpan & Kunci'}</span>
          </button>
        </div>
      </header>

      {/* Floating Gesture Guide Notification */}
      {gestureNotice && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-400/50 shadow-2xl text-amber-200 text-xs font-bold flex items-center gap-2 backdrop-blur-md animate-fade-in pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>{gestureNotice}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. REAL HOME SCREEN VIEWPORT (PERSIS 100% LAYAR ASLI)     */}
      {/* ======================================================== */}
      <div className="relative flex-1 w-full min-h-0 flex flex-col justify-between overflow-hidden">
        
        {/* LAYER 1: Background Wallpaper Asli */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <img
            src={bgConfig.imageUrl || "/src/assets/images/jakarta_monas_bg_1792081781159.jpg"}
            alt="Wallpaper Background"
            className="w-full h-full object-cover object-[72%_center] sm:object-center filter brightness-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-sky-50/20 via-transparent to-slate-900/15 pointer-events-none" />
        </div>

        {/* LAYER 2: SPANDUK SOBEKAN KERTAS (INTERAKTIF GESER, CUBIT & PUTAR DUA JARI) */}
        {bannerEnabled && (
          <div className="absolute inset-0 z-10 flex items-center justify-center overflow-visible pointer-events-none">
            <div
              ref={bannerContainerRef}
              onPointerDown={(e) => handlePointerDown('banner', e)}
              onPointerMove={(e) => handlePointerMove('banner', e)}
              onPointerUp={handlePointerUpOrCancel}
              onPointerCancel={handlePointerUpOrCancel}
              onWheel={(e) => handleWheel('banner', e)}
              className="relative pointer-events-auto select-none cursor-grab active:cursor-grabbing group transition-transform duration-75"
              style={{
                transform: `translate(${bannerX}px, ${bannerY}px) scale(${bannerScale / 100}) rotate(${bannerRotate}deg)`,
                transformOrigin: 'center center',
                opacity: bannerOpacity / 100,
              }}
              title="Sentuh & geser spanduk kertas, cubit 2 jari untuk ukuran, dan putar 2 jari untuk rotasi kemiringan!"
            >
              {/* Active Selection Ring, Rotation Handle & Controls untuk Spanduk Kertas */}
              {activeTarget === 'banner' && (
                <div className="absolute -inset-2.5 border-2 border-dashed border-amber-400/90 rounded-2xl pointer-events-none z-50 bg-amber-500/5 animate-pulse">
                  
                  {/* Top Badge Info */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-md bg-amber-600 text-white text-[9px] font-black shadow-md whitespace-nowrap flex items-center gap-1.5 pointer-events-none">
                    <span>📜 Spanduk ({bannerScale}% | {bannerRotate}°)</span>
                  </div>

                  {/* Top Center Rotation Knob Handle (Tarik Memutar dengan Mouse / Jari) */}
                  <div
                    onPointerDown={handleRotationKnobDown}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-500 hover:bg-amber-400 border-2 border-white shadow-xl pointer-events-auto cursor-grab active:cursor-grabbing flex items-center justify-center text-white text-[11px] font-bold transition-transform active:scale-110"
                    title="Tarik tombol ini memutar untuk mengatur kemiringan spanduk kertas"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </div>

                  {/* Corner Resize Handle */}
                  <div
                    onPointerDown={(e) => handleCornerResizeDown('banner', e)}
                    className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-amber-500 border-2 border-white shadow-lg pointer-events-auto cursor-nwse-resize flex items-center justify-center text-white text-[8px] font-bold"
                    title="Tarik sudut untuk membesarkan/mengecilkan spanduk"
                  >
                    ⤡
                  </div>
                </div>
              )}

              {/* Visual Spanduk Kertas (Kustom atau Bawaan) */}
              <PaperBannerOrnament
                config={{
                  ...initialBanner,
                  enabled: true,
                  offsetX: 0,
                  offsetY: 0,
                  scale: 100,
                  rotate: 0,
                  opacity: 100
                }}
                isInteractive={false}
              />
            </div>
          </div>
        )}

        {/* Header Bersih Layar Home */}
        <div className="relative z-20 flex items-center justify-between px-4 pt-3 pb-1 select-none pointer-events-none">
          <span className="font-serif text-[38px] sm:text-[46px] font-black tracking-tight text-[#0f2942] leading-none select-none drop-shadow-sm">SAE</span>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold shadow-xs">
              Install App
            </span>
            <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-800 text-xs shadow-xs">
              🔔
            </div>
          </div>
        </div>

        {/* Editorial Greeting Hero ("Hai, kamu!") */}
        <div className="relative z-20 px-4 pt-20 sm:pt-28 pb-2 select-none pointer-events-none max-w-[280px] sm:max-w-[340px]">
          <h2 className="font-serif text-[32px] sm:text-[38px] font-black text-[#0f2942] leading-[1.05] tracking-tight drop-shadow-2xs">
            Hai, kamu!
          </h2>
          <p className="font-sans text-[13px] sm:text-[14px] font-bold text-[#0f2942]/90 leading-snug tracking-tight mt-2 mb-3.5">
            Yuk mulai hari ini dengan outfit yang bikin kamu lebih percaya diri.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0c377c] via-[#1452b4] to-[#2563eb] text-white shadow-md">
            <span className="text-[12.5px] font-extrabold whitespace-nowrap">Mulai Analisis</span>
            <span>→</span>
          </div>
        </div>

        {/* PANDUAN TITIK PAS DI ATAS PROFILE */}
        {showGuidelines && (
          <div className="absolute right-4 bottom-20 w-32 h-44 border-2 border-dashed border-cyan-400/80 bg-cyan-400/10 rounded-3xl pointer-events-none z-20 flex flex-col items-center justify-center p-2">
            <span className="text-[10px] font-black text-cyan-200 text-center leading-tight bg-slate-900/90 px-2 py-1 rounded-lg border border-cyan-400/30 shadow-md">
              🎯 Area Pas Profile
            </span>
          </div>
        )}

        {/* ======================================================== */}
        {/* AREA MASKOT & BALON: DUAL INTERAKTIF GESER & CUBIT       */}
        {/* ======================================================== */}
        <div className="relative w-full flex items-end justify-end z-20 pb-0.5 mt-auto pointer-events-none">
          <div className="relative flex items-end justify-end shrink-0 z-30 pb-0.5">
            
            {/* KALIMAT SAPAAN MASKOT (INTERAKTIF GESER & CUBIT / SCROLL) */}
            {showQuote && (
              <div 
                onPointerDown={(e) => handlePointerDown('quote', e)}
                onPointerMove={(e) => handlePointerMove('quote', e)}
                onPointerUp={handlePointerUpOrCancel}
                onPointerCancel={handlePointerUpOrCancel}
                onWheel={(e) => handleWheel('quote', e)}
                style={{
                  transform: `translate(${quoteX}px, ${quoteY}px) scale(${quoteScale / 100})`,
                  transformOrigin: quotePosition === 'above' ? 'bottom right' : 'right center',
                }}
                className={`pointer-events-auto shrink-0 select-none cursor-grab active:cursor-grabbing transition-transform duration-75 relative group ${
                  quotePosition === 'above'
                    ? 'absolute right-2 bottom-[102%] mb-2 z-40'
                    : 'relative mr-2 mb-4 z-30'
                }`}
                title="Sentuh & geser balon sapaan, atau cubit dengan 2 jari untuk atur besar-kecil!"
              >
                {/* Active Selection Ring untuk Balon */}
                {activeTarget === 'quote' && (
                  <div className="absolute -inset-2 border-2 border-dashed border-indigo-400/90 rounded-2xl pointer-events-none z-50 bg-indigo-500/5 animate-pulse">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[9px] font-black shadow-md whitespace-nowrap flex items-center gap-1">
                      <span>💬 Balon ({quoteScale}%)</span>
                    </div>

                    {/* Corner Resize Handle for Mouse/Touch */}
                    <div
                      onPointerDown={(e) => handleCornerResizeDown('quote', e)}
                      className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-indigo-600 border-2 border-white shadow-lg pointer-events-auto cursor-nwse-resize flex items-center justify-center text-white text-[8px] font-bold"
                      title="Tarik sudut untuk membesarkan/mengecilkan balon"
                    >
                      ⤡
                    </div>
                  </div>
                )}

                <MascotSpeechBubble
                  text={companionQuote || 'Hai! Aku SAE di sini! ♡'}
                  shape={quoteShape || 'watercolor_bubble'}
                  position={quotePosition || 'beside'}
                  customImageUrl={quoteCustomImageUrl}
                  showText={quoteShowText !== false}
                  scale="md"
                />
              </div>
            )}

            {/* ELEMEN MASKOT CHIBI (INTERAKTIF GESER & CUBIT DENGAN JARI / MOUSE) */}
            <div
              onPointerDown={(e) => handlePointerDown('mascot', e)}
              onPointerMove={(e) => handlePointerMove('mascot', e)}
              onPointerUp={handlePointerUpOrCancel}
              onPointerCancel={handlePointerUpOrCancel}
              onWheel={(e) => handleWheel('mascot', e)}
              style={{
                transform: `translate(${mascotX}px, ${mascotY}px)`,
              }}
              className="relative shrink-0 cursor-grab active:cursor-grabbing transition-transform duration-75 z-40 pointer-events-auto group"
              title="Sentuh & geser maskot, atau cubit dengan 2 jari untuk atur besar-kecil!"
            >
              {/* Active Selection Ring untuk Maskot */}
              {activeTarget === 'mascot' && (
                <div className="absolute -inset-1.5 border-2 border-dashed border-cyan-400/90 rounded-2xl pointer-events-none z-50 bg-cyan-500/5">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-black shadow-md whitespace-nowrap flex items-center gap-1">
                    <span>🎭 Maskot ({mascotSize}px)</span>
                  </div>

                  {/* Corner Resize Handle for Mouse/Touch */}
                  <div
                    onPointerDown={(e) => handleCornerResizeDown('mascot', e)}
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 border-2 border-white shadow-lg pointer-events-auto cursor-nwse-resize flex items-center justify-center text-white text-[8px] font-bold"
                    title="Tarik sudut untuk membesarkan/mengecilkan maskot"
                  >
                    ⤡
                  </div>
                </div>
              )}

              {/* Ground Shadow */}
              <div 
                style={{ width: `${Math.round(mascotSize * 0.65)}px` }}
                className="absolute bottom-1 left-1/2 -translate-x-1/2 h-3 bg-slate-950/30 rounded-full blur-[3px] pointer-events-none" 
              />

              {/* Maskot Cutout Asli */}
              <img
                src={imageUrl || "/src/assets/images/sae_chibi_girl_cutout.png"}
                alt="Mascot SAE"
                style={{
                  height: `${mascotSize}px`,
                  maxHeight: `${mascotSize}px`,
                }}
                className="w-auto object-contain drop-shadow-[0_10px_20px_rgba(15,23,42,0.35)] select-none pointer-events-none transition-all duration-75"
              />
            </div>

          </div>
        </div>

        {/* Real Bottom Navigation Bar (Sculpted Wave Dock) */}
        <div className="relative z-30 px-3 pb-2 pt-2 shrink-0 select-none pointer-events-none">
          <nav className="relative w-full flex items-center justify-between h-[52px] sm:h-[55px] rounded-[30px] bg-gradient-to-b from-white/95 via-white/85 to-white/90 backdrop-blur-2xl border border-white shadow-xl px-2">
            <div className="flex flex-col items-center flex-1 py-1 text-blue-600 font-bold text-[9.5px]">
              <span>🏠</span>
              <span>Home</span>
            </div>
            <div className="flex flex-col items-center flex-1 py-1 text-slate-400 font-bold text-[9.5px]">
              <span>🛍️</span>
              <span>Toko</span>
            </div>
            <div className="flex flex-col items-center flex-1 -mt-4 z-40">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 text-white flex items-center justify-center border-2 border-white shadow-lg">
                📸
              </div>
            </div>
            <div className="flex flex-col items-center flex-1 py-1 text-slate-400 font-bold text-[9.5px]">
              <span>📊</span>
              <span>Results</span>
            </div>
            <div className="flex flex-col items-center flex-1 py-1 text-blue-600 font-extrabold text-[9.5px]">
              <span>👤</span>
              <span>Profile</span>
            </div>
          </nav>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. FLOATING PRECISION CONTROL DOCK (BOTTOM DOCK)          */}
      {/* ======================================================== */}
      <aside className="relative z-50 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        
        {/* Preset & Reset Cepat */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {activeTarget === 'banner' ? (
            <>
              {/* Toggle On/Off Spanduk */}
              <button
                onClick={() => setBannerEnabled((prev) => !prev)}
                className={`px-2 py-1 rounded-lg text-xs font-bold border cursor-pointer active:scale-95 whitespace-nowrap ${
                  bannerEnabled 
                    ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-rose-500/40' 
                    : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/40'
                }`}
                title="Sembunyikan atau tampilkan spanduk"
              >
                {bannerEnabled ? '🧹 Matikan Spanduk' : '👁️ Tampilkan Spanduk'}
              </button>

              {/* Preset Pojok Estetik */}
              <button
                onClick={() => {
                  setBannerX(50);
                  setBannerY(-120);
                  setBannerScale(85);
                  setBannerRotate(-3);
                  setBannerEnabled(true);
                  setGestureNotice('✨ Preset: Pojok Estetik Terpasang!');
                }}
                className="px-2 py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900 text-amber-200 text-xs font-bold border border-amber-500/40 cursor-pointer active:scale-95 whitespace-nowrap"
                title="Posisikan rapi di pojok tanpa menutupi teks"
              >
                ✨ Pojok Rapi
              </button>

              {/* Preset Belakang Maskot */}
              <button
                onClick={() => {
                  setBannerX(40);
                  setBannerY(150);
                  setBannerScale(90);
                  setBannerRotate(2);
                  setBannerEnabled(true);
                  setGestureNotice('🧸 Preset: Belakang Maskot Terpasang!');
                }}
                className="px-2 py-1 rounded-lg bg-blue-950/70 hover:bg-blue-900 text-blue-200 text-xs font-bold border border-blue-500/40 cursor-pointer active:scale-95 whitespace-nowrap"
                title="Posisikan sebagai alas di belakang maskot"
              >
                🧸 Belakang Maskot
              </button>

              {/* Tombol Rotasi Cepat untuk Spanduk Kertas */}
              <button
                onClick={() => setBannerRotate(0)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-amber-500/30 cursor-pointer active:scale-95 whitespace-nowrap"
                title="Luruskan Spanduk (0 Derajat)"
              >
                📐 0°
              </button>
              <button
                onClick={() => setBannerRotate((prev) => prev - 5)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer active:scale-95"
                title="Putar Kiri 5 Derajat"
              >
                ↺ -5°
              </button>
              <button
                onClick={() => setBannerRotate((prev) => prev + 5)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer active:scale-95"
                title="Putar Kanan 5 Derajat"
              >
                ↻ +5°
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setMascotX(0);
                  setMascotY(-25);
                  setQuoteX(0);
                  setQuoteY(0);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-bold border border-blue-500/30 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                📍 Posisi Pas di Atas Profile
              </button>

              <button
                onClick={() => {
                  if (activeTarget === 'mascot') {
                    setMascotSize(170);
                    setMascotX(0);
                    setMascotY(0);
                  } else {
                    setQuoteScale(100);
                    setQuoteX(0);
                    setQuoteY(0);
                  }
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 cursor-pointer active:scale-95 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Reset {activeTarget === 'mascot' ? 'Maskot' : 'Balon'}</span>
              </button>
            </>
          )}
        </div>

        {/* Zoom In / Out Buttons untuk Mouse & Mobile */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 pl-1">
            {activeTarget === 'banner' ? 'Spanduk:' : activeTarget === 'mascot' ? 'Maskot:' : 'Balon:'}
          </span>

          <button
            onClick={() => {
              if (activeTarget === 'banner') {
                setBannerScale((prev) => Math.max(30, prev - 10));
              } else if (activeTarget === 'mascot') {
                setMascotSize((prev) => Math.max(90, prev - 10));
              } else {
                setQuoteScale((prev) => Math.max(40, prev - 10));
              }
            }}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center cursor-pointer active:scale-95"
            title="Kecilkan"
          >
            -
          </button>

          <span className="font-mono text-xs font-black text-amber-300 min-w-[55px] text-center">
            {activeTarget === 'banner' ? `${bannerScale}%` : activeTarget === 'mascot' ? `${mascotSize}px` : `${quoteScale}%`}
          </span>

          <button
            onClick={() => {
              if (activeTarget === 'banner') {
                setBannerScale((prev) => Math.min(260, prev + 10));
              } else if (activeTarget === 'mascot') {
                setMascotSize((prev) => Math.min(280, prev + 10));
              } else {
                setQuoteScale((prev) => Math.min(220, prev + 10));
              }
            }}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center cursor-pointer active:scale-95"
            title="Besarkan"
          >
            +
          </button>
        </div>

        {/* Panduan Jari */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[10px]">Gesture:</span>
          <span>1 Jari = Geser | 2 Jari = Cubit & Putar Rotasi</span>
        </div>

      </aside>

    </div>
  );
};
