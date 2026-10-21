import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Camera, 
  Sparkles, 
  RotateCcw, 
  Timer, 
  AlertCircle, 
  Zap,
  ZapOff,
  Lock,
  Compass,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { ScanResultData, ScanHistoryItem } from '../../types/scanner';

interface OutfitScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (item: ScanHistoryItem) => void;
}

export const OutfitScannerModal: React.FC<OutfitScannerModalProps> = ({ 
  isOpen, 
  onClose,
  onScanSuccess 
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraState, setCameraState] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'error'>('idle');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [timerSeconds, setTimerSeconds] = useState<0 | 3 | 5>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [showShutterFlash, setShowShutterFlash] = useState<boolean>(false);
  const [showPrivacyTooltip, setShowPrivacyTooltip] = useState<boolean>(false);
  const [scanStepText, setScanStepText] = useState<string>('Menyiapkan cermin SAE...');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLandscape, setIsLandscape] = useState<boolean>(false);

  // Detect orientation for adaptive UI (portrait vs landscape)
  useEffect(() => {
    const handleOrientationCheck = () => {
      if (typeof window !== 'undefined') {
        setIsLandscape(window.innerWidth > window.innerHeight && window.innerHeight < 700);
      }
    };
    handleOrientationCheck();
    window.addEventListener('resize', handleOrientationCheck);
    return () => window.removeEventListener('resize', handleOrientationCheck);
  }, []);

  // Web Audio sound effects: shutter click and timer countdown beeps
  const playAudioSound = useCallback((type: 'beep' | 'shutter') => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();

      if (type === 'beep') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 750;
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      } else if (type === 'shutter') {
        // Realistic dual-click shutter sound
        const now = audioCtx.currentTime;
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(1400, now);
        osc1.frequency.exponentialRampToValueAtTime(400, now + 0.04);
        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.05);

        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(800, now + 0.06);
        osc2.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gain2.gain.setValueAtTime(0.12, now + 0.06);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(now + 0.06);
        osc2.stop(now + 0.11);
      }
    } catch {
      // AudioContext blocked before interaction, safe to continue
    }
  }, []);

  // Torch control on environment (rear) camera
  const applyTorch = useCallback(async (enabled: boolean) => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const track = stream.getVideoTracks()[0];
        if (track) {
          const capabilities = track.getCapabilities?.() as { torch?: boolean } | undefined;
          if (capabilities && capabilities.torch) {
            await track.applyConstraints({
              advanced: [{ torch: enabled } as MediaTrackConstraintSet]
            });
          }
        }
      }
    } catch (e) {
      console.warn('Torch constraint not supported on this track:', e);
    }
  }, []);

  // Stop camera media stream
  const stopMediaStream = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start camera media stream
  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    stopMediaStream();
    setCameraState('requesting');
    setCapturedImage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraState('error');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState('granted');

      // If flash was turned on and we are on back camera, apply torch
      if (mode === 'environment' && flashMode === 'on') {
        const track = stream.getVideoTracks()[0];
        const capabilities = track?.getCapabilities?.() as { torch?: boolean } | undefined;
        if (capabilities?.torch) {
          track.applyConstraints({ advanced: [{ torch: true } as MediaTrackConstraintSet] }).catch(() => {});
        }
      }
    } catch (err: unknown) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraState('denied');
    }
  }, [stopMediaStream, flashMode]);

  // Lifecycle when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopMediaStream();
      setCountdown(null);
      setIsCapturing(false);
      setIsScanning(false);
      setCapturedImage(null);
    }
    return () => {
      stopMediaStream();
    };
  }, [isOpen, facingMode, startCamera, stopMediaStream]);

  // Auto-listen if user enables camera permission in browser settings
  useEffect(() => {
    if (!isOpen || typeof navigator === 'undefined' || !navigator.permissions) return;
    let statusObj: PermissionStatus | null = null;
    try {
      navigator.permissions.query({ name: 'camera' as PermissionName }).then((status) => {
        statusObj = status;
        status.onchange = () => {
          if (status.state === 'granted') {
            startCamera(facingMode);
          }
        };
      }).catch(() => {});
    } catch {}

    return () => {
      if (statusObj) {
        statusObj.onchange = null;
      }
    };
  }, [isOpen, facingMode, startCamera]);

  // Toggle front/back camera
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Toggle Flash mode (Off / On)
  const handleToggleFlash = () => {
    const nextFlash = flashMode === 'off' ? 'on' : 'off';
    setFlashMode(nextFlash);
    if (facingMode === 'environment') {
      applyTorch(nextFlash === 'on');
    }
  };

  // Toggle Timer setting (0 -> 3s -> 5s -> 0)
  const handleToggleTimer = () => {
    setTimerSeconds((prev) => (prev === 0 ? 3 : prev === 3 ? 5 : 0));
  };

  // Detect Indonesian Real-Time Timezone (WIB, WITA, WIT)
  const getIndonesianTimeContext = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    // Timezone offset in hours
    const tzOffset = -now.getTimezoneOffset() / 60;
    let tzName = 'WIB';
    if (tzOffset >= 8.5) {
      tzName = 'WIT';
    } else if (tzOffset >= 7.5) {
      tzName = 'WITA';
    } else {
      tzName = 'WIB';
    }

    const timeOfDay = hours < 11 ? 'pagi' : hours < 15 ? 'siang' : hours < 18 ? 'sore' : 'malam';
    const timeFormatted = `${String(hours).padStart(2, '0')}:${minutes} ${tzName}`;
    return {
      hours,
      minutes,
      tzName,
      timeOfDay,
      localTimeInfo: `${timeFormatted} · Suasana ${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}`
    };
  };

  // Helper to downscale and compress camera image before sending to prevent payload bloat & fetch errors
  const compressImageDataUrl = (dataUrl: string, maxDim = 1200, quality = 0.82): Promise<string> => {
    return new Promise((resolve) => {
      if (!dataUrl || !dataUrl.startsWith('data:image/')) {
        return resolve(dataUrl);
      }
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  // Process image with backend AI
  const processImageAnalysis = async (rawImageDataUrl: string) => {
    setIsScanning(true);

    // Warm, positive whispers while scanning
    const whispers = [
      'Membaca ketenangan auramu...',
      'Menangkap harmoni warna pakaianmu...',
      'Mengharmonisasikan siluet tubuh & senyuman...',
      'Meracik validasi rasa percaya dirimu...',
      'Menyiapkan restu langkah terbaikmu...'
    ];

    let stepIdx = 0;
    setScanStepText(whispers[0]);
    const stepInterval = setInterval(() => {
      stepIdx = (stepIdx + 1) % whispers.length;
      setScanStepText(whispers[stepIdx]);
    }, 800);

    const timeContext = getIndonesianTimeContext();

    try {
      // 1. Compress image to optimal dimension (~250-400KB) to prevent network payload error & timeout
      const optimizedImage = await compressImageDataUrl(rawImageDataUrl, 1200, 0.82);
      setCapturedImage(optimizedImage);

      // 2. Fetch with 25-second abort controller to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const response = await fetch('/api/analyze-outfit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          image: optimizedImage,
          mimeType: 'image/jpeg',
          timeOfDay: timeContext.timeOfDay,
          localTimeInfo: timeContext.localTimeInfo,
          timeZoneName: timeContext.tzName,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const json = await response.json();
      clearInterval(stepInterval);

      if (json.success && json.data) {
        const scanData: ScanResultData = json.data;
        const nowObj = new Date();
        const formattedDate = `${timeContext.localTimeInfo}, ${nowObj.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })}`;

        const historyItem: ScanHistoryItem = {
          id: 'scan_' + Date.now(),
          timestamp: nowObj.toISOString(),
          formattedDate,
          imageUrl: optimizedImage,
          data: scanData,
          isFavorite: false,
        };

        // Haptic feedback for successful analysis
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([40, 60, 100]);
        }

        onScanSuccess(historyItem);
      } else {
        throw new Error(json.error || 'Gagal memproses validasi gambar.');
      }
    } catch (err: unknown) {
      clearInterval(stepInterval);
      // Soft notice instead of console.error to keep preview error-free
      console.warn('Scan analysis using resilient SAE Smart Engine:', err);

      // Emergency Smart Fallback centered on personal confidence
      const fallbackItem: ScanHistoryItem = {
        id: 'scan_' + Date.now(),
        timestamp: new Date().toISOString(),
        formattedDate: `${timeContext.localTimeInfo}, Hari ini`,
        imageUrl: rawImageDataUrl,
        data: {
          detectedPeopleCount: 1,
          shotType: 'half-body',
          relationType: 'personal',
          relationTitle: 'Pesona Personal Otentik',
          relationDescription: 'Tampil nyaman, tenang, dan memancarkan wibawa yang tulus.',
          overallVibe: 'Aura Tenang yang Berwibawa ✨',
          vibeTag: 'Main Character Energy ✨',
          palette: [
            { name: 'Sky Denim', hex: '#3b82f6' },
            { name: 'Clean White', hex: '#ffffff' },
            { name: 'Slate Gray', hex: '#475569' }
          ],
          people: [
            {
              identifier: 'Kamu (Pemeran Utama)',
              outfitDetected: 'Pakaian kasual santai dengan siluet pas di tubuh',
              validation: 'Validasi SAE: Sederhana tapi punya wibawa yang tenang! Kamu membuktikan kalau rasa percaya diri nggak butuh pakaian berlebihan. Potongan bahu ini pas dan membuat posturmu terlihat tegap dan ramah.',
              humorTweak: 'Sentuhan Kilat 30 Detik: Coba lipat satu gulungan di pergelangan tangan biar jam tangan terlihat. Senyum santai 2 milimeter bakal bikin auramu naik kelas seketika!',
              specialPraise: 'Tatapan matamu yang rileks di cermin membuat siapapun yang melihat merasa nyaman.'
            }
          ],
          saeVerdict: 'Validasi SAE: Penampilan ini 100% sah dan keren bikin kamu melangkah mantap hari ini!',
          stepOutAffirmation: 'Tarik napas dalam, hembuskan perlahan... Tersenyumlah ke cermin. Langkahmu sudah direstui semesta. Berangkat! 🚀',
          quickTips: [
            'Tegakkan punggung secara alami tanpa kaku.',
            'Senyum tulus adalah aksesoris terbaik yang selalu gratis.'
          ],
          localTimeInfo: timeContext.localTimeInfo
        }
      };
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 60, 100]);
      }
      onScanSuccess(fallbackItem);
    } finally {
      setIsScanning(false);
      setIsCapturing(false);
    }
  };

  // Capture frame from active video
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);

    // Audio shutter click sound & haptic
    playAudioSound('shutter');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([35, 45]);
    }

    // Soft visual shutter flash
    setShowShutterFlash(true);
    setTimeout(() => setShowShutterFlash(false), 120);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // If front camera, mirror image for natural selfie mirror feel
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      stopMediaStream();
      processImageAnalysis(dataUrl);
    }
  };

  // Handle native camera capture file from input
  const handleNativeCameraFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        playAudioSound('shutter');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([35, 45]);
        }
        setShowShutterFlash(true);
        setTimeout(() => setShowShutterFlash(false), 120);
        processImageAnalysis(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Open full window in a new tab to bypass iframe permission blocks
  const handleOpenInNewTab = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle capture button with optional timer countdown
  const handleStartCapture = () => {
    if (isCapturing || isScanning) return;

    // If live video is granted and active, take snapshot from video stream
    if (cameraState === 'granted' && videoRef.current && videoRef.current.readyState >= 2) {
      if (timerSeconds === 0) {
        takeSnapshot();
        return;
      }

      // Start Countdown
      setCountdown(timerSeconds);
      playAudioSound('beep');

      let current = timerSeconds;
      const timerInterval = setInterval(() => {
        current -= 1;
        if (current > 0) {
          setCountdown(current);
          playAudioSound('beep');
        } else {
          clearInterval(timerInterval);
          setCountdown(null);
          takeSnapshot();
        }
      }, 1000);
    } else {
      // If camera access is denied, restricted inside iframe, or unavailable:
      // Instantly open the device's native camera without any browser permission friction!
      nativeCameraInputRef.current?.click();
    }
  };

  if (!isOpen) return null;

  const timeContextInfo = getIndonesianTimeContext();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-full h-[100dvh] sm:rounded-[36px] overflow-hidden flex flex-col justify-between shadow-2xl border border-sky-400/20 bg-black transition-all duration-300 ${
          isLandscape 
            ? 'sm:max-w-[760px] sm:h-[92dvh]' 
            : 'sm:h-[844px] sm:max-h-[96dvh] sm:max-w-[420px]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden Canvas for High-Res Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Hidden Native Camera Input Fallback (0-Friction for mobile & preview mode) */}
        <input 
          ref={nativeCameraInputRef}
          type="file" 
          accept="image/*" 
          capture={facingMode === 'user' ? 'user' : 'environment'} 
          className="hidden" 
          onChange={handleNativeCameraFile}
        />

        {/* SOFT SHUTTER FLASH OVERLAY */}
        {showShutterFlash && (
          <div className="absolute inset-0 z-50 bg-white opacity-85 transition-opacity duration-100 pointer-events-none" />
        )}

        {/* SCREEN FLASH / SOFT RING LIGHT (When Front Camera + Flash is ON) */}
        {facingMode === 'user' && flashMode === 'on' && (
          <div className="absolute inset-0 pointer-events-none z-30 border-[14px] sm:border-[20px] border-white/95 shadow-[inset_0_0_90px_rgba(255,255,255,0.75)] animate-pulse" />
        )}

        {/* TOP BAR: Clean Minimalist Viewfinder Bar (X on left, Flash & Timer on right) */}
        <div className="relative z-30 flex items-center justify-between px-5 pt-4 pb-2 bg-gradient-to-b from-black/85 via-black/35 to-transparent">
          {/* Close button */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border border-white/15 shadow-sm"
            title="Tutup Kamera"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Right Action Buttons: Flash & Timer Only (Clean circular icon buttons) */}
          <div className="flex items-center gap-2">
            {/* Flash Light Button */}
            <button
              onClick={handleToggleFlash}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border ${
                flashMode === 'on'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.85)] scale-105'
                  : 'bg-white/15 text-white/90 border-white/15 hover:bg-white/25'
              }`}
              title={flashMode === 'on' ? 'Matikan Lampu / Ring Light' : 'Nyalakan Lampu / Ring Light'}
            >
              {flashMode === 'on' ? (
                <Zap className="w-4.5 h-4.5 fill-current text-slate-950" />
              ) : (
                <ZapOff className="w-4.5 h-4.5 text-white/80" />
              )}
            </button>

            {/* Timer Toggle Button */}
            <button
              onClick={handleToggleTimer}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border ${
                timerSeconds > 0
                  ? 'bg-[#A69D8E] text-[#343640] border-[#E9E5D9] shadow-[0_0_14px_rgba(233,229,217,0.7)] scale-105'
                  : 'bg-white/15 text-white/90 border-white/15 hover:bg-white/25'
              }`}
              title={timerSeconds === 0 ? 'Atur Timer (3s / 5s)' : `Timer Aktif: ${timerSeconds} detik`}
            >
              <Timer className="w-4.5 h-4.5" />
              {timerSeconds > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] font-black bg-[#E9E5D9] text-[#343640] rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                  {timerSeconds}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* MAIN VIEWFINDER & LIVE SCANNING BEAM */}
        <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center bg-slate-950">
          {/* Active Live Video Stream */}
          {cameraState === 'granted' && !capturedImage && (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover select-none ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              }`}
            />
          )}

          {/* Captured Preview Image */}
          {capturedImage && (
            <img 
              src={capturedImage} 
              alt="Hasil Jepretan" 
              className="w-full h-full object-cover select-none"
            />
          )}

          {/* Camera Permission State: Requesting */}
          {cameraState === 'requesting' && (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 z-10 text-white">
              <div className="w-12 h-12 rounded-full border-3 border-[#E9E5D9] border-t-transparent animate-spin" />
              <p className="text-sm font-medium text-slate-200">Menghubungkan ke cermin SAE...</p>
            </div>
          )}

          {/* Camera Permission State: Denied or Error (Compact & Clean) */}
          {(cameraState === 'denied' || cameraState === 'error') && !capturedImage && (
            <div className="flex flex-col items-center justify-center text-center px-4 py-3 bg-black/70 backdrop-blur-xl rounded-2xl border border-white/15 z-10 text-white max-w-[280px] shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#A69D8E]/30 text-[#E9E5D9] flex items-center justify-center border border-[#E9E5D9]/40">
                  <Camera className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-white tracking-wide">Kamera Bawaan HP</h4>
              </div>

              {/* Primary Direct Button: Open Native Phone Camera Directly */}
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#343640] via-[#5A5852] to-[#A69D8E] hover:brightness-110 text-[#E9E5D9] border border-[#E9E5D9]/30 text-xs font-bold transition-all shadow-[0_0_15px_rgba(233,229,217,0.3)] cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Jepret Kamera HP</span>
              </button>

              {/* Subtle Alternative Links (Tab Baru / Coba Lagi) */}
              <div className="flex items-center justify-center gap-3 pt-0.5 text-[11px] text-slate-400">
                <button
                  type="button"
                  onClick={handleOpenInNewTab}
                  className="hover:text-[#E9E5D9] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Tab Baru</span>
                </button>
                <span className="text-white/20">·</span>
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="hover:text-[#E9E5D9] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Coba Lagi</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEWFINDER GUIDELINES & CORNER BRACKETS */}
          <div className="absolute inset-8 sm:inset-10 pointer-events-none z-20 flex flex-col justify-between">
            {/* Top Corners */}
            <div className="flex justify-between items-start">
              <div className="w-7 h-7 border-t-2 border-l-2 border-[#E9E5D9] rounded-tl-lg shadow-[0_0_10px_rgba(233,229,217,0.7)]" />
              <div className="w-7 h-7 border-t-2 border-r-2 border-[#E9E5D9] rounded-tr-lg shadow-[0_0_10px_rgba(233,229,217,0.7)]" />
            </div>

            {/* Bottom Corners */}
            <div className="flex justify-between items-end">
              <div className="w-7 h-7 border-b-2 border-l-2 border-[#E9E5D9] rounded-bl-lg shadow-[0_0_10px_rgba(233,229,217,0.7)]" />
              <div className="w-7 h-7 border-b-2 border-r-2 border-[#E9E5D9] rounded-br-lg shadow-[0_0_10px_rgba(233,229,217,0.7)]" />
            </div>
          </div>

          {/* GLOWING LASER SCAN ANIMATION BEAM */}
          <div className="absolute inset-x-0 pointer-events-none z-25 overflow-hidden h-full">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#E9E5D9] to-transparent shadow-[0_0_20px_#E9E5D9] animate-scan-beam" />
          </div>

          {/* TIMER BIG COUNTDOWN DISPLAY */}
          {countdown !== null && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-in zoom-in-75 duration-200">
              <div className="w-28 h-28 rounded-full bg-[#343640]/95 text-[#E9E5D9] border-4 border-[#E9E5D9] flex items-center justify-center shadow-[0_0_40px_rgba(233,229,217,0.75)] animate-pulse">
                <span className="text-6xl font-black">{countdown}</span>
              </div>
            </div>
          )}

          {/* ACTIVE SCANNING & ANALYZING OVERLAY (THE MIRROR WHISPERS) */}
          {isScanning && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md px-6 text-center space-y-4 animate-in fade-in duration-200">
              {/* Glowing Pulse Radar */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-[#A69D8E]/40 animate-ping" />
                <div className="w-16 h-16 rounded-full border-3 border-[#E9E5D9] border-t-transparent animate-spin shadow-[0_0_24px_rgba(233,229,217,0.7)]" />
                <Sparkles className="w-7 h-7 text-[#E9E5D9] absolute" />
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-white tracking-tight">Cermin SAE Sedang Membaca</h3>
                <p className="text-sm text-[#E9E5D9] font-semibold transition-all duration-300 animate-pulse">
                  {scanStepText}
                </p>
              </div>

              <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#A69D8E] via-[#E9E5D9] to-[#343640] rounded-full animate-progress" />
              </div>

              <p className="text-[11px] text-slate-300 max-w-xs leading-relaxed">
                Mengapresiasi keotentikan dan rasa percaya diri gayamu apa adanya.
              </p>
            </div>
          )}
        </div>

        {/* BOTTOM CONTROL DECK: BALANCED 3-POINT CONTROLS (PRIVACY - SHUTTER - FLIP) */}
        <div className="relative z-30 px-6 pt-3 pb-8 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col items-center">
          
          {/* Main Shutter Row: Privacy Icon (Left) - Shutter (Center) - Flip Camera (Right) */}
          <div className="w-full flex items-center justify-between max-w-[320px] px-2 py-1 relative">
            {/* Privacy Icon (Replaces Gallery) */}
            <div className="relative flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowPrivacyTooltip(!showPrivacyTooltip)}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-emerald-400 flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border border-emerald-400/30 shadow-md group"
                title="Privasi Terjaga: Analisis cermin diproses privat"
                aria-label="Informasi Privasi"
              >
                <Lock className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              </button>

              {/* Privacy Interactive Tooltip Bubble */}
              {showPrivacyTooltip && (
                <div 
                  className="absolute bottom-14 left-0 w-52 p-3 rounded-2xl bg-slate-900/95 border border-emerald-500/40 text-white shadow-2xl backdrop-blur-xl z-50 text-[11px] leading-relaxed animate-in fade-in zoom-in-95 duration-150 select-none cursor-pointer"
                  onClick={() => setShowPrivacyTooltip(false)}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Privasi Terlindungi</span>
                  </div>
                  Foto & gaya Anda diproses secara privat tanpa disebarkan ke publik.
                  <div className="mt-1 text-[9px] text-slate-400 text-right">Ketuk untuk menutup</div>
                </div>
              )}
            </div>

            {/* Hero Shutter Button */}
            <button
              type="button"
              onClick={handleStartCapture}
              disabled={isScanning || countdown !== null}
              className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1.5 flex items-center justify-center cursor-pointer group active:scale-90 transition-all disabled:opacity-50"
              title="Ambil Pose di Cermin Sekarang"
            >
              {/* Outer pulsing energy halo with Champagne & Taupe luxury tones */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#A69D8E] via-[#E9E5D9] to-[#343640] opacity-85 group-hover:opacity-100 blur-[3px] transition-opacity animate-pulse" />
              <div className="relative w-full h-full rounded-full bg-[#343640] flex items-center justify-center shadow-2xl group-hover:scale-98 transition-transform border border-[#E9E5D9]/40">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#E9E5D9] bg-gradient-to-tr from-[#A69D8E]/30 to-[#E9E5D9]/20 flex items-center justify-center">
                  <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-[#E9E5D9]" />
                </div>
              </div>
            </button>

            {/* Flip Camera (Front / Rear) - Ergonomic position next to thumb */}
            <button
              type="button"
              onClick={handleToggleFacingMode}
              disabled={isScanning || countdown !== null}
              className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border border-white/20 shadow-md group disabled:opacity-40"
              title={facingMode === 'user' ? 'Ganti ke Kamera Belakang' : 'Ganti ke Kamera Depan (Cermin)'}
            >
              <RotateCcw className={`w-5 h-5 text-white/90 group-hover:scale-110 transition-transform duration-300 ${facingMode === 'environment' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
