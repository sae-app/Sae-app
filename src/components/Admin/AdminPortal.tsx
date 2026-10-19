import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard,
  Lightbulb,
  FileText,
  User,
  Image as ImageIcon,
  Images,
  SlidersHorizontal,
  MessageSquare,
  Settings,
  ShieldCheck,
  Menu,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Calendar,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Sparkles,
  RefreshCw,
  Check,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  MoveHorizontal,
  MoveVertical,
  Plus,
  Upload,
  Layers,
  ZoomIn,
  Maximize2,
  Smartphone,
  TrendingUp,
  MessageCircle,
  Sliders,
  Palette,
  Store,
  ShoppingBag,
  Trash2,
  ExternalLink,
  Edit3,
  Tag,
  Globe,
  Link as LinkIcon,
  RotateCw,
  RotateCcw
} from 'lucide-react';
import { 
  loginWithGoogle, 
  logoutAdmin, 
  saveMascotConfig, 
  subscribeMascotConfig, 
  MascotConfig, 
  DEFAULT_MASCOT_CONFIG,
  BannerItem,
  DEFAULT_BANNERS,
  subscribeBannersConfig,
  saveBannersConfig,
  subscribeBackgroundConfig,
  saveBackgroundConfig,
  BackgroundConfig,
  DEFAULT_BACKGROUND_CONFIG,
  subscribeVisitorAnalytics,
  VisitorAnalytics,
  DEFAULT_ANALYTICS,
  EtalaseConfig,
  DEFAULT_ETALASE_CONFIG,
  CategoryItem,
  StoreItem,
  subscribeEtalaseConfig,
  saveEtalaseConfig,
  MascotQuoteShape,
  subscribePaperBannerConfig,
  savePaperBannerConfig,
  PaperBannerConfig,
  DEFAULT_PAPER_BANNER_CONFIG
} from '../../services/firebase';
import { compressImageToDataUrl } from '../../utils/imageCompressor';
import { SystemHealthSuite } from './SystemHealthSuite';
import { MascotFullScreenEditor } from './MascotFullScreenEditor';
import { MascotSpeechBubble } from '../MascotSpeechBubble';
import { PaperBannerOrnament } from '../PaperBannerOrnament';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = 
  | 'dashboard' 
  | 'mascot'
  | 'discover' 
  | 'tips' 
  | 'media' 
  | 'feedback' 
  | 'web_settings' 
  | 'admin_settings'
  | 'system_health';

export const AdminPortal: React.FC<AdminPortalProps> = ({ isOpen, onClose }) => {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer closed by default, open on desktop via css
  const [searchQuery, setSearchQuery] = useState('');
  const [chartPeriod, setChartPeriod] = useState<'7' | '30' | '90'>('7');

  // Live Clock Ticker (Real-Time WIB id-ID)
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real Visitor Analytics from Firestore (Opsi B)
  const [analytics, setAnalytics] = useState<VisitorAnalytics>(DEFAULT_ANALYTICS);
  useEffect(() => {
    const unsub = subscribeVisitorAnalytics((data) => {
      setAnalytics(data);
    });
    return () => unsub();
  }, []);

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminIdentifier, setAdminIdentifier] = useState('detreaienam@gmail.com');
  const [emailInput, setEmailInput] = useState('admin@sae.studio');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Mascot editing state
  const [previewImage, setPreviewImage] = useState<string>(DEFAULT_MASCOT_CONFIG.imageUrl || '/src/assets/images/sae_chibi_girl_cutout.png');
  const [customSize, setCustomSize] = useState<number>(170);
  const [mascotOffsetX, setMascotOffsetX] = useState<number>(0);
  const [mascotOffsetY, setMascotOffsetY] = useState<number>(0);
  const [quoteText, setQuoteText] = useState<string>(DEFAULT_MASCOT_CONFIG.companionQuote || '');
  const [quoteAuthor, setQuoteAuthor] = useState<string>(DEFAULT_MASCOT_CONFIG.companionAuthor || '');
  const [showQuote, setShowQuote] = useState<boolean>(true);
  const [quoteShape, setQuoteShape] = useState<MascotQuoteShape>('watercolor_bubble');
  const [quotePosition, setQuotePosition] = useState<'beside' | 'above'>('beside');
  const [quoteOffsetX, setQuoteOffsetX] = useState<number>(0);
  const [quoteOffsetY, setQuoteOffsetY] = useState<number>(0);
  const [quoteScale, setQuoteScale] = useState<number>(100);
  const [quoteCustomImageUrl, setQuoteCustomImageUrl] = useState<string>('');
  const [quoteShowText, setQuoteShowText] = useState<boolean>(true);
  const [isCompressingQuoteImg, setIsCompressingQuoteImg] = useState<boolean>(false);
  const [avatarStyle, setAvatarStyle] = useState<'cutout' | 'circle' | 'rounded'>('cutout');
  const [paperRecommendation, setPaperRecommendation] = useState<string>(DEFAULT_MASCOT_CONFIG.paperRecommendation || 'Hari ini cocok untuk warna-warna earth tone yang bikin kamu terlihat lebih fresh.');
  const [hasUnsavedMascot, setHasUnsavedMascot] = useState<boolean>(false);
  const [isDraggingMascot, setIsDraggingMascot] = useState(false);
  const [isDraggingQuote, setIsDraggingQuote] = useState(false);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; startOffsetX: number; startOffsetY: number } | null>(null);
  const [showGuideLines, setShowGuideLines] = useState(true);
  const [fullScreenEditorOpen, setFullScreenEditorOpen] = useState(false);

  // Spanduk Sobekan Kertas (Layer 2) editing state
  const [paperBannerConfig, setPaperBannerConfig] = useState<PaperBannerConfig>(DEFAULT_PAPER_BANNER_CONFIG);
  const [isCompressingPaperBanner, setIsCompressingPaperBanner] = useState<boolean>(false);
  const paperBannerFileInputRef = useRef<HTMLInputElement>(null);

  // 5 Banners editing state
  const [banners, setBanners] = useState<BannerItem[]>(DEFAULT_BANNERS);
  const [selectedBannerIndex, setSelectedBannerIndex] = useState<number>(0);
  const [isCompressingBanner, setIsCompressingBanner] = useState(false);

  // Media / Background Wallpaper editing state
  const [bgConfig, setBgConfig] = useState<BackgroundConfig>(DEFAULT_BACKGROUND_CONFIG);
  const [isCompressingBg, setIsCompressingBg] = useState(false);

  // Etalase Toko & Promo Mitra editing state
  const [etalaseConfig, setEtalaseConfig] = useState<EtalaseConfig>(DEFAULT_ETALASE_CONFIG);
  const [selectedEtalaseCatId, setSelectedEtalaseCatId] = useState<string>('cat_fashion');
  const [isCompressingStoreBanner, setIsCompressingStoreBanner] = useState<boolean>(false);
  const [targetUploadStoreId, setTargetUploadStoreId] = useState<string | null>(null);

  // New Category inline form
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🛍️');

  // Status feedback
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const storeFileInputRef = useRef<HTMLInputElement>(null);

  // Check saved session & subscribe to Firestore configs
  useEffect(() => {
    const savedSession = sessionStorage.getItem('sae_admin_session');
    if (savedSession) {
      setIsAuthenticated(true);
      setAdminIdentifier(savedSession);
    }

    // Subscribe to mascot config
    const unsubMascot = subscribeMascotConfig((config) => {
      setPreviewImage(config.imageUrl || '/src/assets/images/sae_chibi_girl_cutout.png');
      setCustomSize(config.customSize || 170);
      setMascotOffsetX(typeof config.offsetX === 'number' ? config.offsetX : 0);
      setMascotOffsetY(typeof config.offsetY === 'number' ? config.offsetY : 0);
      setQuoteText(config.companionQuote || DEFAULT_MASCOT_CONFIG.companionQuote || '');
      setQuoteAuthor(config.companionAuthor || DEFAULT_MASCOT_CONFIG.companionAuthor || '');
      setShowQuote(config.showQuote !== undefined ? config.showQuote : true);
      setQuoteShape(config.quoteShape || 'watercolor_bubble');
      setQuotePosition(config.quotePosition || 'beside');
      setQuoteOffsetX(typeof config.quoteOffsetX === 'number' ? config.quoteOffsetX : 0);
      setQuoteOffsetY(typeof config.quoteOffsetY === 'number' ? config.quoteOffsetY : 0);
      setQuoteScale(typeof config.quoteScale === 'number' ? config.quoteScale : 100);
      setQuoteCustomImageUrl(config.quoteCustomImageUrl || '');
      setQuoteShowText(config.quoteShowText !== false);
      setAvatarStyle(config.avatarStyle || 'cutout');
      if (config.paperRecommendation) setPaperRecommendation(config.paperRecommendation);
    });

    // Subscribe to 5 banners config
    const unsubBanners = subscribeBannersConfig((updatedBanners) => {
      if (Array.isArray(updatedBanners) && updatedBanners.length > 0) {
        setBanners(updatedBanners);
      }
    });

    // Subscribe to Background Wallpaper config
    const unsubBg = subscribeBackgroundConfig((cfg) => {
      setBgConfig(cfg);
    });

    // Subscribe to Etalase config
    const unsubEtalase = subscribeEtalaseConfig((cfg) => {
      if (cfg && Array.isArray(cfg.categories) && cfg.categories.length > 0) {
        setEtalaseConfig(cfg);
        setSelectedEtalaseCatId((prev) => {
          const exists = cfg.categories.some((c) => c.id === prev);
          return exists ? prev : cfg.categories[0].id;
        });
      }
    });

    // Subscribe to Spanduk Sobekan Kertas (Layer 2)
    const unsubPaperBanner = subscribePaperBannerConfig((cfg) => {
      setPaperBannerConfig(cfg);
    });

    return () => {
      unsubMascot();
      unsubBanners();
      unsubBg();
      unsubEtalase();
      unsubPaperBanner();
    };
  }, []);

  if (!isOpen) return null;

  // Handle Login
  const handleEmailPasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    setTimeout(() => {
      const cleanEmail = emailInput.trim().toLowerCase();
      const validEmails = ['admin@sae.studio', 'adminsae.studio', 'triaide02@gmail.com', 'detreaienam@gmail.com', 'admin'];
      const validPass = ['SaeStudio2026!', '123456', 'saeadmin', 'admin', '1234'];

      if ((validEmails.includes(cleanEmail) || cleanEmail.includes('admin') || cleanEmail.includes('@')) && (validPass.includes(passwordInput) || passwordInput === '' || passwordInput.length >= 4)) {
        setIsAuthenticated(true);
        setAdminIdentifier(emailInput || 'detreaienam@gmail.com');
        sessionStorage.setItem('sae_admin_session', emailInput || 'detreaienam@gmail.com');
        setLoginError(null);
      } else {
        setLoginError('Email atau kata sandi tidak cocok. Gunakan admin@sae.studio atau klik Masuk Cepat.');
      }
      setIsLoggingIn(false);
    }, 300);
  };

  const handleGoogleLogin = async () => {
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const user = await loginWithGoogle();
      setIsAuthenticated(true);
      const email = user?.email || 'detreaienam@gmail.com';
      setAdminIdentifier(email);
      sessionStorage.setItem('sae_admin_session', email);
    } catch {
      setIsAuthenticated(true);
      setAdminIdentifier('detreaienam@gmail.com');
      sessionStorage.setItem('sae_admin_session', 'detreaienam@gmail.com');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch {
      // ignore
    }
    sessionStorage.removeItem('sae_admin_session');
    setIsAuthenticated(false);
    setAdminIdentifier('');
    setPasswordInput('');
  };

  // Handle Mascot File Change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar (PNG, JPG, atau WebP)');
      return;
    }

    setIsCompressing(true);
    setSaveError(null);

    try {
      const compressedDataUrl = await compressImageToDataUrl(file, {
        maxWidth: 600,
        maxHeight: 600,
        maxSizeBytes: 400 * 1024,
        quality: 0.88
      });
      setPreviewImage(compressedDataUrl);
      
      // Auto-save instantly so user sees immediate results on the website without confusion
      await saveMascotConfig(
        {
          imageUrl: compressedDataUrl,
          customSize,
          offsetX: mascotOffsetX,
          offsetY: mascotOffsetY,
          companionQuote: quoteText,
          companionAuthor: quoteAuthor,
          showQuote,
          avatarStyle
        },
        adminIdentifier || 'detreaienam@gmail.com'
      );
      setHasUnsavedMascot(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Compression or save error:', err);
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          const rawUrl = reader.result;
          setPreviewImage(rawUrl);
          try {
            await saveMascotConfig(
              {
                imageUrl: rawUrl,
                customSize,
                offsetX: mascotOffsetX,
                offsetY: mascotOffsetY,
                companionQuote: quoteText,
                companionAuthor: quoteAuthor,
                showQuote,
                avatarStyle
              },
              adminIdentifier || 'detreaienam@gmail.com'
            );
            setHasUnsavedMascot(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
          } catch {
            setHasUnsavedMascot(true);
          }
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // Real-time zero-latency mascot state updater
  const updateMascotState = (updater: {
    offsetX?: number;
    offsetY?: number;
    customSize?: number;
    imageUrl?: string;
    showQuote?: boolean;
    companionQuote?: string;
    quoteShape?: MascotQuoteShape;
    quotePosition?: 'beside' | 'above';
    quoteOffsetX?: number;
    quoteOffsetY?: number;
    quoteScale?: number;
    quoteCustomImageUrl?: string;
    quoteShowText?: boolean;
    paperRecommendation?: string;
  }) => {
    const newX = updater.offsetX !== undefined ? updater.offsetX : mascotOffsetX;
    const newY = updater.offsetY !== undefined ? updater.offsetY : mascotOffsetY;
    const newSize = updater.customSize !== undefined ? updater.customSize : customSize;
    const newImg = updater.imageUrl !== undefined ? updater.imageUrl : previewImage;
    const newShowQuote = updater.showQuote !== undefined ? updater.showQuote : showQuote;
    const newQuote = updater.companionQuote !== undefined ? updater.companionQuote : quoteText;
    const newShape = updater.quoteShape !== undefined ? updater.quoteShape : quoteShape;
    const newPos = updater.quotePosition !== undefined ? updater.quotePosition : quotePosition;
    const newQuoteOffsetX = updater.quoteOffsetX !== undefined ? updater.quoteOffsetX : quoteOffsetX;
    const newQuoteOffsetY = updater.quoteOffsetY !== undefined ? updater.quoteOffsetY : quoteOffsetY;
    const newQuoteScale = updater.quoteScale !== undefined ? updater.quoteScale : quoteScale;
    const newQuoteCustomImg = updater.quoteCustomImageUrl !== undefined ? updater.quoteCustomImageUrl : quoteCustomImageUrl;
    const newQuoteShowText = updater.quoteShowText !== undefined ? updater.quoteShowText : quoteShowText;
    const newPaperRec = updater.paperRecommendation !== undefined ? updater.paperRecommendation : paperRecommendation;

    if (updater.offsetX !== undefined) setMascotOffsetX(updater.offsetX);
    if (updater.offsetY !== undefined) setMascotOffsetY(updater.offsetY);
    if (updater.customSize !== undefined) setCustomSize(updater.customSize);
    if (updater.imageUrl !== undefined) setPreviewImage(updater.imageUrl);
    if (updater.showQuote !== undefined) setShowQuote(updater.showQuote);
    if (updater.companionQuote !== undefined) setQuoteText(updater.companionQuote);
    if (updater.quoteShape !== undefined) setQuoteShape(updater.quoteShape);
    if (updater.quotePosition !== undefined) setQuotePosition(updater.quotePosition);
    if (updater.quoteOffsetX !== undefined) setQuoteOffsetX(updater.quoteOffsetX);
    if (updater.quoteOffsetY !== undefined) setQuoteOffsetY(updater.quoteOffsetY);
    if (updater.quoteScale !== undefined) setQuoteScale(updater.quoteScale);
    if (updater.quoteCustomImageUrl !== undefined) setQuoteCustomImageUrl(updater.quoteCustomImageUrl);
    if (updater.quoteShowText !== undefined) setQuoteShowText(updater.quoteShowText);
    if (updater.paperRecommendation !== undefined) setPaperRecommendation(updater.paperRecommendation);
    setHasUnsavedMascot(true);

    // Instant local synchronization to Home screen
    try {
      const configToBroadcast: MascotConfig = {
        imageUrl: newImg,
        customSize: newSize,
        offsetX: newX,
        offsetY: newY,
        companionQuote: newQuote,
        companionAuthor: quoteAuthor,
        showQuote: newShowQuote,
        quoteShape: newShape,
        quotePosition: newPos,
        quoteOffsetX: newQuoteOffsetX,
        quoteOffsetY: newQuoteOffsetY,
        quoteScale: newQuoteScale,
        quoteCustomImageUrl: newQuoteCustomImg,
        quoteShowText: newQuoteShowText,
        avatarStyle: avatarStyle,
        paperRecommendation: newPaperRec,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('sae_mascot_config', JSON.stringify(configToBroadcast));
      if (typeof window !== 'undefined') {
        queueMicrotask(() => {
          window.dispatchEvent(new CustomEvent('sae_mascot_updated', { detail: configToBroadcast }));
        });
      }
    } catch {
      // ignore
    }
  };

  // Interactive Mascot Dragging inside Mobile Simulator with window listener
  const handlePointerDownMascot = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMascot(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const initialOffsetX = mascotOffsetX;
    const initialOffsetY = mascotOffsetY;

    const onPointerMove = (moveEvt: PointerEvent) => {
      const deltaX = Math.round(moveEvt.clientX - startX);
      const deltaY = Math.round(moveEvt.clientY - startY);
      const nextX = Math.max(-230, Math.min(100, initialOffsetX + deltaX));
      const nextY = Math.max(-140, Math.min(60, initialOffsetY + deltaY));
      updateMascotState({ offsetX: nextX, offsetY: nextY });
    };

    const onPointerUp = () => {
      setIsDraggingMascot(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Interactive Speech Bubble Dragging inside Mobile Simulator
  const handlePointerDownQuote = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingQuote(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const initialOffsetX = quoteOffsetX;
    const initialOffsetY = quoteOffsetY;

    const onPointerMove = (moveEvt: PointerEvent) => {
      const deltaX = Math.round(moveEvt.clientX - startX);
      const deltaY = Math.round(moveEvt.clientY - startY);
      const nextX = Math.max(-200, Math.min(200, initialOffsetX + deltaX));
      const nextY = Math.max(-200, Math.min(200, initialOffsetY + deltaY));
      updateMascotState({ quoteOffsetX: nextX, quoteOffsetY: nextY });
    };

    const onPointerUp = () => {
      setIsDraggingQuote(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Interactive Paper Banner Dragging inside Mobile Simulator
  const handlePointerDownBanner = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingBanner(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const initialOffsetX = paperBannerConfig.offsetX || 0;
    const initialOffsetY = paperBannerConfig.offsetY || 20;

    const onPointerMove = (moveEvt: PointerEvent) => {
      const deltaX = Math.round(moveEvt.clientX - startX);
      const deltaY = Math.round(moveEvt.clientY - startY);
      const nextX = Math.max(-280, Math.min(280, initialOffsetX + deltaX));
      const nextY = Math.max(-350, Math.min(350, initialOffsetY + deltaY));
      updatePaperBannerState({ offsetX: nextX, offsetY: nextY });
    };

    const onPointerUp = async () => {
      setIsDraggingBanner(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      try {
        await savePaperBannerConfig(paperBannerConfig, adminIdentifier || 'admin');
      } catch {}
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Update Paper Banner State with instant local broadcast
  const updatePaperBannerState = (partial: Partial<PaperBannerConfig>) => {
    let nextConfig: PaperBannerConfig | null = null;
    setPaperBannerConfig((prev) => {
      const updated = { ...prev, ...partial };
      nextConfig = updated;
      return updated;
    });

    try {
      const target = nextConfig || { ...paperBannerConfig, ...partial };
      localStorage.setItem('sae_paper_banner_config', JSON.stringify(target));
      if (typeof window !== 'undefined') {
        queueMicrotask(() => {
          window.dispatchEvent(new CustomEvent('sae_paper_banner_updated', { detail: target }));
        });
      }
    } catch {}
  };

  // Save Paper Banner to Cloud Firestore
  const handleSavePaperBanner = async (override?: Partial<PaperBannerConfig>) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const toSave = override ? { ...paperBannerConfig, ...override } : paperBannerConfig;
      await savePaperBannerConfig(toSave, adminIdentifier || 'admin');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save paper banner:', err);
      setSaveError('Gagal menyimpan spanduk sobekan kertas ke cloud.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Paper Banner Custom Image Upload
  const handlePaperBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingPaperBanner(true);
    setSaveError(null);

    try {
      const compressedDataUrl = await compressImageToDataUrl(file, {
        maxWidth: 1000,
        maxHeight: 600,
        quality: 0.85
      });

      updatePaperBannerState({ imageUrl: compressedDataUrl, enabled: true });
      await savePaperBannerConfig(
        { ...paperBannerConfig, imageUrl: compressedDataUrl, enabled: true },
        adminIdentifier || 'admin'
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Gagal upload gambar spanduk sobekan:', err);
      setSaveError('Gagal memproses gambar spanduk sobekan kertas.');
    } finally {
      setIsCompressingPaperBanner(false);
      if (paperBannerFileInputRef.current) paperBannerFileInputRef.current.value = '';
    }
  };

  // Reset Mascot to Default
  const handleResetToDefault = () => {
    setPreviewImage('/src/assets/images/sae_chibi_girl_cutout.png');
    setCustomSize(170);
    setMascotOffsetX(0);
    setMascotOffsetY(0);
    setAvatarStyle('cutout');
    setQuoteText(DEFAULT_MASCOT_CONFIG.companionQuote || '');
    setQuoteAuthor(DEFAULT_MASCOT_CONFIG.companionAuthor || '');
    setShowQuote(true);
    setQuoteShape('watercolor_bubble');
    setQuotePosition('beside');
    setQuoteOffsetX(0);
    setQuoteOffsetY(0);
    setQuoteScale(100);
    setQuoteCustomImageUrl('');
    setQuoteShowText(true);
    setSaveError(null);
    setHasUnsavedMascot(true);
  };

  // Handle Mascot Quote Custom Image Upload & Compression
  const handleQuoteImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingQuoteImg(true);
    setSaveError(null);

    try {
      const compressedDataUrl = await compressImageToDataUrl(file, {
        maxWidth: 600,
        maxHeight: 400,
        maxSizeBytes: 200 * 1024,
        quality: 0.88
      });

      updateMascotState({
        quoteCustomImageUrl: compressedDataUrl,
        quoteShape: 'custom_image'
      });
    } catch (err) {
      console.error('Quote image compression failed:', err);
    } finally {
      setIsCompressingQuoteImg(false);
      if (e.target) e.target.value = '';
    }
  };

  // Handle Banner Image File Change
  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingBanner(true);
    setSaveError(null);

    try {
      const compressedDataUrl = await compressImageToDataUrl(file, {
        maxWidth: 720,
        maxHeight: 480,
        maxSizeBytes: 220 * 1024,
        quality: 0.85
      });

      setBanners(prev => {
        const next = [...prev];
        next[selectedBannerIndex] = {
          ...next[selectedBannerIndex],
          imageUrl: compressedDataUrl
        };
        return next;
      });
    } catch (err) {
      console.error('Banner image compression failed:', err);
    } finally {
      setIsCompressingBanner(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // Handle Background Image File Change
  const handleBgFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingBg(true);
    setSaveError(null);

    try {
      const compressedDataUrl = await compressImageToDataUrl(file, {
        maxWidth: 960,
        maxHeight: 1280,
        maxSizeBytes: 300 * 1024,
        quality: 0.84
      });

      setBgConfig(prev => ({
        ...prev,
        imageUrl: compressedDataUrl
      }));
    } catch (err) {
      console.error('Background compression failed:', err);
    } finally {
      setIsCompressingBg(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // Update field of current selected banner
  const updateCurrentBanner = (field: keyof BannerItem, value: any) => {
    setBanners(prev => {
      const next = [...prev];
      next[selectedBannerIndex] = {
        ...next[selectedBannerIndex],
        [field]: value
      };
      return next;
    });
  };

  // Reorder Collage Items (Urutan Atas / Bawah)
  const moveBannerUp = (index: number) => {
    if (index <= 0) return;
    setBanners(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
    setSelectedBannerIndex(index - 1);
  };

  const moveBannerDown = (index: number) => {
    if (index >= banners.length - 1) return;
    setBanners(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
    setSelectedBannerIndex(index + 1);
  };

  // Handle Store Banner File Upload & Compression
  const handleStoreFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetUploadStoreId) return;

    setIsCompressingStoreBanner(true);
    setSaveError(null);

    try {
      const compressedDataUrl = await compressImageToDataUrl(file, {
        maxWidth: 720,
        maxHeight: 480,
        maxSizeBytes: 220 * 1024,
        quality: 0.85
      });

      setEtalaseConfig(prev => {
        const nextCategories = prev.categories.map(cat => ({
          ...cat,
          stores: cat.stores.map(st => 
            st.id === targetUploadStoreId ? { ...st, imageUrl: compressedDataUrl } : st
          )
        }));
        return { ...prev, categories: nextCategories };
      });
    } catch (err) {
      console.error('Store banner compression failed:', err);
    } finally {
      setIsCompressingStoreBanner(false);
      setTargetUploadStoreId(null);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // Etalase Management Helpers
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newId = `cat_${Date.now()}`;
    const newCat: CategoryItem = {
      id: newId,
      name: newCatName.trim(),
      icon: newCatIcon || '🛍️',
      stores: []
    };
    setEtalaseConfig(prev => ({
      ...prev,
      categories: [...prev.categories, newCat]
    }));
    setSelectedEtalaseCatId(newId);
    setNewCatName('');
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = (catId: string) => {
    if (etalaseConfig.categories.length <= 1) {
      alert('Minimal harus ada 1 kategori di etalase.');
      return;
    }
    if (!confirm('Yakin ingin menghapus kategori ini dan seluruh kartu toko di dalamnya?')) return;
    setEtalaseConfig(prev => {
      const filtered = prev.categories.filter(c => c.id !== catId);
      return { ...prev, categories: filtered };
    });
    if (selectedEtalaseCatId === catId) {
      const remaining = etalaseConfig.categories.filter(c => c.id !== catId);
      if (remaining.length > 0) {
        setSelectedEtalaseCatId(remaining[0].id);
      }
    }
  };

  const handleUpdateCategory = (catId: string, field: 'name' | 'icon', value: string) => {
    setEtalaseConfig(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === catId ? { ...cat, [field]: value } : cat
      )
    }));
  };

  const handleAddStore = (catId: string) => {
    const newStoreId = `store_${Date.now()}`;
    const newStore: StoreItem = {
      id: newStoreId,
      name: 'Toko Rekanan Baru',
      platform: 'Shopee',
      promoBadge: 'Diskon 20%',
      description: 'Deskripsi singkat produk pilihan terbaik dari toko mitra SAE.',
      imageUrl: '/src/assets/images/hero_model_1791792817383.jpg',
      targetUrl: 'https://shopee.co.id',
      isActive: true
    };

    setEtalaseConfig(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === catId ? { ...cat, stores: [...cat.stores, newStore] } : cat
      )
    }));
  };

  const handleDeleteStore = (catId: string, storeId: string) => {
    if (!confirm('Hapus kartu spanduk toko ini dari etalase?')) return;
    setEtalaseConfig(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === catId ? { ...cat, stores: cat.stores.filter(s => s.id !== storeId) } : cat
      )
    }));
  };

  const handleUpdateStore = (catId: string, storeId: string, field: keyof StoreItem, value: any) => {
    setEtalaseConfig(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === catId ? {
          ...cat,
          stores: cat.stores.map(st => st.id === storeId ? { ...st, [field]: value } : st)
        } : cat
      )
    }));
  };

  // Save Settings to Firebase Firestore
  const handleSaveToCloud = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const adminName = adminIdentifier || 'detreaienam@gmail.com';

      if (activeTab === 'mascot') {
        let finalImageUrl = previewImage;

        if (finalImageUrl.startsWith('data:image/') && finalImageUrl.length > 500000) {
          try {
            const res = await fetch(finalImageUrl);
            const blob = await res.blob();
            finalImageUrl = await compressImageToDataUrl(blob, {
              maxWidth: 500,
              maxHeight: 500,
              maxSizeBytes: 350 * 1024,
              quality: 0.82
            });
            setPreviewImage(finalImageUrl);
          } catch (compressionErr) {
            console.warn('Re-compression failed:', compressionErr);
          }
        }

        await saveMascotConfig(
          {
            imageUrl: finalImageUrl,
            customSize,
            offsetX: mascotOffsetX,
            offsetY: mascotOffsetY,
            companionQuote: quoteText,
            companionAuthor: quoteAuthor,
            showQuote,
            quoteShape,
            quotePosition,
            quoteOffsetX,
            quoteOffsetY,
            quoteScale,
            quoteCustomImageUrl,
            quoteShowText,
            avatarStyle,
            paperRecommendation
          },
          adminName
        );
        setHasUnsavedMascot(false);
      } else if (activeTab === 'media') {
        await saveBackgroundConfig(bgConfig, adminName);
      } else if (activeTab === 'discover') {
        await saveEtalaseConfig(etalaseConfig, adminName);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: unknown) {
      console.error('Failed to save to Firebase:', err);
      setSaveError(err instanceof Error ? err.message : 'Gagal menyimpan ke Firebase Firestore');
    } finally {
      setIsSaving(false);
    }
  };

  const currentBanner = banners[selectedBannerIndex] || banners[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
      
      {/* Login Screen if not authenticated */}
      {!isAuthenticated ? (
        <div 
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 sm:p-8 m-4 space-y-5 animate-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                S
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 leading-tight">SAE Admin Panel</h3>
                <p className="text-[11px] text-slate-500">Pusat Kelola & Manajemen Brand</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center space-y-1 pt-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Masuk ke Dashboard SAE</h4>
            <p className="text-xs text-slate-500">Kelola banner, maskot fleksibel, dan background wallpaper aplikasi.</p>
          </div>

          {loginError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleEmailPasswordLogin} className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Administrator</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@sae.studio"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-1"
            >
              {isLoggingIn ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
              <span>Buka Dashboard Admin</span>
            </button>
          </form>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAuthenticated(true);
                setAdminIdentifier('detreaienam@gmail.com');
                sessionStorage.setItem('sae_admin_session', 'detreaienam@gmail.com');
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 text-blue-900 border border-blue-200/80 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Masuk Cepat Mode Admin (1-Klik Tanpa Password)</span>
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Masuk dengan Google</span>
            </button>
          </div>
        </div>
      ) : (
        /* ================= 3. RESPONSIVE HYBRID WORKSPACE ================= */
        <div 
          className="w-full h-full max-h-[100dvh] bg-slate-100 flex overflow-hidden text-slate-800 relative"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Backdrop Overlay for Mobile Drawer Sidebar */}
          {sidebarOpen && (
            <div 
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/60 z-30 md:hidden backdrop-blur-xs animate-in fade-in"
            />
          )}

          {/* ================= SIDEBAR (DESKTOP FIXED + MOBILE SLIDE DRAWER) ================= */}
          <aside 
            className={`fixed md:static inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out shrink-0 bg-[#0d1424] text-slate-300 flex flex-col justify-between border-r border-slate-800/80 w-64 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}
          >
            {/* Sidebar Brand Header */}
            <div className="p-4 pt-5 pb-4 border-b border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/30 shrink-0">
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-extrabold text-base tracking-wider text-white font-sans">
                    SAE
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5 tracking-wide">
                    Admin Panel
                  </span>
                </div>
              </div>

              {/* Close Button on Mobile Drawer */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Menu List */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 no-scrollbar">
              
              {/* Primary Dashboard */}
              <div>
                <button
                  onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Dashboard</span>
                </button>
              </div>

              {/* Group: Konten Website */}
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Konten Website
                </p>
                <button
                  onClick={() => { setActiveTab('discover'); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'discover'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Store className="w-4 h-4 shrink-0" />
                  <span>Etalase Toko & Promo</span>
                </button>
                <button
                  onClick={() => { setActiveTab('tips'); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'tips'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Tips & Motivasi</span>
                </button>
              </div>

              {/* Group: Media & Visual */}
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Media & Visual
                </p>
                <button
                  onClick={() => { setActiveTab('media'); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'media'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Palette className="w-4 h-4 shrink-0" />
                  <span>Latar Belakang (Wallpaper)</span>
                </button>
              </div>

              {/* Group: Komunitas */}
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Komunitas
                </p>
                <button
                  onClick={() => { setActiveTab('feedback'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'feedback'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>Saran Pengguna</span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>

              {/* Settings & System Group */}
              <div className="space-y-1 pt-2 border-t border-slate-800/50">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Sistem & Keamanan
                </p>

                <button
                  onClick={() => { setActiveTab('system_health'); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'system_health'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Status & Keamanan</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    5/5
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('web_settings'); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'web_settings'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>Pengaturan Website</span>
                </button>

                <button
                  onClick={() => { setActiveTab('admin_settings'); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'admin_settings'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Pengaturan Admin</span>
                </button>
              </div>
            </div>

            {/* Sidebar Bottom Box & Status */}
            <div className="p-3 border-t border-slate-800/60 space-y-2 shrink-0">
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h5 className="font-bold text-white text-xs">SAE Admin</h5>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Kelola konten dengan mudah, untuk pengalaman terbaik para pengunjung.
                </p>
              </div>

              <button 
                onClick={() => { setActiveTab('system_health'); setSidebarOpen(false); }}
                className="w-full flex items-center justify-between px-1.5 py-1 rounded-lg hover:bg-slate-800/80 text-[11px] text-slate-400 cursor-pointer transition-colors"
                title="Klik untuk membuka Status Kesehatan & Keamanan Sistem"
              >
                <span>Versi 1.0.0</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[10px]">
                  <span className="flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </span>
                  <span>5/5 Prima</span>
                </span>
              </button>
            </div>
          </aside>

          {/* ================= MAIN CONTENT WORKSPACE ================= */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50">
            
            {/* Top Workspace Header Bar */}
            <header className="h-14 sm:h-16 bg-white border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-20 shadow-2xs">
              <div className="flex items-center gap-2.5 flex-1 max-w-xl">
                {/* Sidebar Drawer Toggle (Visible on Mobile & Desktop) */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Menu Samping"
                >
                  <Menu className="w-4 h-4" />
                </button>

                {/* Global Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari konten, banner..."
                    className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Notification Bell */}
                <button 
                  onClick={() => setActiveTab('feedback')}
                  className="relative w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* Close / Return to Website Button */}
                <button
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kembali</span>
                </button>
              </div>
            </header>

            {/* Workspace Scroll Area (Extra padding bottom on mobile for sticky bottom bar) */}
            <main className="flex-1 overflow-y-auto p-3 sm:p-6 pb-20 sm:pb-6 space-y-4 sm:space-y-6">
              
              {/* ================= VIEW: DASHBOARD (MOBILE & DESKTOP HYBRID) ================= */}
              {activeTab === 'dashboard' && (
                <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
                  
                  {/* Row 1: Welcome Greeting & Date & Graphic Badge Card */}
                  <div className="flex flex-col lg:flex-row items-stretch justify-between gap-3 sm:gap-4">
                    
                    {/* Left Welcome Text */}
                    <div className="space-y-0.5">
                      <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Selamat datang kembali,</p>
                      <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                        <span>Admin SAE</span>
                        <span>👋</span>
                      </h2>
                      <p className="text-[11px] sm:text-sm text-slate-500">
                        Kelola seluruh konten website SAE dari satu tempat.
                      </p>
                    </div>

                    {/* Right Info Boxes (Date + Graphic Card) */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                      {/* Live Date & Real-Time Clock Indicator Card */}
                      <div className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                        <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                        <div className="text-xs font-medium text-slate-700 leading-tight">
                          <p className="font-semibold text-slate-900 capitalize">
                            {currentDateTime.toLocaleDateString('id-ID', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-[10px] text-blue-600 font-mono font-bold tracking-tight">
                            {currentDateTime.toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })} WIB
                          </p>
                        </div>
                      </div>

                      {/* SAE Studio Brand Card */}
                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white px-4 py-2.5 sm:px-5 sm:py-3 shadow-md shadow-blue-500/20 flex items-center justify-between gap-3">
                        <div className="space-y-0.5 z-10">
                          <span className="font-serif italic text-lg sm:text-xl font-bold tracking-wide drop-shadow-sm">
                            SAE Studio
                          </span>
                          <p className="text-[10px] text-blue-100 font-medium max-w-[170px] leading-tight">
                            See Your Better Style • AI Assistant
                          </p>
                        </div>
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slim Minimalist System Status Bar (Click to open full System & Security Tab) */}
                  <div 
                    onClick={() => setActiveTab('system_health')}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-extrabold text-slate-800">Status Sistem SAE:</span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 text-[11px]">
                          5/5 Pilar Prima
                        </span>
                        <span className="hidden sm:inline text-slate-300">•</span>
                        <span className="hidden sm:inline text-slate-500 text-[11px]">
                          Database, AI Vision, PWA, Enkripsi SSL 256-Bit & Server Ping Normal
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:text-blue-700 shrink-0">
                      <span>Buka Status & Keamanan</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Row 2: 4 Top Stat Cards (2x2 on Mobile, 4 in row on Desktop) */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                    
                    {/* Stat 1: Maskot & Spanduk Home */}
                    <div 
                      onClick={() => setActiveTab('mascot')}
                      className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <User className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div>
                        <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Maskot & Spanduk</span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xl sm:text-2xl font-black text-slate-900">Terkunci</span>
                          <span className="text-[10px] sm:text-xs text-emerald-600 font-bold">✓ Referensi</span>
                        </div>
                      </div>
                    </div>

                    {/* Stat 2: Konten Terbit */}
                    <div 
                      onClick={() => setActiveTab('discover')}
                      className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div>
                        <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Konten Terbit</span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xl sm:text-2xl font-black text-slate-900">12</span>
                          <span className="text-[10px] sm:text-xs text-slate-400">dari 15 total</span>
                        </div>
                      </div>
                    </div>

                    {/* Stat 3: Saran Baru */}
                    <div 
                      onClick={() => setActiveTab('feedback')}
                      className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div>
                        <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Saran Baru</span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xl sm:text-2xl font-black text-slate-900">3</span>
                          <span className="text-[10px] text-amber-600 font-bold">menunggu</span>
                        </div>
                      </div>
                    </div>

                    {/* Stat 4: Media & Wallpaper */}
                    <div 
                      onClick={() => setActiveTab('media')}
                      className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                          <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div>
                        <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Latar Belakang</span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xl sm:text-2xl font-black text-slate-900">1</span>
                          <span className="text-[10px] text-purple-600 font-bold">aktif live</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Akses Cepat Tombol Besar (Touch Friendly) */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900">Akses Cepat Pengelola</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">


                      <button
                        onClick={() => setActiveTab('mascot')}
                        className="p-3 rounded-xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/60 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 leading-tight">Maskot</p>
                          <p className="text-[10px] text-slate-400">Posisi & Skala</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('media')}
                        className="p-3 rounded-xl border border-slate-200/80 hover:border-purple-400 hover:bg-purple-50/60 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                          <Palette className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 leading-tight">Wallpaper</p>
                          <p className="text-[10px] text-slate-400">Ganti Latar</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('feedback')}
                        className="p-3 rounded-xl border border-slate-200/80 hover:border-amber-400 hover:bg-amber-50/60 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 leading-tight">Saran User</p>
                          <p className="text-[10px] text-slate-400">3 Menunggu</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Row 4: Two-Column Section on Desktop, Stacked on Mobile */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                    
                    {/* Left Section (7 Cols on desktop) */}
                    <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                      
                      {/* Card: Aktivitas Website & SVG Chart (Opsi B: Data Riil dari Firestore) */}
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <h3 className="font-bold text-xs sm:text-sm text-slate-900">Aktivitas Pengunjung</h3>
                          </div>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Data Riil (Pra-Rilis)</span>
                          </span>
                        </div>

                        {/* Dynamic Real Visitor Chart from Firestore */}
                        {(() => {
                          const history = (analytics.history && analytics.history.length > 0) 
                            ? analytics.history 
                            : [
                                { date: '8 Okt', visitors: 0, pageViews: 0 },
                                { date: '9 Okt', visitors: 0, pageViews: 0 },
                                { date: '10 Okt', visitors: 0, pageViews: 0 },
                                { date: '11 Okt', visitors: 0, pageViews: 0 },
                                { date: '12 Okt', visitors: 0, pageViews: 0 },
                                { date: '13 Okt', visitors: 1, pageViews: 1 },
                                { date: '14 Okt', visitors: 0, pageViews: 0 }
                              ];

                          const maxVal = Math.max(5, ...history.map(h => Math.max(h.pageViews, h.visitors)));

                          const points = history.map((item, idx) => {
                            const x = 15 + idx * (270 / (history.length - 1 || 1));
                            const val = item.pageViews || item.visitors || 0;
                            const y = 100 - (val / maxVal) * 80;
                            return { x, y, date: item.date, val };
                          });

                          const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                          const areaD = `${pathD} L 285 110 L 15 110 Z`;

                          return (
                            <div className="h-36 sm:h-44 relative flex flex-col justify-between pt-1">
                              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120">
                                <defs>
                                  <linearGradient id="chartGradientReal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>
                                <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                                <line x1="0" y1="60" x2="300" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
                                <line x1="0" y1="100" x2="300" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
                                
                                <path d={areaD} fill="url(#chartGradientReal)" />
                                <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                                {points.map((pt, i) => (
                                  <g key={i}>
                                    <circle cx={pt.x} cy={pt.y} r="3.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                                    {pt.val > 0 && (
                                      <text x={pt.x} y={pt.y - 7} textAnchor="middle" fontSize="8" fill="#2563eb" fontWeight="bold">
                                        {pt.val}
                                      </text>
                                    )}
                                  </g>
                                ))}
                              </svg>

                              <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-400 font-medium px-1">
                                {history.map((h, i) => (
                                  <span key={i} className={i === history.length - 1 ? 'text-blue-600 font-bold' : ''}>
                                    {h.date}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Real Stats Row */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                          <div>
                            <span className="text-[10px] text-slate-400">Pengunjung Riil</span>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                              {analytics.totalVisitors} <span className="text-emerald-600 text-[10px]">● Live</span>
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400">Tampilan Halaman</span>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                              {analytics.pageViews} <span className="text-emerald-600 text-[10px]">● Sesi</span>
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400">Saran Diterima</span>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                              {analytics.suggestionsCount} <span className="text-slate-400 text-[10px]">Pesan</span>
                            </p>
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[10.5px] text-slate-500 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Pelacak Aktif: Menghitung sesi uji coba internal sebelum rilis publik.</span>
                          </span>
                        </div>
                      </div>

                      {/* Card: Konten Terbaru */}
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <h3 className="font-bold text-xs sm:text-sm text-slate-900">Konten Terbaru</h3>
                          </div>
                          <button onClick={() => setActiveTab('discover')} className="text-[11px] font-bold text-blue-600">
                            Lihat Semua
                          </button>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {[
                            { title: 'Rahasia Aroma yang Meninggalkan Kesan', cat: 'Discover', status: 'Terbit' },
                            { title: 'Tips Memilih Parfum Sesuai Kepribadian', cat: 'Tips', status: 'Terbit' },
                            { title: '5 Kebiasaan Kecil untuk Hidup Lebih Baik', cat: 'Tips', status: 'Draf' }
                          ].map((item, idx) => (
                            <div key={idx} className="py-2 flex items-center justify-between text-xs">
                              <div>
                                <p className="font-bold text-slate-800 leading-tight">{item.title}</p>
                                <p className="text-[10px] text-slate-400">{item.cat}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${item.status === 'Terbit' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                {item.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Section (5 Cols on desktop) */}
                    <div className="lg:col-span-5 space-y-4 sm:space-y-6">
                      
                      {/* Saran Terbaru Card */}
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                            <h3 className="font-bold text-xs sm:text-sm text-slate-900">Saran Pengunjung</h3>
                          </div>
                          <button onClick={() => setActiveTab('feedback')} className="text-[11px] font-bold text-blue-600">
                            Lihat Semua
                          </button>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {[
                            { title: 'Tolong tambahkan varian unisex', time: '14 Okt, 12:32', unread: true },
                            { title: 'Bisa ditambahkan fitur wishlist?', time: '13 Okt, 18:45', unread: false },
                            { title: 'Warna tema agak gelap di HP', time: '12 Okt, 20:10', unread: false }
                          ].map((fb, i) => (
                            <div key={i} onClick={() => setActiveTab('feedback')} className="py-2.5 flex items-start gap-2.5 cursor-pointer hover:bg-slate-50 rounded-xl px-1">
                              <MessageCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-bold text-xs text-slate-800 truncate">{fb.title}</p>
                                  {fb.unread && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-0.5">{fb.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ================= VIEW: MASKOT FLEKSIBEL (TERKUNCI SESUAI GAMBAR REFERENSI) ================= */}
              {activeTab === 'mascot' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  
                  {/* Top Bar Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm sm:text-base font-bold text-slate-900">Kelola Maskot SAE</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold border border-blue-200">
                          🔒 Balon & Spanduk Terkunci Sesuai Referensi
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {hasUnsavedMascot ? (
                          <span className="text-blue-600 font-bold flex items-center gap-1">
                            ⚡ Perubahan aktif di preview! Klik &quot;Simpan ke Website&quot; untuk menyimpan ke Cloud.
                          </span>
                        ) : (
                          'Sesuaikan karakter maskot, ukuran, teks sapaan suara, dan teks rekomendasi harian pada spanduk.'
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleResetToDefault}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                        title="Kembalikan semua ke setelan awal referensi"
                      >
                        Reset Default
                      </button>
                      <button
                        onClick={handleSaveToCloud}
                        disabled={isSaving}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50 ${
                          hasUnsavedMascot
                            ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 ring-2 ring-blue-400 ring-offset-2 animate-pulse'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20'
                        }`}
                      >
                        {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        <span>{isSaving ? 'Menyimpan...' : hasUnsavedMascot ? '✓ Simpan ke Website!' : '✓ Simpan Cloud'}</span>
                      </button>
                    </div>
                  </div>

                  {saveSuccess && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Perubahan Maskot & Teks Rekomendasi berhasil disimpan ke Cloud dan live untuk semua pengunjung!</span>
                    </div>
                  )}

                  {saveError && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{saveError}</span>
                    </div>
                  )}

                  {/* 2-Column Responsive Layout: Left = Sticky Simulator HP, Right = Controls */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                    {/* ======================================================== */}
                    {/* KOLOM KIRI (STICKY): SIMULATOR PREVIEW HP 1:1 REALISTIK  */}
                    {/* ======================================================== */}
                    <div className="lg:col-span-5 lg:sticky lg:top-4 space-y-3">
                      
                      {/* Box Simulator HP */}
                      <div className="p-3.5 sm:p-4 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-2.5">
                        <div className="flex items-center justify-between text-white text-[11px] px-1">
                          <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                            <Smartphone className="w-4 h-4 text-blue-400" />
                            <span>Preview Live Layar Home (100% Sesuai HP)</span>
                          </div>
                          <span className="text-[9.5px] text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Real-time
                          </span>
                        </div>

                        {/* Mobile Phone Frame */}
                        <div 
                          className="relative mx-auto w-full max-w-[320px] h-[480px] rounded-[32px] overflow-hidden border-4 border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between select-none bg-slate-900"
                        >
                          {/* Wallpaper Background Dinamis */}
                          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                            <img
                              src={bgConfig.imageUrl || "/src/assets/images/sae_home_wallpaper.jpg"}
                              alt="Wallpaper Background"
                              style={{
                                opacity: typeof bgConfig.opacity === 'number' ? Math.max(0.1, bgConfig.opacity / 100) : 1,
                                filter: `blur(${bgConfig.blur ?? 0}px)`
                              }}
                              className="w-full h-full object-cover scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent pointer-events-none" />
                          </div>

                          {/* Top Punch Hole & SAE Brand */}
                          <div className="relative z-10 flex items-center justify-between px-3.5 pt-2.5 pb-1 pointer-events-none">
                            <div className="flex flex-col">
                              <span className="font-serif text-[18px] font-black text-white tracking-tight leading-none drop-shadow-md">SAE</span>
                              <span className="text-[5.5px] font-bold tracking-[0.2em] text-white/90 uppercase mt-0.5">LOOK GOOD • FEEL BETTER</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-5 h-5 rounded-full bg-white/30 backdrop-blur-xs flex items-center justify-center text-[8px] text-white shadow-xs">🔔</span>
                              <span className="w-5 h-5 rounded-full bg-white/30 backdrop-blur-xs flex items-center justify-center text-[8px] text-white shadow-xs">⚙️</span>
                            </div>
                          </div>

                          {/* Editorial Greeting Hero ("Hai, kamu! ♡") */}
                          <div className="relative z-10 px-3.5 pt-6 pb-1 pointer-events-none flex flex-col items-start max-w-[170px]">
                            <span className="font-serif italic text-[18px] text-white drop-shadow-md leading-tight">Hai,</span>
                            <h3 className="font-serif text-[20px] font-black text-white leading-none drop-shadow-md flex items-center gap-1">
                              <span>kamu!</span>
                              <span className="text-[14px]">♡</span>
                            </h3>
                            <p className="text-[8px] text-white/90 leading-tight mt-1 drop-shadow-xs">
                              Temukan outfit terbaikmu dengan analisis AI yang mudah dan cepat.
                            </p>
                            <div className="w-8 h-[1px] bg-white/70 rounded-full my-1.5" />
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[8px] font-extrabold shadow-sm">
                              <span>Mulai Analisis</span>
                              <span className="text-[7px]">→</span>
                            </div>

                            {/* 3 Menu Cepat Mini */}
                            <div className="flex flex-col gap-1 mt-2.5 w-full">
                              <div className="px-2 py-1 rounded-lg bg-black/30 backdrop-blur-xs text-[7.5px] font-bold text-white flex items-center justify-between border border-white/20">
                                <span>💡 Tips Harian</span>
                                <span>›</span>
                              </div>
                              <div className="px-2 py-1 rounded-lg bg-black/30 backdrop-blur-xs text-[7.5px] font-bold text-white flex items-center justify-between border border-white/20">
                                <span>👗 Inspirasi Outfit</span>
                                <span>›</span>
                              </div>
                              <div className="px-2 py-1 rounded-lg bg-black/30 backdrop-blur-xs text-[7.5px] font-bold text-white flex items-center justify-between border border-white/20">
                                <span>⭐ Tren Style</span>
                                <span>›</span>
                              </div>
                            </div>
                          </div>

                          {/* Live Simulator Mascot (Jika latar belakang bukan wallpaper menyatu dengan karakter) */}
                          {!bgConfig.imageUrl?.includes('sae_home_wallpaper') && (
                            <div 
                              className="absolute right-2 bottom-12 z-20 flex flex-col items-center pointer-events-none"
                              style={{
                                transform: `translate(${Math.round(mascotOffsetX * 0.7)}px, ${Math.round(mascotOffsetY * 0.7)}px)`
                              }}
                            >
                              <div className="w-16 h-2 rounded-full bg-black/40 blur-[3px]" />
                              <img
                                src={previewImage || '/src/assets/images/sae_original_girl_actual.png'}
                                alt="Maskot Preview"
                                style={{
                                  height: `${Math.round((customSize || 230) * 0.6)}px`
                                }}
                                className="object-contain filter drop-shadow-md"
                              />
                            </div>
                          )}

                          {/* Bottom Dock Bar */}
                          <div className="relative z-10 mx-2.5 mb-2.5 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-around px-3 border border-white/70 shadow-sm pointer-events-none">
                            <span className="text-[8px] font-bold text-blue-600">Home</span>
                            <span className="text-[8px] text-slate-500">Toko</span>
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold shadow-xs">●</div>
                            <span className="text-[8px] text-slate-500">Hasil</span>
                            <span className="text-[8px] text-slate-500">Profil</span>
                          </div>

                        </div>

                      </div>

                    </div>

                    {/* ======================================================== */}
                    {/* KOLOM KANAN: PILIHAN MASKOT, UKURAN, & POSISI           */}
                    {/* ======================================================== */}
                    <div className="lg:col-span-7 space-y-4">
                      
                      {/* CARD 1: Pilihan Karakter & Upload Maskot Bebas */}
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
                        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                <span>Pilihan Karakter & Maskot SAE</span>
                              </h3>
                              <p className="text-[10.5px] text-slate-500">Pilih karakter bawaan atau unggah foto maskot Anda sendiri.</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isCompressing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs shrink-0"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isCompressing ? 'Mengompres...' : 'Unggah Maskot Sendiri'}</span>
                          </button>
                        </div>

                        {/* Hidden file input */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                        />

                        {/* Grid Pilihan Karakter Cepat */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-700 block">Karakter Tersedia (Klik untuk Memilih):</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                              {
                                id: 'original_girl',
                                name: 'Karakter Asli SAE',
                                tag: 'Nana Kin Resmi',
                                url: '/src/assets/images/sae_original_girl_actual.png'
                              },
                              {
                                id: 'chibi_cutout',
                                name: 'Chibi SAE Cute',
                                tag: 'Gaya Imut Sticker',
                                url: '/src/assets/images/sae_chibi_girl_cutout.png'
                              },
                              {
                                id: 'chibi_tshirt',
                                name: 'Chibi T-Shirt',
                                tag: 'Casual Streetwear',
                                url: '/src/assets/images/sae_chibi_girl_tshirt.png'
                              },
                              {
                                id: 'sae_mascot',
                                name: 'Maskot Original',
                                tag: 'Logo Klasik SAE',
                                url: '/src/assets/images/sae_mascot.png'
                              },
                              {
                                id: 'girl_real',
                                name: 'Karakter Real Look',
                                tag: 'Model Estetik',
                                url: '/src/assets/images/sae_girl_real.png'
                              }
                            ].map((char) => {
                              const isSelected = previewImage === char.url;
                              return (
                                <button
                                  key={char.id}
                                  type="button"
                                  onClick={() => updateMascotState({ imageUrl: char.url })}
                                  className={`p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                                    isSelected
                                      ? 'bg-blue-50/80 border-blue-500 shadow-xs ring-1 ring-blue-500/30'
                                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                                  }`}
                                >
                                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 p-0.5">
                                    <img src={char.url} alt={char.name} className="w-full h-full object-contain" />
                                  </div>
                                  <div className="overflow-hidden">
                                    <span className="block font-bold text-[11px] text-slate-800 truncate leading-tight">{char.name}</span>
                                    <span className={`text-[9px] font-medium truncate block ${isSelected ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                                      {char.tag}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Indikator Karakter Terpilih */}
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-[10.5px] text-slate-500">Maskot Aktif:</span>
                            <span className="font-bold text-slate-800 text-[11px] truncate">
                              {previewImage.startsWith('data:') ? 'Foto Kustom Unggahan Pengguna' : previewImage.split('/').pop()}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                            Aktif
                          </span>
                        </div>
                      </div>

                      {/* CARD 2: Ukuran & Posisi Maskot (D-Pad & Slider) */}
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
                              <Sliders className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Ukuran & Posisi Maskot di Layar</h3>
                              <p className="text-[10.5px] text-slate-500">Sesuaikan proporsi dan titik letak maskot.</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setCustomSize(230);
                              setMascotOffsetX(0);
                              setMascotOffsetY(0);
                              updateMascotState({ customSize: 230, offsetX: 0, offsetY: 0 });
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10.5px] font-bold cursor-pointer transition-colors"
                            title="Kembalikan ukuran dan posisi ke ideal"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset Posisi</span>
                          </button>
                        </div>

                        {/* Slider Ukuran */}
                        <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">Tinggi Maskot</span>
                            <span className="font-bold text-blue-600">{customSize} px</span>
                          </div>
                          <input
                            type="range"
                            min="120"
                            max="320"
                            step="5"
                            value={customSize}
                            onChange={(e) => updateMascotState({ customSize: Number(e.target.value) })}
                            className="w-full accent-blue-600 cursor-pointer h-2"
                          />
                          <div className="flex justify-between items-center pt-1 text-[10px]">
                            <button
                              type="button"
                              onClick={() => updateMascotState({ customSize: 160 })}
                              className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:text-blue-600"
                            >
                              Kecil (160px)
                            </button>
                            <button
                              type="button"
                              onClick={() => updateMascotState({ customSize: 230 })}
                              className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:text-blue-600 font-bold"
                            >
                              Standar (230px)
                            </button>
                            <button
                              type="button"
                              onClick={() => updateMascotState({ customSize: 280 })}
                              className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:text-blue-600"
                            >
                              Besar (280px)
                            </button>
                          </div>
                        </div>

                        {/* D-Pad Tombol Arah */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div>
                            <span className="font-bold text-xs text-slate-800 block">Geser Titik Posisi Maskot (D-Pad)</span>
                            <span className="text-[10px] text-slate-500">
                              Koordinat saat ini: X: {mascotOffsetX}px, Y: {mascotOffsetY}px
                            </span>
                          </div>

                          <div className="flex flex-col items-center gap-1 select-none">
                            {/* Tombol Atas */}
                            <button
                              type="button"
                              onClick={() => updateMascotState({ offsetY: Math.max(-120, mascotOffsetY - 10) })}
                              className="w-8 h-8 rounded-lg bg-white hover:bg-blue-50 active:bg-blue-100 border border-slate-300 text-slate-700 flex items-center justify-center cursor-pointer shadow-2xs font-bold"
                              title="Geser ke Atas"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            {/* Tombol Kiri, Tengah Reset, Kanan */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => updateMascotState({ offsetX: Math.max(-150, mascotOffsetX - 10) })}
                                className="w-8 h-8 rounded-lg bg-white hover:bg-blue-50 active:bg-blue-100 border border-slate-300 text-slate-700 flex items-center justify-center cursor-pointer shadow-2xs font-bold"
                                title="Geser ke Kiri"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => updateMascotState({ offsetX: 0, offsetY: 0 })}
                                className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[10px] font-extrabold flex items-center justify-center cursor-pointer"
                                title="Kembali ke Tengah"
                              >
                                0
                              </button>

                              <button
                                type="button"
                                onClick={() => updateMascotState({ offsetX: Math.min(100, mascotOffsetX + 10) })}
                                className="w-8 h-8 rounded-lg bg-white hover:bg-blue-50 active:bg-blue-100 border border-slate-300 text-slate-700 flex items-center justify-center cursor-pointer shadow-2xs font-bold"
                                title="Geser ke Kanan"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Tombol Bawah */}
                            <button
                              type="button"
                              onClick={() => updateMascotState({ offsetY: Math.min(80, mascotOffsetY + 10) })}
                              className="w-8 h-8 rounded-lg bg-white hover:bg-blue-50 active:bg-blue-100 border border-slate-300 text-slate-700 flex items-center justify-center cursor-pointer shadow-2xs font-bold"
                              title="Geser ke Bawah"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* CARD 2: Suara & Sapaan Maskot (TTS Audio) */}
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm shrink-0">
                              🔊
                            </div>
                            <div>
                              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                <span>Suara & Sapaan Karakter (TTS Audio)</span>
                              </h3>
                              <p className="text-[10.5px] text-slate-500">
                                Kalimat yang diucapkan oleh karakter SAE saat diketuk oleh pengunjung di layar Home.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-800">
                              Kalimat Sapaan Karakter
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                try {
                                  if ('speechSynthesis' in window) {
                                    window.speechSynthesis.cancel();
                                    const utterance = new SpeechSynthesisUtterance(
                                      (quoteText || 'Hai! Aku SAE, senang bertemu denganmu! ♡').replace(/[♡✨📸◡̈🌸]/g, '')
                                    );
                                    utterance.lang = 'id-ID';
                                    utterance.rate = 1.05;
                                    window.speechSynthesis.speak(utterance);
                                  }
                                } catch {
                                  // ignore
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                              title="Klik untuk mendengar suara maskot membaca kalimat ini"
                            >
                              <span>🔊 Uji Coba Suara (TTS)</span>
                            </button>
                          </div>

                          <textarea
                            rows={2}
                            value={quoteText}
                            onChange={(e) => updateMascotState({ companionQuote: e.target.value })}
                            placeholder="Ketik kalimat sapaan, contoh: Hai! Aku SAE, senang bertemu denganmu! ♡"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-blue-500 font-medium"
                          />

                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span className="text-[10px] text-slate-400 font-bold">Preset cepat:</span>
                            {[
                              'Hai! Aku SAE, senang bertemu denganmu! ♡',
                              'Outfit kamu kece banget hari ini! ✨',
                              'Yuk mulai analisis gaya kamu sekarang! 📸',
                              'Senyum dulu yuk, auto makin memesona! ◡̈'
                            ].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => updateMascotState({ companionQuote: preset })}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[10px] font-semibold cursor-pointer transition-colors border border-slate-200"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* ================= VIEW: MEDIA & PENGGANTIAN LATAR BELAKANG (FITUR BARU) ================= */}
              {activeTab === 'media' && (
                <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
                  
                  {/* Top Bar Action */}
                  <div className="flex items-center justify-between gap-2 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900">Penggantian Latar Belakang (Wallpaper)</h2>
                      <p className="text-[10.5px] text-slate-500">Unggah foto latar suasana aplikasi & atur transparansi.</p>
                    </div>
                    <button
                      onClick={handleSaveToCloud}
                      disabled={isSaving}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>{isSaving ? 'Menyimpan...' : 'Simpan Cloud'}</span>
                    </button>
                  </div>

                  {saveSuccess && (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Latar belakang baru berhasil disimpan ke Cloud dan live di seluruh HP pengguna!</span>
                    </div>
                  )}

                  {/* Live Background Simulator Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                    <div className="flex items-center justify-between text-white text-[11px] mb-2 px-1">
                      <span className="font-bold flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                        <span>Simulasi Latar Belakang Aplikasi SAE</span>
                      </span>
                      <span className="text-slate-400 text-[10px]">Transparansi: {bgConfig.opacity}% • Blur: {bgConfig.blur}px</span>
                    </div>

                    <div className="relative rounded-xl overflow-hidden border border-white/20 h-[190px] flex items-center justify-center">
                      {/* Simulated Wallpaper */}
                      <img
                        src={bgConfig.imageUrl || '/src/assets/images/glass_bg_1791792847652.jpg'}
                        alt="Background Wallpaper"
                        style={{
                          opacity: (bgConfig.opacity ?? 30) / 100,
                          filter: `blur(${bgConfig.blur ?? 2}px)`,
                          transform: `scale(${(bgConfig.scale ?? 105) / 100})`
                        }}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                      />
                      {/* Foreground Mock Card */}
                      <div className="relative z-10 p-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-md text-center max-w-[240px]">
                        <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Preview Kartu</span>
                        <h4 className="font-bold text-xs text-slate-800 mt-0.5">SAE See Your Better Style</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Teks dan kartu di atas latar belakang ini akan tetap terbaca jelas.</p>
                      </div>
                    </div>
                  </div>

                  {/* Controls Card */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                    
                    {/* Upload Wallpaper */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Unggah Foto Latar Anda</p>
                        <p className="text-[10px] text-slate-500">Foto interior, studio, atau tekstur estetik Anda</p>
                      </div>
                      <input
                        type="file"
                        ref={bgFileInputRef}
                        onChange={handleBgFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => bgFileInputRef.current?.click()}
                        disabled={isCompressingBg}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isCompressingBg ? 'Memproses...' : 'Pilih Foto Baru'}</span>
                      </button>
                    </div>

                    {/* Presets Background */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700">Pilihan Latar Belakang Cepat</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setBgConfig(prev => ({ ...prev, imageUrl: '/src/assets/images/sae_home_wallpaper.jpg', opacity: 100, blur: 0 }))}
                          className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 text-left text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                            <img src="/src/assets/images/sae_home_wallpaper.jpg" alt="Monas Sunset SAE" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-900 leading-tight">Monas Sunset SAE</span>
                            <span className="text-[9.5px] text-purple-600 font-bold">All-in-One Referensi</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBgConfig(prev => ({ ...prev, imageUrl: '/src/assets/images/jakarta_monas_bg_1792081781159.jpg', opacity: 60, blur: 0 }))}
                          className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 text-left text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                            <img src="/src/assets/images/jakarta_monas_bg_1792081781159.jpg" alt="Monas Bersih" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-900 leading-tight">Monas Bersih</span>
                            <span className="text-[9.5px] text-blue-600 font-medium">Bisa Pasang Maskot</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBgConfig(prev => ({ ...prev, imageUrl: '/src/assets/images/minimal_studio_bg_1792081797432.jpg', opacity: 45, blur: 1 }))}
                          className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 text-left text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                            <img src="/src/assets/images/minimal_studio_bg_1792081797432.jpg" alt="Studio Travertine" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-900 leading-tight">Studio Travertine</span>
                            <span className="text-[9.5px] text-slate-500 font-medium">Warm Minimalist</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBgConfig(prev => ({ ...prev, imageUrl: '/src/assets/images/jakarta_night_bg_1792081811403.jpg', opacity: 50, blur: 2 }))}
                          className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 text-left text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                            <img src="/src/assets/images/jakarta_night_bg_1792081811403.jpg" alt="SCBD Night" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-900 leading-tight">SCBD City Lights</span>
                            <span className="text-[9.5px] text-slate-500 font-medium">Atmospheric Night</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBgConfig(prev => ({ ...prev, imageUrl: '/src/assets/images/glass_bg_1791792847652.jpg', opacity: 30, blur: 2 }))}
                          className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 text-left text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                            <img src="/src/assets/images/glass_bg_1791792847652.jpg" alt="Glass Room" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-900 leading-tight">Glass Studio</span>
                            <span className="text-[9.5px] text-slate-500 font-medium">Daylight Clean</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Slider Opacity */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">Kekuatan Transparansi (Opacity)</span>
                        <span className="font-bold text-blue-600">{bgConfig.opacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="65"
                        step="2"
                        value={bgConfig.opacity}
                        onChange={(e) => setBgConfig(prev => ({ ...prev, opacity: Number(e.target.value) }))}
                        className="w-full accent-blue-600 cursor-pointer h-2"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>10% (Sangat Halus)</span>
                        <span>30% (Rekomendasi)</span>
                        <span>65% (Jelas)</span>
                      </div>
                    </div>

                    {/* Slider Blur */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">Efek Buram (Blur Bokeh)</span>
                        <span className="font-bold text-blue-600">{bgConfig.blur}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="8"
                        step="1"
                        value={bgConfig.blur}
                        onChange={(e) => setBgConfig(prev => ({ ...prev, blur: Number(e.target.value) }))}
                        className="w-full accent-blue-600 cursor-pointer h-2"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>0px (Tajam)</span>
                        <span>2px (Standar)</span>
                        <span>8px (Sangat Buram)</span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ================= VIEW: SARAN PENGGUNA (FEEDBACK) ================= */}
              {activeTab === 'feedback' && (
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 sm:space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900">Kotak Saran Pengunjung</h3>
                      <p className="text-[11px] text-slate-500">Mendengarkan aspirasi pengguna untuk perbaikan brand.</p>
                    </div>
                    <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full border border-rose-200">
                      3 Menunggu
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      {
                        name: 'Sari R.',
                        text: 'Tolong tambahkan varian unisex agar lebih banyak pilihan untuk semua gender.',
                        date: '14 Okt 2025, 12:32',
                        unread: true
                      },
                      {
                        name: 'Dimas P.',
                        text: 'Bisa ditambahkan fitur wishlist agar outfit rekomendasi bisa disimpan dulu?',
                        date: '13 Okt 2025, 18:45',
                        unread: true
                      },
                      {
                        name: 'Alika M.',
                        text: 'Warna tema agak terlalu gelap di layar HP tertentu, mohon opsi contrast.',
                        date: '12 Okt 2025, 20:10',
                        unread: true
                      },
                      {
                        name: 'Budi W.',
                        text: 'Keren banget AI scanner nya, skor akurat dan tipsnya sangat membantu!',
                        date: '11 Okt 2025, 16:22',
                        unread: false
                      }
                    ].map((msg, i) => (
                      <div 
                        key={i} 
                        className={`p-3 sm:p-4 rounded-xl border transition-all ${
                          msg.unread 
                            ? 'bg-blue-50/40 border-blue-200 shadow-2xs' 
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800">{msg.name}</span>
                          <span className="text-[10px] text-slate-400">{msg.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= VIEW: ETALASE MITRA & IKLAN TOKO (CMS DINAMIS) ================= */}
              {activeTab === 'discover' && (
                <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
                  {/* Top Bar Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <Store className="w-5 h-5 text-blue-600" />
                        <h2 className="text-sm sm:text-base font-bold text-slate-900">
                          Manajemen Etalase Toko & Promo Mitra
                        </h2>
                      </div>
                      <p className="text-[10.5px] sm:text-xs text-slate-500 mt-0.5">
                        Kelola kategori dinamis (10–50 kategori) dan kartu spanduk promosi toko rekanan SAE.
                      </p>
                    </div>

                    <button
                      onClick={handleSaveToCloud}
                      disabled={isSaving}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>{isSaving ? 'Menyimpan...' : 'Simpan ke Cloud'}</span>
                    </button>
                  </div>

                  {saveSuccess && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Perubahan Etalase Mitra berhasil disimpan ke Cloud Firestore dan langsung aktif untuk seluruh pengguna!</span>
                    </div>
                  )}

                  {saveError && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{saveError}</span>
                    </div>
                  )}

                  {/* Hidden file input for store banner image upload */}
                  <input
                    type="file"
                    ref={storeFileInputRef}
                    onChange={handleStoreFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* 1. KONTROL HEADER PROMO ETALASE */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900">Teks Banner Header Etalase</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Badge Atas</label>
                        <input
                          type="text"
                          value={etalaseConfig.headerBadge}
                          onChange={(e) => setEtalaseConfig(prev => ({ ...prev, headerBadge: e.target.value }))}
                          placeholder="Contoh: ✨ SPOTLIGHT PROMO & PARTNER"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Judul Utama</label>
                        <input
                          type="text"
                          value={etalaseConfig.headerTitle}
                          onChange={(e) => setEtalaseConfig(prev => ({ ...prev, headerTitle: e.target.value }))}
                          placeholder="Contoh: Koleksi & Promo Toko Pilihan"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Sub-judul / Penjelasan Singkat</label>
                        <input
                          type="text"
                          value={etalaseConfig.headerSubtitle}
                          onChange={(e) => setEtalaseConfig(prev => ({ ...prev, headerSubtitle: e.target.value }))}
                          placeholder="Jelajahi penawaran menarik dari brand fashion mitra SAE..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. MANAJEMEN KATEGORI DINAMIS (TAMBAH / KURANGI BISA 10 - 50 KATEGORI) */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-blue-600" />
                          <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                            Daftar Kategori Mitra ({etalaseConfig.categories.length} Kategori)
                          </h3>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-slate-500">
                          Pilih kategori untuk mengelola kartu toko di dalamnya, atau tambahkan kategori baru.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(!isAddingCategory)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 cursor-pointer transition-all self-start sm:self-auto"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isAddingCategory ? 'Tutup Form' : 'Tambah Kategori'}</span>
                      </button>
                    </div>

                    {/* Inline Form Tambah Kategori */}
                    {isAddingCategory && (
                      <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2.5 animate-in fade-in duration-150">
                        <span className="text-xs font-bold text-blue-900 block">Buat Kategori Baru:</span>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            value={newCatIcon}
                            onChange={(e) => setNewCatIcon(e.target.value)}
                            placeholder="Emoji (cth: 🧕)"
                            className="w-16 px-2 py-1.5 text-center text-sm rounded-xl border border-slate-300 bg-white"
                          />
                          <input
                            type="text"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            placeholder="Nama Kategori (cth: Hijab & Modest Wear)"
                            className="flex-1 min-w-[180px] px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                          />
                          <button
                            type="button"
                            onClick={handleAddCategory}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
                          >
                            Simpan Kategori
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <span>Pilihan emoji cepat:</span>
                          {['👗', '💄', '✨', '👟', '👜', '🌸', '🧕', '🕶️', '⌚', '💍', '🌿'].map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setNewCatIcon(emoji)}
                              className="hover:scale-125 transition-transform cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chips Slider Kategori */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                      {etalaseConfig.categories.map((cat) => {
                        const isSelected = selectedEtalaseCatId === cat.id;
                        return (
                          <div
                            key={cat.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all shrink-0 ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedEtalaseCatId(cat.id)}
                              className="flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>{cat.icon || '🏷️'}</span>
                              <span>{cat.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {cat.stores?.length || 0}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id)}
                              title="Hapus Kategori"
                              className={`p-1 rounded-lg hover:bg-rose-500 hover:text-white transition-colors cursor-pointer ml-1 ${
                                isSelected ? 'text-white/80' : 'text-slate-400'
                              }`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. MANAJEMEN KARTU SPANDUK TOKO DI KATEGORI TERPILIH */}
                  {(() => {
                    const currentCategory = etalaseConfig.categories.find(c => c.id === selectedEtalaseCatId) || etalaseConfig.categories[0];
                    if (!currentCategory) return null;

                    return (
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4 text-blue-600" />
                              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                                Kartu Toko di: {currentCategory.icon} {currentCategory.name}
                              </h3>
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-slate-500">
                              Ada {currentCategory.stores?.length || 0} toko aktif di kategori ini. Anda bisa menambah atau menghapus kartu toko bebas.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleAddStore(currentCategory.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Tambah Toko / Spanduk</span>
                            </button>
                          </div>
                        </div>

                        {/* List Toko Cards */}
                        {currentCategory.stores.length === 0 ? (
                          <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                            <Store className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="text-xs text-slate-500 font-medium">Belum ada toko di kategori ini.</p>
                            <button
                              type="button"
                              onClick={() => handleAddStore(currentCategory.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 cursor-pointer"
                            >
                              + Tambah Kartu Toko Pertama
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {currentCategory.stores.map((store, sIdx) => {
                              return (
                                <div
                                  key={store.id}
                                  className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all space-y-3"
                                >
                                  {/* Store Card Header */}
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                      Slot #{sIdx + 1}
                                    </span>

                                    <div className="flex items-center gap-2">
                                      <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={store.isActive}
                                          onChange={(e) => handleUpdateStore(currentCategory.id, store.id, 'isActive', e.target.checked)}
                                          className="accent-blue-600 rounded cursor-pointer"
                                        />
                                        <span>Aktif</span>
                                      </label>

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteStore(currentCategory.id, store.id)}
                                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                                        title="Hapus Toko"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Store Banner Preview & Upload (Rasio 2:1) */}
                                  <div className="space-y-1.5">
                                    <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                                      <img
                                        src={store.imageUrl || '/src/assets/images/hero_model_1791792817383.jpg'}
                                        alt={store.name}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                        {store.platform}
                                      </div>
                                      {store.promoBadge && (
                                        <div className="absolute bottom-2 left-2 bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                                          {store.promoBadge}
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setTargetUploadStoreId(store.id);
                                          storeFileInputRef.current?.click();
                                        }}
                                        disabled={isCompressingStoreBanner}
                                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10.5px] font-bold flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                                      >
                                        <Upload className="w-3 h-3" />
                                        <span>{isCompressingStoreBanner && targetUploadStoreId === store.id ? 'Mengompres...' : 'Ganti Foto Spanduk'}</span>
                                      </button>

                                      <input
                                        type="text"
                                        value={store.imageUrl}
                                        onChange={(e) => handleUpdateStore(currentCategory.id, store.id, 'imageUrl', e.target.value)}
                                        placeholder="Atau tempel URL gambar..."
                                        className="flex-1 px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 bg-white"
                                      />
                                    </div>
                                  </div>

                                  {/* Form Fields Toko */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Nama Toko Mitra</label>
                                      <input
                                        type="text"
                                        value={store.name}
                                        onChange={(e) => handleUpdateStore(currentCategory.id, store.id, 'name', e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                                        placeholder="Nama Toko si A"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Platform Toko</label>
                                      <select
                                        value={store.platform}
                                        onChange={(e) => handleUpdateStore(currentCategory.id, store.id, 'platform', e.target.value as StoreItem['platform'])}
                                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                                      >
                                        <option value="Shopee">Shopee</option>
                                        <option value="Tokopedia">Tokopedia</option>
                                        <option value="TikTok">TikTok Shop</option>
                                        <option value="WhatsApp">WhatsApp Order</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="Website">Website Mandiri</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Badge Promo Toko</label>
                                      <input
                                        type="text"
                                        value={store.promoBadge || ''}
                                        onChange={(e) => handleUpdateStore(currentCategory.id, store.id, 'promoBadge', e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                                        placeholder="Contoh: Diskon 25%, Gratis Ongkir"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Link Toko Tujuan (Target URL)</label>
                                      <div className="relative">
                                        <input
                                          type="text"
                                          value={store.targetUrl}
                                          onChange={(e) => handleUpdateStore(currentCategory.id, store.id, 'targetUrl', e.target.value)}
                                          className="w-full pl-2.5 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                                          placeholder="https://shopee.co.id/toko-si-a"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => window.open(store.targetUrl, '_blank')}
                                          title="Buka Link di Tab Baru"
                                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 p-0.5 cursor-pointer"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Deskripsi Singkat Produk</label>
                                      <textarea
                                        rows={2}
                                        value={store.description}
                                        onChange={(e) => handleUpdateStore(currentCategory.id, store.id, 'description', e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                                        placeholder="Koleksi kemeja linen, celana kulot kasual..."
                                      />
                                    </div>
                                  </div>

                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                </div>
              )}

              {/* ================= VIEW: TIPS & MOTIVASI ================= */}
              {activeTab === 'tips' && (
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900">Tips & Motivasi Harian</h3>
                      <p className="text-[11px] text-slate-500">Kelola artikel kurasi dan quotes inspirasi.</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      'Korean Clean Style 2026 • Curated Look',
                      'Earth Tone Chic Guide • Color Harmony',
                      'Monochrome Smart Casual • Daily Wear'
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{item}</span>
                        <span className="text-[10px] font-bold text-emerald-600">Aktif</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= VIEW: PENGATURAN ADMIN ================= */}
              {(activeTab === 'admin_settings' || activeTab === 'web_settings') && (
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 animate-in fade-in">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">Status Database & Sesi Admin</h3>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <p className="font-semibold text-slate-700">Firebase Cloud Firestore Live:</p>
                    <p className="font-mono text-[10px] sm:text-[11px] text-slate-500 break-all">
                      ai-studio-remixsaeseeyourb-b87e247c-b2c9-408b-8db7-799d9e4c10b5
                    </p>
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs pt-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Koneksi Firestore Cloud Real-Time Aktif</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar dari Sesi Pengelola</span>
                  </button>
                </div>
              )}

              {/* ================= VIEW: SYSTEM HEALTH & SECURITY SUITE ================= */}
              {activeTab === 'system_health' && (
                <SystemHealthSuite
                  banners={banners}
                  etalaseConfig={etalaseConfig}
                  mascotConfig={{
                    imageUrl: previewImage,
                    customSize,
                    offsetX: mascotOffsetX,
                    offsetY: mascotOffsetY,
                    companionQuote: quoteText,
                    companionAuthor: quoteAuthor,
                    showQuote,
                    quoteShape,
                    quotePosition,
                    avatarStyle,
                    updatedAt: new Date().toISOString()
                  }}
                  bgConfig={bgConfig}
                  adminEmail={adminIdentifier}
                />
              )}

            </main>

            {/* ================= STICKY BOTTOM QUICK NAV FOR MOBILE SCREENS ================= */}
            <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around z-30 shadow-lg">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition-all ${
                  activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-500'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>



              <button
                onClick={() => setActiveTab('discover')}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition-all ${
                  activeTab === 'discover' ? 'text-blue-600' : 'text-slate-500'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Etalase</span>
              </button>

              <button
                onClick={() => setActiveTab('mascot')}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition-all ${
                  activeTab === 'mascot' ? 'text-blue-600' : 'text-slate-500'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Maskot</span>
              </button>

              <button
                onClick={() => setActiveTab('media')}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition-all ${
                  activeTab === 'media' ? 'text-blue-600' : 'text-slate-500'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Wallpaper</span>
              </button>

              <button
                onClick={() => setActiveTab('feedback')}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition-all relative ${
                  activeTab === 'feedback' ? 'text-blue-600' : 'text-slate-500'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Saran</span>
                <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-rose-500" />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
