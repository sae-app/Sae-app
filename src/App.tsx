/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeOneScreenView } from './components/HomeOneScreenView';
import { BottomNavBar, NavTab } from './components/BottomNavBar';
import { ResultsView } from './components/ResultsView';
import { DiscoverView } from './components/DiscoverView';
import { OutfitScannerModal } from './components/Modals/OutfitScannerModal';
import { InspirationModal } from './components/Modals/InspirationModal';
import { TipsModal } from './components/Modals/TipsModal';
import { MoodBoosterModal } from './components/Modals/MoodBoosterModal';
import { NotificationDrawer } from './components/Modals/NotificationDrawer';
import { ProfileDrawer } from './components/Modals/ProfileDrawer';
import { WallpaperSwitcherModal } from './components/Modals/WallpaperSwitcherModal';
import { AdminPortal } from './components/Admin/AdminPortal';
import { 
  testFirestoreConnection, 
  subscribeBackgroundConfig, 
  BackgroundConfig, 
  DEFAULT_BACKGROUND_CONFIG,
  recordPageView
} from './services/firebase';
import { ScanHistoryItem } from './types/scanner';

const DEFAULT_SCAN_HISTORY: ScanHistoryItem[] = [
  {
    id: 'scan_initial_1',
    timestamp: new Date().toISOString(),
    formattedDate: 'Hari ini, 08:30 WIB',
    imageUrl: '/src/assets/images/hero_model_1791792817383.jpg',
    data: {
      detectedPeopleCount: 1,
      shotType: 'half-body',
      overallVibe: 'Kasual Bersih & Penuh Percaya Diri',
      vibeTag: 'Main Character Energy ✨',
      palette: [
        { name: 'Sky Denim', hex: '#60a5fa' },
        { name: 'Putih Bersih', hex: '#ffffff' },
        { name: 'Navy Malam', hex: '#1e293b' }
      ],
      people: [
        {
          identifier: 'Kamu (Pemeran Utama)',
          outfitDetected: 'Kemeja denim terbuka dengan kaos putih bersih berpotongan pas',
          validation: 'Validasi SAE: Kombinasi ini jujur bikin mata segar! Bukan pakaian yang mahal yang bikin keren, tapi caramu membawakan diri dengan pundak santai dan senyum hangat. Ini tipe gaya yang bikin orang lain mikir: "Wah, dia orangnya asik dan approachable banget".',
          humorTweak: 'Sentuhan Kilat 30 Detik: Coba buka senyum 2 milimeter lebih lebar, dan biarkan jam tangan di pergelangan sedikit mengintip. Auto ganteng/cantik maksimal tanpa effort!',
          specialPraise: 'Siluet leher dan bahu sangat proporsional dengan potongan kerah ini.'
        }
      ],
      saeVerdict: 'Validasi SAE: 100% Sah & Percaya Diri! Hari ini giliranmu bersinar.',
      quickTips: [
        'Sneakers putih bersih bakal menyempurnakan look santai ini.',
        'Wangi parfum citrus segar bakal melengkapi auramu seharian.'
      ],
      timeContext: 'Sangat cocok untuk suasana pagi & siang hari yang dinamis'
    }
  },
  {
    id: 'scan_initial_2',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    formattedDate: 'Kemarin, 14:15 WIB',
    imageUrl: '/src/assets/images/glass_bg_1791792847652.jpg',
    data: {
      detectedPeopleCount: 2,
      shotType: 'full-body',
      duoVibeTitle: 'Duo Santai tapi Kharismatik 😎',
      duoVibeDescription: 'Chemistry kalian berdua luar biasa sinkron! Pilihan warna yang saling mengimbangi bikin look berdua tampak harmonis tanpa kelihatan sengaja kembaran.',
      overallVibe: 'Sinergi Bestie Hangout Asik',
      vibeTag: 'Dynamic Duo Vibes ⚡',
      palette: [
        { name: 'Earthy Beige', hex: '#d6c7b2' },
        { name: 'Forest Olive', hex: '#3f4f3e' },
        { name: 'Charcoal Black', hex: '#1c1917' }
      ],
      people: [
        {
          identifier: 'Orang 1 (Kiri)',
          outfitDetected: 'Atasan earth tone dengan potongan rileks',
          validation: 'Validasi SAE: Aura tenang tapi berwibawa! Pilihan warna netral ini memberi kesan matang, cerdas, dan hangat.',
          humorTweak: 'Sentuhan Kilat 30 Detik: Masukkan sedikit ujung depan baju ke dalam celana (french tuck) biar ilusi kaki kelihatan lebih jenjang 5 cm!',
          specialPraise: 'Postur berdiri sangat stabil dan memancarkan rasa percaya diri alami.'
        },
        {
          identifier: 'Orang 2 (Kanan)',
          outfitDetected: 'Layering santai dengan celana gelap beraksen rapi',
          validation: 'Validasi SAE: Sangat ekspresif dan hidup! Kamu menghidupkan suasana foto ini dengan senyum yang menular.',
          humorTweak: 'Sentuhan Kilat 30 Detik: Atur kerah pakaian tetap simetris, auto aura selebriti candid!',
          specialPraise: 'Energi positifmu terpancar jelas dari tatapan matamu.'
        }
      ],
      saeVerdict: 'Validasi SAE: Sah sebagai Duo Paling Estetik hari ini!',
      quickTips: [
        'Kalian berdua punya gaya khas masing-masing yang saling melengkapi.',
        'Foto ini layak banget diabadikan dan diposting.'
      ],
      timeContext: 'Suasana santai sore hari / coffee shop date'
    }
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [inspirationOpen, setInspirationOpen] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [moodOpen, setMoodOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [wallpaperOpen, setWallpaperOpen] = useState(false);
  const [bgConfig, setBgConfig] = useState<BackgroundConfig>(DEFAULT_BACKGROUND_CONFIG);

  // Scan Results & History State
  const [latestScan, setLatestScan] = useState<ScanHistoryItem | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('sae_scan_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_SCAN_HISTORY;
  });

  const handleScanSuccess = (newItem: ScanHistoryItem) => {
    setLatestScan(newItem);
    setScanHistory((prev) => {
      const updated = [newItem, ...prev.filter((item) => item.id !== newItem.id)];
      try {
        localStorage.setItem('sae_scan_history', JSON.stringify(updated.slice(0, 30)));
      } catch (e) {
        console.warn('Local storage history save warning:', e);
      }
      return updated;
    });
    setScannerOpen(false);
    setActiveTab('results');
  };

  const handleDeleteHistoryItem = (id: string) => {
    setScanHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('sae_scan_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update history', e);
      }
      return updated;
    });
    if (latestScan?.id === id) {
      setLatestScan(null);
    }
  };

  // Check URL routing or hash for #admin and test Firestore connection & subscribe background & record pageview
  useEffect(() => {
    testFirestoreConnection();
    recordPageView();

    const unsubBg = subscribeBackgroundConfig((cfg) => {
      setBgConfig(cfg);
    });

    if (window.location.hash === '#admin' || window.location.pathname.includes('/admin')) {
      setAdminOpen(true);
    }

    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setAdminOpen(true);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      unsubBg();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleNavTabChange = (tab: NavTab) => {
    if (tab === 'profile') {
      setProfileOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="w-full h-[100dvh] max-h-[100dvh] bg-slate-900/10 sm:bg-slate-900/30 flex items-center justify-center overflow-hidden select-none overscroll-none">
      {/* Smartphone Viewport Container (Edge-to-edge on phones, sleek frame on desktop) */}
      <div className="relative w-full h-[100dvh] max-h-[100dvh] sm:max-w-[412px] sm:h-[96dvh] sm:max-h-[844px] bg-[#E9E5D9] overflow-hidden sm:rounded-[40px] shadow-[0_25px_65px_-15px_rgba(52,54,64,0.38)] sm:border-[7px] sm:border-slate-800/15 flex flex-col justify-between transition-all">
        
        {/* Ambient Room / City Wallpaper Background (Wallpaper Bersih Tanpa Maskot) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={bgConfig.imageUrl && !bgConfig.imageUrl.includes('sae_home_wallpaper') ? bgConfig.imageUrl : "/src/assets/images/user_monas_sunset_bg.jpg"}
            alt="SAE Wallpaper Background"
            referrerPolicy="no-referrer"
            style={{
              opacity: typeof bgConfig.opacity === 'number' ? Math.max(0.1, bgConfig.opacity / 100) : 1,
              filter: `blur(${bgConfig.blur ?? 0}px)`,
              transform: `scale(${Math.max(100, bgConfig.scale ?? 100) / 100})`
            }}
            className="w-full h-full object-cover object-center transition-all duration-700"
          />

          {/* Soft multi-layered gradient meshes for readability on left hero text */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Top Header with integrated PWA Install button & Notifications (Disembunyikan di menu Toko dan My Results sesuai permintaan) */}
        {activeTab !== 'discover' && activeTab !== 'results' && (
          <Header
            onOpenNotifications={() => setNotificationsOpen(true)}
            onOpenAdmin={() => setAdminOpen(true)}
            unreadCount={2}
          />
        )}

        {/* Center Screen Content (1-Screen Pure Viewport Sesuai Desain Referensi) */}
        <main className={`relative z-10 flex-1 min-h-0 flex flex-col justify-between ${activeTab === 'home' ? 'overflow-visible' : 'overflow-hidden'}`}>
          {activeTab === 'home' && (
            <HomeOneScreenView
              onStartAnalysis={() => setScannerOpen(true)}
              onOpenInspiration={() => setInspirationOpen(true)}
              onOpenTips={() => setTipsOpen(true)}
              onOpenStyleTrend={() => setMoodOpen(true)}
            />
          )}

          {activeTab === 'discover' && (
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <DiscoverView
                onBackToHome={() => setActiveTab('home')}
                onOpenScan={() => setScannerOpen(true)}
              />
            </div>
          )}

          {activeTab === 'results' && (
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <ResultsView
                onBackToHome={() => setActiveTab('home')}
                onOpenScan={() => setScannerOpen(true)}
                latestItem={latestScan}
                historyItems={scanHistory}
                onDeleteHistoryItem={handleDeleteHistoryItem}
              />
            </div>
          )}
        </main>

        {/* Bottom Floating Navigation Bar */}
        <BottomNavBar
          activeTab={activeTab}
          onChangeTab={handleNavTabChange}
          onOpenScan={() => setScannerOpen(true)}
        />

        {/* Interactive Modals and Drawers */}
        <OutfitScannerModal
          isOpen={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onScanSuccess={handleScanSuccess}
        />
        <InspirationModal
          isOpen={inspirationOpen}
          onClose={() => setInspirationOpen(false)}
        />
        <TipsModal
          isOpen={tipsOpen}
          onClose={() => setTipsOpen(false)}
        />
        <MoodBoosterModal
          isOpen={moodOpen}
          onClose={() => setMoodOpen(false)}
        />
        <NotificationDrawer
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />
        <ProfileDrawer
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
          onOpenAdmin={() => setAdminOpen(true)}
        />
        <WallpaperSwitcherModal
          isOpen={wallpaperOpen}
          onClose={() => setWallpaperOpen(false)}
          currentConfig={bgConfig}
          onApplyConfig={(newCfg: BackgroundConfig) => setBgConfig(newCfg)}
        />
        <AdminPortal
          isOpen={adminOpen}
          onClose={() => {
            setAdminOpen(false);
            if (window.location.hash === '#admin') {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
        />
      </div>
    </div>
  );
}
