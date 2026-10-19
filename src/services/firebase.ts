import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  getDocFromServer, 
  onSnapshot, 
  setDoc,
  Unsubscribe 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error Handling according to Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test as required by skill
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, verifying connectivity...');
    }
  }
}

export type MascotQuoteShape = 
  | 'watercolor_bubble'      // Persis referensi gambar: Balon cat air kuas biru ceria dengan pantulan dan aksen getar
  | 'soft_cloud'             // Awan bergelembung lembut putih-kebiruan
  | 'stylist_pill'           // Kapsul lanskap horizontal modern
  | 'sketch_comic'           // Balon sketsa komik chibi minimalis
  | 'stylist_asymmetric'     // Kartu sudut lengkung asimetris lembut
  | 'classic_bubble'         // Balon komik klasik
  | 'chic_capsule'           // Kapsul oval kecil
  | 'custom_image';          // Kotak sapaan dengan custom gambar/upload stiker sendiri

// Data structures for Mascot Settings
export interface MascotConfig {
  imageUrl?: string;
  customSize: number; // e.g., 50 to 140 px
  offsetX?: number; // mascot horizontal position (-80 to 80 px)
  offsetY?: number; // mascot vertical position (-50 to 50 px)
  placementMode?: 'card' | 'floating'; // In-card vs Floating screen widget
  floatingCorner?: 'bottom-right' | 'bottom-left';
  companionQuote?: string;
  companionAuthor?: string;
  showQuote?: boolean;
  quoteShape?: MascotQuoteShape;
  quotePosition?: 'beside' | 'above';
  // Pengaturan Posisi Fleksibel Kotak Sapaan
  quoteOffsetX?: number; // Offset horizontal kotak sapaan (-200px sampai +200px)
  quoteOffsetY?: number; // Offset vertikal kotak sapaan (-200px sampai +200px)
  quoteScale?: number; // Skala ukuran kotak sapaan (50% sampai 180%, default 100)
  // Upload Gambar Bebas untuk Kotak Sapaan
  quoteCustomImageUrl?: string; // Data URL atau URL gambar bebas untuk kotak sapaan
  quoteShowText?: boolean; // Tampilkan teks di atas gambar kustom (default: true)
  avatarStyle?: 'cutout' | 'circle' | 'rounded';
  // Teks Rekomendasi Editorial di Atas Sobekan Kertas Putih (Sesuai Gambar Referensi)
  paperRecommendation?: string;
  updatedAt: string;
  updatedBy?: string;
}

export const DEFAULT_MASCOT_CONFIG: MascotConfig = {
  imageUrl: '/src/assets/images/sae_chibi_girl_cutout.png',
  customSize: 170, // Ukuran besar & menonjol di atas navigasi bar
  offsetX: 0,
  offsetY: 0,
  placementMode: 'floating',
  floatingCorner: 'bottom-right',
  companionQuote: 'Hai! Aku SAE di sini! ♡',
  companionAuthor: 'Sahabat SAE',
  showQuote: true,
  quoteShape: 'watercolor_bubble', // Default sekarang persis gambar referensi
  quotePosition: 'beside',
  quoteOffsetX: 0,
  quoteOffsetY: 0,
  quoteScale: 100,
  quoteCustomImageUrl: '',
  quoteShowText: true,
  avatarStyle: 'cutout',
  paperRecommendation: 'Hari ini cocok untuk warna-warna earth tone yang bikin kamu terlihat lebih fresh.',
  updatedAt: new Date().toISOString(),
  updatedBy: 'system'
};

// Data structures for Spanduk Sobekan Kertas (Layer 2)
export interface PaperBannerConfig {
  imageUrl?: string;        // URL atau data URL gambar spanduk sobekan kertas kustom
  enabled: boolean;         // Aktifkan / tampilkan di layar Home (Layer 2)
  offsetX: number;          // Posisi horizontal (-300px s/d +300px)
  offsetY: number;          // Posisi vertikal (-400px s/d +400px)
  scale: number;            // Skala ukuran (30% s/d 250%, default 100%)
  rotate: number;           // Derajat rotasi / kemiringan (-180° s/d +180°, default -2°)
  opacity: number;          // Tingkat transparansi (10% s/d 100%, default 100%)
  title?: string;           // Teks ornamen opsional di atas spanduk (opsional)
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_PAPER_BANNER_CONFIG: PaperBannerConfig = {
  imageUrl: '', // default kosong (desain sobekan kertas estetik bawaan)
  enabled: false, // Default nonaktif agar tampilan Home tetap bersih dan rapi, aktifkan saat admin siap
  offsetX: 30,
  offsetY: -70,
  scale: 90,
  rotate: -3,
  opacity: 95,
  title: '',
  updatedAt: new Date().toISOString(),
  updatedBy: 'system'
};

// Data structures for 5 Banners
export interface BannerItem {
  id: number;
  title: string;
  subtitle: string;
  tagline?: string;
  imageUrl?: string;
  actionText?: string;
  actionLink?: string;
  bgGradient?: string;
  isActive: boolean;
  // Visual Zoom & Layout Controls
  imageFit?: 'cover' | 'contain'; // Cover vs No-Zoom Contain
  imageZoom?: number; // 70 to 160% scale
  imagePosition?: 'top' | 'center' | 'bottom';
  layoutType?: 'split' | 'hero-full';
}

export const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: 1,
    title: 'Hari ini cocok untuk warna-warna earth tone yang bikin kamu terlihat lebih fresh.',
    subtitle: 'Warm Earthy Vibes 🍂',
    tagline: 'Saran Warna Hari Ini',
    imageUrl: '/src/assets/images/sae_chibi_girl_cutout.png',
    actionText: 'Cek Sekarang',
    isActive: true,
  },
  {
    id: 2,
    title: 'Padukan kemeja linen rileks dengan celana straight cut untuk look santai tapi berkelas.',
    subtitle: 'Casual Jakarta Chic ✨',
    tagline: 'Inspirasi Gaya',
    imageUrl: '',
    actionText: 'Lihat Tips',
    isActive: true,
  },
  {
    id: 3,
    title: 'Rahasia postur 3 detik: bahu rileks & senyum tipis bikin penampilanmu 2x lebih memesona.',
    subtitle: 'Confidence Booster 🤍',
    tagline: 'Karisma & Postur',
    imageUrl: '',
    actionText: 'Buka Tips',
    isActive: true,
  },
  {
    id: 4,
    title: 'Formula 60-30-10: 60% warna dasar, 30% warna kedua, 10% aksen bikin gayamu auto harmonis.',
    subtitle: 'Color Harmony Rule 🎨',
    tagline: 'Tips Padu Padan',
    imageUrl: '',
    actionText: 'Pelajari',
    isActive: true,
  },
  {
    id: 5,
    title: 'Kamu tidak perlu izin siapa pun untuk merasa keren hari ini. Pakai yang membuatmu bangga melangkah!',
    subtitle: 'Self Love Everyday 🌟',
    tagline: 'Mood Booster',
    imageUrl: '',
    actionText: 'Klaim Mood',
    isActive: true,
  },
];

export interface BannersConfig {
  banners: BannerItem[];
  updatedAt: string;
  updatedBy?: string;
}

const MASCOT_SETTINGS_PATH = 'settings/mascot';
const BANNERS_SETTINGS_PATH = 'settings/banners';

// Subscribe to Mascot Settings from Firestore with local fallback & real-time sync
export function subscribeMascotConfig(
  onUpdate: (config: MascotConfig) => void
): Unsubscribe {
  // Check local cache first for instant render
  try {
    const cached = localStorage.getItem('sae_mascot_config');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') {
        queueMicrotask(() => {
          onUpdate({ ...DEFAULT_MASCOT_CONFIG, ...parsed });
        });
      }
    }
  } catch {
    // ignore local parse error
  }

  // Cross-component custom event listener for immediate zero-latency updates
  const handleLocalSync = (e: Event) => {
    try {
      const customEvt = e as CustomEvent<MascotConfig>;
      if (customEvt.detail) {
        queueMicrotask(() => {
          onUpdate({ ...DEFAULT_MASCOT_CONFIG, ...customEvt.detail });
        });
      }
    } catch {
      // ignore
    }
  };

  // Cross-tab storage listener
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'sae_mascot_config' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        queueMicrotask(() => {
          onUpdate({ ...DEFAULT_MASCOT_CONFIG, ...parsed });
        });
      } catch {
        // ignore
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('sae_mascot_updated', handleLocalSync);
    window.addEventListener('storage', handleStorageChange);
  }

  const mascotDocRef = doc(db, 'settings', 'mascot');
  
  const unsubSnapshot = onSnapshot(
    mascotDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as MascotConfig;
        const merged = { ...DEFAULT_MASCOT_CONFIG, ...data };
        try {
          localStorage.setItem('sae_mascot_config', JSON.stringify(merged));
        } catch {
          // ignore
        }
        onUpdate(merged);
      } else {
        // If document doesn't exist on server yet, do not overwrite existing customized local config
        try {
          const cached = localStorage.getItem('sae_mascot_config');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.imageUrl && parsed.imageUrl !== DEFAULT_MASCOT_CONFIG.imageUrl) {
              onUpdate({ ...DEFAULT_MASCOT_CONFIG, ...parsed });
              return;
            }
          }
        } catch {
          // ignore
        }
        onUpdate(DEFAULT_MASCOT_CONFIG);
      }
    },
    (error) => {
      console.warn('Snapshot listener notification:', error);
      try {
        const cached = localStorage.getItem('sae_mascot_config');
        if (cached) {
          onUpdate({ ...DEFAULT_MASCOT_CONFIG, ...JSON.parse(cached) });
          return;
        }
      } catch {
        // ignore
      }
      onUpdate(DEFAULT_MASCOT_CONFIG);
    }
  );

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('sae_mascot_updated', handleLocalSync);
      window.removeEventListener('storage', handleStorageChange);
    }
    unsubSnapshot();
  };
}

// Update Mascot Configuration in Firestore with instant local synchronization
export async function saveMascotConfig(config: Partial<MascotConfig>, userIdentifier: string): Promise<void> {
  const mascotDocRef = doc(db, 'settings', 'mascot');
  const payload: MascotConfig = {
    customSize: config.customSize ?? DEFAULT_MASCOT_CONFIG.customSize ?? 170,
    offsetX: typeof config.offsetX === 'number' ? config.offsetX : (DEFAULT_MASCOT_CONFIG.offsetX ?? 0),
    offsetY: typeof config.offsetY === 'number' ? config.offsetY : (DEFAULT_MASCOT_CONFIG.offsetY ?? 0),
    updatedAt: new Date().toISOString(),
    updatedBy: userIdentifier,
    imageUrl: config.imageUrl || DEFAULT_MASCOT_CONFIG.imageUrl || '/src/assets/images/sae_chibi_girl_cutout.png',
    companionQuote: config.companionQuote || DEFAULT_MASCOT_CONFIG.companionQuote,
    companionAuthor: config.companionAuthor || DEFAULT_MASCOT_CONFIG.companionAuthor,
    showQuote: config.showQuote ?? true,
    quoteShape: config.quoteShape || DEFAULT_MASCOT_CONFIG.quoteShape || 'watercolor_bubble',
    quotePosition: config.quotePosition || DEFAULT_MASCOT_CONFIG.quotePosition || 'beside',
    quoteOffsetX: typeof config.quoteOffsetX === 'number' ? config.quoteOffsetX : (DEFAULT_MASCOT_CONFIG.quoteOffsetX ?? 0),
    quoteOffsetY: typeof config.quoteOffsetY === 'number' ? config.quoteOffsetY : (DEFAULT_MASCOT_CONFIG.quoteOffsetY ?? 0),
    quoteScale: typeof config.quoteScale === 'number' ? config.quoteScale : (DEFAULT_MASCOT_CONFIG.quoteScale ?? 100),
    quoteCustomImageUrl: typeof config.quoteCustomImageUrl === 'string' ? config.quoteCustomImageUrl : (DEFAULT_MASCOT_CONFIG.quoteCustomImageUrl ?? ''),
    quoteShowText: config.quoteShowText !== undefined ? config.quoteShowText : (DEFAULT_MASCOT_CONFIG.quoteShowText ?? true),
    avatarStyle: config.avatarStyle || 'cutout',
    paperRecommendation: config.paperRecommendation || DEFAULT_MASCOT_CONFIG.paperRecommendation || 'Hari ini cocok untuk warna-warna earth tone yang bikin kamu terlihat lebih fresh.'
  };

  // 1. Immediately store to localStorage and dispatch custom event for instant UI update
  try {
    localStorage.setItem('sae_mascot_config', JSON.stringify(payload));
    if (typeof window !== 'undefined') {
      queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent('sae_mascot_updated', { detail: payload }));
      });
    }
  } catch (storageErr) {
    console.warn('Failed to save mascot to localStorage:', storageErr);
  }

  // 2. Persist to Firestore
  try {
    await setDoc(mascotDocRef, payload, { merge: true });
  } catch (error) {
    console.error('Firestore save failed, fallback to local storage:', error);
    handleFirestoreError(error, OperationType.WRITE, MASCOT_SETTINGS_PATH);
  }
}

const PAPER_BANNER_SETTINGS_PATH = 'settings/paper_banner';

// Subscribe to Spanduk Sobekan Kertas (Layer 2) from Firestore with instant local fallback
export function subscribePaperBannerConfig(
  onUpdate: (config: PaperBannerConfig) => void
): Unsubscribe {
  // 1. Check local cache first for instant 0ms render
  try {
    const cached = localStorage.getItem('sae_paper_banner_config');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') {
        queueMicrotask(() => {
          onUpdate({ ...DEFAULT_PAPER_BANNER_CONFIG, ...parsed });
        });
      }
    }
  } catch {
    // ignore
  }

  // 2. Cross-component custom event listener for immediate zero-latency local updates
  const handleLocalSync = (e: Event) => {
    try {
      const customEvt = e as CustomEvent<PaperBannerConfig>;
      if (customEvt.detail) {
        queueMicrotask(() => {
          onUpdate({ ...DEFAULT_PAPER_BANNER_CONFIG, ...customEvt.detail });
        });
      }
    } catch {
      // ignore
    }
  };

  // 3. Cross-tab storage listener
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'sae_paper_banner_config' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed && typeof parsed === 'object') {
          queueMicrotask(() => {
            onUpdate({ ...DEFAULT_PAPER_BANNER_CONFIG, ...parsed });
          });
        }
      } catch {
        // ignore
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('sae_paper_banner_updated', handleLocalSync);
    window.addEventListener('storage', handleStorageChange);
  }

  // 4. Firestore real-time listener for multi-device sync
  const bannerDocRef = doc(db, 'settings', 'paper_banner');
  const unsubSnapshot = onSnapshot(
    bannerDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<PaperBannerConfig>;
        const merged: PaperBannerConfig = {
          ...DEFAULT_PAPER_BANNER_CONFIG,
          ...data
        };
        try {
          localStorage.setItem('sae_paper_banner_config', JSON.stringify(merged));
        } catch {}
        onUpdate(merged);
      } else {
        onUpdate(DEFAULT_PAPER_BANNER_CONFIG);
      }
    },
    (error) => {
      console.warn('Paper banner Firestore listener error:', error);
      try {
        const cached = localStorage.getItem('sae_paper_banner_config');
        if (cached) {
          onUpdate({ ...DEFAULT_PAPER_BANNER_CONFIG, ...JSON.parse(cached) });
          return;
        }
      } catch {}
      onUpdate(DEFAULT_PAPER_BANNER_CONFIG);
    }
  );

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('sae_paper_banner_updated', handleLocalSync);
      window.removeEventListener('storage', handleStorageChange);
    }
    unsubSnapshot();
  };
}

// Update Spanduk Sobekan Kertas Configuration in Firestore & instant local broadcast
export async function savePaperBannerConfig(
  config: Partial<PaperBannerConfig>,
  userIdentifier: string
): Promise<void> {
  const bannerDocRef = doc(db, 'settings', 'paper_banner');
  const payload: PaperBannerConfig = {
    imageUrl: typeof config.imageUrl === 'string' ? config.imageUrl : (DEFAULT_PAPER_BANNER_CONFIG.imageUrl ?? ''),
    enabled: config.enabled !== undefined ? config.enabled : (DEFAULT_PAPER_BANNER_CONFIG.enabled ?? true),
    offsetX: typeof config.offsetX === 'number' ? config.offsetX : (DEFAULT_PAPER_BANNER_CONFIG.offsetX ?? 0),
    offsetY: typeof config.offsetY === 'number' ? config.offsetY : (DEFAULT_PAPER_BANNER_CONFIG.offsetY ?? 20),
    scale: typeof config.scale === 'number' ? config.scale : (DEFAULT_PAPER_BANNER_CONFIG.scale ?? 100),
    rotate: typeof config.rotate === 'number' ? config.rotate : (DEFAULT_PAPER_BANNER_CONFIG.rotate ?? -2),
    opacity: typeof config.opacity === 'number' ? config.opacity : (DEFAULT_PAPER_BANNER_CONFIG.opacity ?? 100),
    title: typeof config.title === 'string' ? config.title : (DEFAULT_PAPER_BANNER_CONFIG.title ?? ''),
    updatedAt: new Date().toISOString(),
    updatedBy: userIdentifier
  };

  // 1. Immediately store to localStorage and dispatch custom event for instant UI update
  try {
    localStorage.setItem('sae_paper_banner_config', JSON.stringify(payload));
    if (typeof window !== 'undefined') {
      queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent('sae_paper_banner_updated', { detail: payload }));
      });
    }
  } catch (storageErr) {
    console.warn('Failed to save paper banner to localStorage:', storageErr);
  }

  // 2. Persist to Firestore
  try {
    await setDoc(bannerDocRef, payload, { merge: true });
  } catch (error) {
    console.error('Firestore save failed for paper banner, fallback to local storage:', error);
    handleFirestoreError(error, OperationType.WRITE, PAPER_BANNER_SETTINGS_PATH);
  }
}

// Subscribe to 5 Banners Configuration from Firestore
export function subscribeBannersConfig(
  onUpdate: (banners: BannerItem[]) => void
): Unsubscribe {
  // Check local cache first for instant render
  try {
    const cached = localStorage.getItem('sae_banners_config');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        onUpdate(parsed);
      }
    }
  } catch {
    // ignore
  }

  const bannersDocRef = doc(db, 'settings', 'banners');

  return onSnapshot(
    bannersDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as BannersConfig;
        if (Array.isArray(data.banners) && data.banners.length > 0) {
          localStorage.setItem('sae_banners_config', JSON.stringify(data.banners));
          onUpdate(data.banners);
          return;
        }
      }
      onUpdate(DEFAULT_BANNERS);
    },
    (error) => {
      console.warn('Banners listener error:', error);
      try {
        const cached = localStorage.getItem('sae_banners_config');
        if (cached) {
          onUpdate(JSON.parse(cached));
          return;
        }
      } catch {
        // ignore
      }
      onUpdate(DEFAULT_BANNERS);
    }
  );
}

// Update 5 Banners Configuration in Firestore
export async function saveBannersConfig(banners: BannerItem[], userIdentifier: string): Promise<void> {
  const bannersDocRef = doc(db, 'settings', 'banners');
  const payload: BannersConfig = {
    banners,
    updatedAt: new Date().toISOString(),
    updatedBy: userIdentifier,
  };

  try {
    await setDoc(bannersDocRef, payload, { merge: true });
    localStorage.setItem('sae_banners_config', JSON.stringify(banners));
  } catch (error) {
    localStorage.setItem('sae_banners_config', JSON.stringify(banners));
    handleFirestoreError(error, OperationType.WRITE, BANNERS_SETTINGS_PATH);
  }
}

// Google Auth for Admin
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return res.user;
  } catch (err: unknown) {
    const firebaseError = err as { code?: string; message?: string };
    const code = firebaseError?.code || '';
    if (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/popup-blocked'
    ) {
      // User closed or browser blocked popup - handle gently without red console errors
      console.warn('Google Sign-in popup was closed or dismissed by user');
      return null;
    }
    console.warn('Google Sign-in notice:', firebaseError?.message || err);
    return null;
  }
}

export async function logoutAdmin(): Promise<void> {
  await fbSignOut(auth);
}

// Background Wallpaper Settings
export interface BackgroundConfig {
  imageUrl?: string;
  opacity: number; // 10 to 70 (%)
  blur: number; // 0 to 8 (px)
  scale: number; // 100 to 125 (%)
  updatedAt: string;
  updatedBy?: string;
}

export const DEFAULT_BACKGROUND_CONFIG: BackgroundConfig = {
  imageUrl: '/src/assets/images/user_monas_sunset_bg.jpg',
  opacity: 100,
  blur: 0,
  scale: 100,
  updatedAt: new Date().toISOString(),
  updatedBy: 'system'
};

const BACKGROUND_SETTINGS_PATH = 'settings/background';

// Subscribe to Background Settings from Firestore
export function subscribeBackgroundConfig(
  onUpdate: (config: BackgroundConfig) => void
): Unsubscribe {
  try {
    const cached = localStorage.getItem('sae_bg_config');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.imageUrl && parsed.imageUrl.includes('sae_home_wallpaper')) {
        parsed.imageUrl = '/src/assets/images/user_monas_sunset_bg.jpg';
        localStorage.setItem('sae_bg_config', JSON.stringify(parsed));
      }
      onUpdate({ ...DEFAULT_BACKGROUND_CONFIG, ...parsed });
    }
  } catch {
    // ignore
  }

  const bgDocRef = doc(db, 'settings', 'background');

  return onSnapshot(
    bgDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as BackgroundConfig;
        if (data.imageUrl && data.imageUrl.includes('sae_home_wallpaper')) {
          data.imageUrl = '/src/assets/images/user_monas_sunset_bg.jpg';
        }
        const merged = { ...DEFAULT_BACKGROUND_CONFIG, ...data };
        localStorage.setItem('sae_bg_config', JSON.stringify(merged));
        onUpdate(merged);
      } else {
        onUpdate(DEFAULT_BACKGROUND_CONFIG);
      }
    },
    (error) => {
      console.warn('Background listener error:', error);
      try {
        const cached = localStorage.getItem('sae_bg_config');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.imageUrl && parsed.imageUrl.includes('sae_home_wallpaper')) {
            parsed.imageUrl = '/src/assets/images/user_monas_sunset_bg.jpg';
          }
          onUpdate({ ...DEFAULT_BACKGROUND_CONFIG, ...parsed });
        }
      } catch {
        onUpdate(DEFAULT_BACKGROUND_CONFIG);
      }
    }
  );
}

// Save Background Settings to Firestore
export async function saveBackgroundConfig(
  config: Partial<BackgroundConfig>,
  userIdentifier: string
): Promise<void> {
  const bgDocRef = doc(db, 'settings', 'background');
  const payload: BackgroundConfig = {
    imageUrl: config.imageUrl || DEFAULT_BACKGROUND_CONFIG.imageUrl,
    opacity: config.opacity ?? 30,
    blur: config.blur ?? 2,
    scale: config.scale ?? 105,
    updatedAt: new Date().toISOString(),
    updatedBy: userIdentifier
  };

  try {
    await setDoc(bgDocRef, payload, { merge: true });
    localStorage.setItem('sae_bg_config', JSON.stringify(payload));
  } catch (error) {
    localStorage.setItem('sae_bg_config', JSON.stringify(payload));
    handleFirestoreError(error, OperationType.WRITE, BACKGROUND_SETTINGS_PATH);
  }
}

// ================= VISITOR ANALYTICS (REAL TRACKING OPSI B) =================
export interface DailyVisitorStat {
  date: string;
  visitors: number;
  pageViews: number;
}

export interface VisitorAnalytics {
  totalVisitors: number;
  pageViews: number;
  suggestionsCount: number;
  history: DailyVisitorStat[];
  isLive: boolean;
}

function getRecent7Days(): DailyVisitorStat[] {
  const days: DailyVisitorStat[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dayStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    days.push({
      date: dayStr,
      visitors: 0,
      pageViews: 0
    });
  }
  return days;
}

export const DEFAULT_ANALYTICS: VisitorAnalytics = {
  totalVisitors: 1,
  pageViews: 1,
  suggestionsCount: 0,
  history: getRecent7Days(),
  isLive: true
};

const ANALYTICS_PATH = 'analytics/overview';

// Record a page view and new visitor session
export async function recordPageView(): Promise<void> {
  try {
    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const isNewVisitor = !sessionStorage.getItem('sae_session_recorded');
    if (isNewVisitor) {
      sessionStorage.setItem('sae_session_recorded', 'true');
    }

    const analyticsDocRef = doc(db, 'analytics', 'overview');
    const snapshot = await getDoc(analyticsDocRef);

    let current: VisitorAnalytics = DEFAULT_ANALYTICS;
    if (snapshot.exists()) {
      current = { ...DEFAULT_ANALYTICS, ...(snapshot.data() as VisitorAnalytics) };
    } else {
      const cached = localStorage.getItem('sae_analytics_cache');
      if (cached) {
        try {
          current = { ...DEFAULT_ANALYTICS, ...JSON.parse(cached) };
        } catch {}
      }
    }

    const totalVisitors = current.totalVisitors + (isNewVisitor ? 1 : 0);
    const pageViews = current.pageViews + 1;

    // Ensure 7 days history exists
    const recentDays = getRecent7Days();
    const historyMap = new Map<string, DailyVisitorStat>();
    (current.history || []).forEach(h => historyMap.set(h.date, h));

    const updatedHistory = recentDays.map(day => {
      const existing = historyMap.get(day.date) || { ...day };
      if (day.date === todayStr) {
        return {
          date: day.date,
          visitors: existing.visitors + (isNewVisitor ? 1 : 0),
          pageViews: existing.pageViews + 1
        };
      }
      return existing;
    });

    const payload: VisitorAnalytics = {
      totalVisitors,
      pageViews,
      suggestionsCount: current.suggestionsCount || 0,
      history: updatedHistory,
      isLive: true
    };

    localStorage.setItem('sae_analytics_cache', JSON.stringify(payload));
    await setDoc(analyticsDocRef, payload, { merge: true });
  } catch (err) {
    console.warn('Analytics record local fallback:', err);
  }
}

// Subscribe to Live Visitor Analytics from Firestore
export function subscribeVisitorAnalytics(
  onUpdate: (data: VisitorAnalytics) => void
): Unsubscribe {
  try {
    const cached = localStorage.getItem('sae_analytics_cache');
    if (cached) {
      onUpdate({ ...DEFAULT_ANALYTICS, ...JSON.parse(cached) });
    } else {
      onUpdate(DEFAULT_ANALYTICS);
    }
  } catch {
    onUpdate(DEFAULT_ANALYTICS);
  }

  const analyticsDocRef = doc(db, 'analytics', 'overview');

  return onSnapshot(
    analyticsDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as VisitorAnalytics;
        const merged = { ...DEFAULT_ANALYTICS, ...data };
        localStorage.setItem('sae_analytics_cache', JSON.stringify(merged));
        onUpdate(merged);
      } else {
        onUpdate(DEFAULT_ANALYTICS);
      }
    },
    (err) => {
      console.warn('Visitor analytics listener error:', err);
      try {
        const cached = localStorage.getItem('sae_analytics_cache');
        if (cached) {
          onUpdate({ ...DEFAULT_ANALYTICS, ...JSON.parse(cached) });
        }
      } catch {}
    }
  );
}

// ================= ETALASE MITRA (KATALOG PROMO TOKO DINAMIS) =================
export interface StoreItem {
  id: string;
  name: string;
  platform: 'Shopee' | 'Tokopedia' | 'TikTok' | 'WhatsApp' | 'Website' | 'Instagram';
  promoBadge?: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon?: string;
  stores: StoreItem[];
}

export interface EtalaseConfig {
  headerBadge: string;
  headerTitle: string;
  headerSubtitle: string;
  categories: CategoryItem[];
  updatedAt: string;
  updatedBy?: string;
}

export const DEFAULT_ETALASE_CONFIG: EtalaseConfig = {
  headerBadge: '✨ SPOTLIGHT PROMO & PARTNER',
  headerTitle: 'Koleksi & Promo Toko Pilihan',
  headerSubtitle: 'Jelajahi penawaran menarik dari brand fashion & beauty mitra SAE untuk lengkapi penampilan terbaikmu.',
  categories: [
    {
      id: 'cat_fashion',
      name: 'Fashion & Outfit',
      icon: '👗',
      stores: [
        {
          id: 'store_1',
          name: 'Zahra Studio Official',
          platform: 'Shopee',
          promoBadge: 'Diskon 25%',
          description: 'Koleksi kemeja linen pastel & celana kulot kasual wanita.',
          imageUrl: '/src/assets/images/hero_model_1791792817383.jpg',
          targetUrl: 'https://shopee.co.id',
          isActive: true
        },
        {
          id: 'store_2',
          name: 'Urban Monochrome Man',
          platform: 'Tokopedia',
          promoBadge: 'Gratis Ongkir',
          description: 'Outfit streetwear modern, kaos heavyweight, dan jaket vintage.',
          imageUrl: '/src/assets/images/chibi_mascot_1791792832762.jpg',
          targetUrl: 'https://tokopedia.com',
          isActive: true
        },
        {
          id: 'store_3',
          name: 'Knitwear & Cozy Wear',
          platform: 'TikTok',
          promoBadge: 'Flash Sale 30%',
          description: 'Kardigan rajut lembut warna earth tone untuk outfit ngopi.',
          imageUrl: '/src/assets/images/sae_mascot.png',
          targetUrl: 'https://tiktok.com',
          isActive: true
        },
        {
          id: 'store_4',
          name: 'Blazer & Smart Office',
          platform: 'WhatsApp',
          promoBadge: 'Official Partner',
          description: 'Setelan semi-formal dan blazer kerja elegan siap kirim.',
          imageUrl: '/src/assets/images/glass_bg_1791792847652.jpg',
          targetUrl: 'https://wa.me',
          isActive: true
        }
      ]
    },
    {
      id: 'cat_makeup',
      name: 'Make Up & Beauty',
      icon: '💄',
      stores: [
        {
          id: 'store_5',
          name: 'Glow Velvet Cosmetics',
          platform: 'Shopee',
          promoBadge: 'Cashback 20%',
          description: 'Lip tint tahan lama & cushion hasil glowing alami.',
          imageUrl: '/src/assets/images/hero_model_1791792817383.jpg',
          targetUrl: 'https://shopee.co.id',
          isActive: true
        },
        {
          id: 'store_6',
          name: 'Beauty Bloom Official',
          platform: 'TikTok',
          promoBadge: 'Beli 1 Gratis 1',
          description: 'Palet eyeshadow warna netral untuk riasan sehari-hari.',
          imageUrl: '/src/assets/images/chibi_mascot_1791792832762.jpg',
          targetUrl: 'https://tiktok.com',
          isActive: true
        },
        {
          id: 'store_7',
          name: 'Bare & Clean Makeup',
          platform: 'Tokopedia',
          promoBadge: 'Diskon 15%',
          description: 'Bedak tabur ringan dan eyeliner presisi anti luntur.',
          imageUrl: '/src/assets/images/sae_mascot.png',
          targetUrl: 'https://tokopedia.com',
          isActive: true
        },
        {
          id: 'store_8',
          name: 'Studio Beauty Lounge',
          platform: 'Website',
          promoBadge: 'New Release',
          description: 'Perawatan bibir organik dan blush on warna peach segar.',
          imageUrl: '/src/assets/images/glass_bg_1791792847652.jpg',
          targetUrl: 'https://sae.studio',
          isActive: true
        }
      ]
    },
    {
      id: 'cat_skincare',
      name: 'Skincare & Glow',
      icon: '✨',
      stores: [
        {
          id: 'store_9',
          name: 'Pure Sunscreen Lab',
          platform: 'Shopee',
          promoBadge: 'Top Seller',
          description: 'Tabir surya ringan tanpa white-cast untuk pelindung harian.',
          imageUrl: '/src/assets/images/glass_bg_1791792847652.jpg',
          targetUrl: 'https://shopee.co.id',
          isActive: true
        },
        {
          id: 'store_10',
          name: 'Hydra Barrier Serum',
          platform: 'Tokopedia',
          promoBadge: 'Hemat 30%',
          description: 'Serum pelembab intensif penjaga skin barrier sehat.',
          imageUrl: '/src/assets/images/hero_model_1791792817383.jpg',
          targetUrl: 'https://tokopedia.com',
          isActive: true
        },
        {
          id: 'store_11',
          name: 'Organic Face Mist',
          platform: 'TikTok',
          promoBadge: 'Gratis Ongkir',
          description: 'Face mist penyegar wajah saat beraktivitas di luar ruangan.',
          imageUrl: '/src/assets/images/chibi_mascot_1791792832762.jpg',
          targetUrl: 'https://tiktok.com',
          isActive: true
        },
        {
          id: 'store_12',
          name: 'Botanical Bodycare',
          platform: 'WhatsApp',
          promoBadge: 'Fast Response',
          description: 'Body lotion beraroma menenangkan melembabkan kulit seharian.',
          imageUrl: '/src/assets/images/sae_mascot.png',
          targetUrl: 'https://wa.me',
          isActive: true
        }
      ]
    },
    {
      id: 'cat_shoes',
      name: 'Sepatu & Sandal',
      icon: '👟',
      stores: [
        {
          id: 'store_13',
          name: 'Footwear Atelier',
          platform: 'Shopee',
          promoBadge: 'Diskon 35%',
          description: 'Sepatu loafers kulit sintetis premium dan chunky sneakers.',
          imageUrl: '/src/assets/images/hero_model_1791792817383.jpg',
          targetUrl: 'https://shopee.co.id',
          isActive: true
        },
        {
          id: 'store_14',
          name: 'Comfy Step Sandals',
          platform: 'TikTok',
          promoBadge: 'Voucher 50K',
          description: 'Sandal platform empuk cocok untuk santai dan hangout.',
          imageUrl: '/src/assets/images/chibi_mascot_1791792832762.jpg',
          targetUrl: 'https://tiktok.com',
          isActive: true
        },
        {
          id: 'store_15',
          name: 'Classic White Kicks',
          platform: 'Tokopedia',
          promoBadge: 'Best Value',
          description: 'Sneakers putih klasik serbaguna untuk segala setelan baju.',
          imageUrl: '/src/assets/images/sae_mascot.png',
          targetUrl: 'https://tokopedia.com',
          isActive: true
        },
        {
          id: 'store_16',
          name: 'Formal Heeled Boots',
          platform: 'Website',
          promoBadge: 'Eksklusif',
          description: 'Boots elegan berhak nyaman untuk melengkapi gaya chic.',
          imageUrl: '/src/assets/images/glass_bg_1791792847652.jpg',
          targetUrl: 'https://sae.studio',
          isActive: true
        }
      ]
    },
    {
      id: 'cat_bags',
      name: 'Tas & Aksesoris',
      icon: '👜',
      stores: [
        {
          id: 'store_17',
          name: 'Minimalist Tote & Bag',
          platform: 'Shopee',
          promoBadge: 'Diskon 20%',
          description: 'Tas selempang kulit vegan & totebag kanvas muat laptop.',
          imageUrl: '/src/assets/images/hero_model_1791792817383.jpg',
          targetUrl: 'https://shopee.co.id',
          isActive: true
        },
        {
          id: 'store_18',
          name: 'Vintage Eyewear Studio',
          platform: 'TikTok',
          promoBadge: 'Gratis Case',
          description: 'Kacamata frame retro pelindung radiasi UV gaya.',
          imageUrl: '/src/assets/images/chibi_mascot_1791792832762.jpg',
          targetUrl: 'https://tiktok.com',
          isActive: true
        },
        {
          id: 'store_19',
          name: 'Gold & Silver Jewelry',
          platform: 'Tokopedia',
          promoBadge: 'Koleksi Baru',
          description: 'Kalung dan cincin titanium anti karat penambah pesona outfit.',
          imageUrl: '/src/assets/images/sae_mascot.png',
          targetUrl: 'https://tokopedia.com',
          isActive: true
        },
        {
          id: 'store_20',
          name: 'Classic Leather Watch',
          platform: 'WhatsApp',
          promoBadge: 'Garansi 1 Thn',
          description: 'Jam tangan strap kulit vintage desain simpel elegan.',
          imageUrl: '/src/assets/images/glass_bg_1791792847652.jpg',
          targetUrl: 'https://wa.me',
          isActive: true
        }
      ]
    },
    {
      id: 'cat_fragrance',
      name: 'Parfum & Wewangian',
      icon: '🌸',
      stores: [
        {
          id: 'store_21',
          name: 'Aroma Atelier Indonesia',
          platform: 'Shopee',
          promoBadge: 'Diskon 40%',
          description: 'Extrait de parfum aroma vanila hangat & segar tahan 12 jam.',
          imageUrl: '/src/assets/images/hero_model_1791792817383.jpg',
          targetUrl: 'https://shopee.co.id',
          isActive: true
        },
        {
          id: 'store_22',
          name: 'Ocean Breeze Perfumery',
          platform: 'Tokopedia',
          promoBadge: 'Free Tester',
          description: 'Wangi kesegaran laut dan citrus penambah rasa percaya diri.',
          imageUrl: '/src/assets/images/chibi_mascot_1791792832762.jpg',
          targetUrl: 'https://tokopedia.com',
          isActive: true
        },
        {
          id: 'store_23',
          name: 'Scented Aura Daily',
          platform: 'TikTok',
          promoBadge: 'Beli 2 Murah',
          description: 'Body mist aroma bunga sakura lembut untuk hangout santai.',
          imageUrl: '/src/assets/images/sae_mascot.png',
          targetUrl: 'https://tiktok.com',
          isActive: true
        },
        {
          id: 'store_24',
          name: 'Niche Oud & Amber',
          platform: 'WhatsApp',
          promoBadge: 'Premium Luxury',
          description: 'Parfum woody mewah untuk acara formal dan malam hari.',
          imageUrl: '/src/assets/images/glass_bg_1791792847652.jpg',
          targetUrl: 'https://wa.me',
          isActive: true
        }
      ]
    }
  ],
  updatedAt: new Date().toISOString(),
  updatedBy: 'system'
};

const ETALASE_SETTINGS_PATH = 'settings/etalase';

// Subscribe to Live Etalase Configuration from Firestore
export function subscribeEtalaseConfig(
  onUpdate: (config: EtalaseConfig) => void
): Unsubscribe {
  try {
    const cached = localStorage.getItem('sae_etalase_cache');
    if (cached) {
      onUpdate({ ...DEFAULT_ETALASE_CONFIG, ...JSON.parse(cached) });
    } else {
      onUpdate(DEFAULT_ETALASE_CONFIG);
    }
  } catch {
    onUpdate(DEFAULT_ETALASE_CONFIG);
  }

  const etalaseDocRef = doc(db, 'settings', 'etalase');

  return onSnapshot(
    etalaseDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as EtalaseConfig;
        const merged = { ...DEFAULT_ETALASE_CONFIG, ...data };
        localStorage.setItem('sae_etalase_cache', JSON.stringify(merged));
        onUpdate(merged);
      } else {
        onUpdate(DEFAULT_ETALASE_CONFIG);
      }
    },
    (err) => {
      console.warn('Etalase listener error:', err);
      try {
        const cached = localStorage.getItem('sae_etalase_cache');
        if (cached) {
          onUpdate({ ...DEFAULT_ETALASE_CONFIG, ...JSON.parse(cached) });
        }
      } catch {}
    }
  );
}

// Save Etalase Configuration to Firestore
export async function saveEtalaseConfig(
  config: EtalaseConfig,
  userIdentifier: string
): Promise<void> {
  const etalaseDocRef = doc(db, 'settings', 'etalase');
  const payload: EtalaseConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
    updatedBy: userIdentifier
  };

  try {
    await setDoc(etalaseDocRef, payload, { merge: true });
    localStorage.setItem('sae_etalase_cache', JSON.stringify(payload));
  } catch (error) {
    localStorage.setItem('sae_etalase_cache', JSON.stringify(payload));
    handleFirestoreError(error, OperationType.WRITE, ETALASE_SETTINGS_PATH);
  }
}

export { onAuthStateChanged };
