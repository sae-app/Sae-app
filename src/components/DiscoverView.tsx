import React, { useState, useEffect, useMemo } from 'react';
import { 
  Store, 
  ShoppingBag, 
  Sparkles, 
  ExternalLink, 
  Bookmark, 
  Tag, 
  MessageCircle, 
  Share2, 
  Check,
  Search,
  ChevronRight,
  X
} from 'lucide-react';
import { 
  subscribeEtalaseConfig, 
  EtalaseConfig, 
  DEFAULT_ETALASE_CONFIG, 
  StoreItem 
} from '../services/firebase';

interface DiscoverViewProps {
  onBackToHome?: () => void;
  onOpenScan?: () => void;
}

// Platform badge styling helper
const getPlatformStyle = (platform: StoreItem['platform']) => {
  switch (platform) {
    case 'Shopee':
      return {
        bg: 'bg-orange-500/90 text-white border-orange-400/30',
        dot: 'bg-white',
        label: 'Shopee'
      };
    case 'Tokopedia':
      return {
        bg: 'bg-emerald-600/90 text-white border-emerald-400/30',
        dot: 'bg-white',
        label: 'Tokopedia'
      };
    case 'TikTok':
      return {
        bg: 'bg-slate-900/90 text-white border-slate-700/50',
        dot: 'bg-rose-500',
        label: 'TikTok'
      };
    case 'WhatsApp':
      return {
        bg: 'bg-green-600/90 text-white border-green-400/30',
        dot: 'bg-white',
        label: 'WhatsApp'
      };
    case 'Instagram':
      return {
        bg: 'bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white border-pink-400/30',
        dot: 'bg-white',
        label: 'Instagram'
      };
    case 'Website':
    default:
      return {
        bg: 'bg-blue-600/90 text-white border-blue-400/30',
        dot: 'bg-white',
        label: 'Official Web'
      };
  }
};

export const DiscoverView: React.FC<DiscoverViewProps> = () => {
  const [config, setConfig] = useState<EtalaseConfig>(DEFAULT_ETALASE_CONFIG);
  const [selectedCatId, setSelectedCatId] = useState<string>(
    DEFAULT_ETALASE_CONFIG.categories[0]?.id || 'cat_fashion'
  );
  const [savedStores, setSavedStores] = useState<string[]>([]);
  const [copiedStoreId, setCopiedStoreId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Subscribe to live Etalase Configuration from Firestore
  useEffect(() => {
    const unsub = subscribeEtalaseConfig((liveConfig) => {
      if (liveConfig && Array.isArray(liveConfig.categories) && liveConfig.categories.length > 0) {
        setConfig(liveConfig);
        setSelectedCatId((prev) => {
          const exists = liveConfig.categories.some((c) => c.id === prev);
          return exists ? prev : liveConfig.categories[0].id;
        });
      }
    });
    return () => unsub();
  }, []);

  // Load saved bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sae_saved_stores');
      if (saved) setSavedStores(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const toggleSaveStore = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedStores((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('sae_saved_stores', JSON.stringify(next));
      return next;
    });
  };

  const handleShareStore = (store: StoreItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator
        .share({
          title: store.name,
          text: `Cek promo toko ${store.name} di Etalase SAE: ${store.description}`,
          url: store.targetUrl || window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(store.targetUrl || window.location.href);
      setCopiedStoreId(store.id);
      setTimeout(() => setCopiedStoreId(null), 2000);
    }
  };

  const handleVisitStore = (url: string) => {
    if (!url) return;
    const finalUrl =
      url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  // Find currently active category
  const activeCategory = useMemo(() => {
    return (
      config.categories?.find((c) => c.id === selectedCatId) ||
      config.categories?.[0] ||
      DEFAULT_ETALASE_CONFIG.categories[0]
    );
  }, [config, selectedCatId]);

  // Displayed stores in the active category (with search filter if searched)
  const displayedStores = useMemo(() => {
    const list = (activeCategory?.stores || []).filter((s) => s.isActive);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (st) =>
        st.name.toLowerCase().includes(q) ||
        st.description.toLowerCase().includes(q) ||
        st.platform.toLowerCase().includes(q) ||
        (st.promoBadge && st.promoBadge.toLowerCase().includes(q))
    );
  }, [activeCategory, searchQuery]);

  // Featured partner store for the top 2:1 billboard
  const featuredStore: StoreItem = useMemo(() => {
    const activeList = (activeCategory?.stores || []).filter((s) => s.isActive);
    return (
      activeList.find((s) => s.promoBadge) ||
      activeList[0] || {
        id: 'spotlight_default',
        name: 'Spotlight Koleksi Pilihan',
        platform: 'Shopee',
        promoBadge: 'Spesial Minggu Ini',
        description: 'Kurasi outfit dan fashion pilihan terbaik mitra resmi SAE.',
        imageUrl: '/src/assets/images/hero_model_1791792817383.jpg',
        targetUrl: 'https://shopee.co.id',
        isActive: true,
      }
    );
  }, [activeCategory]);

  const featuredPlatformStyle = getPlatformStyle(featuredStore.platform);

  return (
    <div className="w-full px-3 sm:px-4 pt-2.5 pb-24 space-y-3 animate-in fade-in duration-200 select-none">
      
      {/* ========================================================================= */}
      {/* 0. TEKS MURNI DI POJOK KIRI + IKON PENCARIAN DI POJOK KANAN (WARNA PUTIH) */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between px-1 pt-1 pb-0.5">
        <p className="text-[13px] sm:text-[14px] font-bold text-white tracking-tight drop-shadow-[0_1px_5px_rgba(0,0,0,0.7)]">
          Temukan produk terbaik dari mitra kami
        </p>

        <button
          onClick={() => setShowSearch(!showSearch)}
          aria-label="Cari toko atau produk"
          title="Cari toko atau produk"
          className="p-1 rounded-full text-white/90 hover:text-white active:scale-90 transition-all cursor-pointer drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
        >
          {showSearch ? <X className="w-4.5 h-4.5 text-white" /> : <Search className="w-4.5 h-4.5 text-white" />}
        </button>
      </div>

      {/* Bar Pencarian Halus (Muncul saat ikon pencarian ditekan) */}
      {showSearch && (
        <div className="relative animate-in fade-in zoom-in-95 duration-150">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari toko di kategori ${activeCategory?.name || 'ini'}...`}
            autoFocus
            className="w-full pl-8.5 pr-8 py-1.5 text-xs rounded-xl bg-white/95 border border-blue-300 text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SPANDUK BESAR UKURAN 2:1 (HERO BILLBOARD SHOWCASE)                     */}
      {/* ========================================================================= */}
      <div 
        onClick={() => handleVisitStore(featuredStore.targetUrl)}
        className="group relative w-full aspect-[2/1] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-white/70 cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-[0.99]"
      >
        {/* Foto Background Billboard 2:1 */}
        <img
          src={featuredStore.imageUrl || '/src/assets/images/hero_model_1791792817383.jpg'}
          alt={featuredStore.name}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          loading="eager"
        />

        {/* Sinematik Glassmorphism Overlay Gradasi */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20 pointer-events-none" />

        {/* Baris Atas Banner 2:1: Badge Spotlight & Promo */}
        <div className="relative z-10 p-2.5 sm:p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600/90 text-white font-extrabold text-[9.5px] sm:text-[10px] tracking-wide uppercase shadow-sm border border-blue-400/40 backdrop-blur-md">
              <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
              <span>{config.headerBadge || 'SPOTLIGHT PROMO'}</span>
            </span>

            {featuredStore.promoBadge && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/95 text-white font-black text-[9.5px] shadow-sm backdrop-blur-md border border-rose-400/40">
                <Tag className="w-2.5 h-2.5" />
                <span>{featuredStore.promoBadge}</span>
              </span>
            )}
          </div>

          {/* Platform Mini Pill */}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border backdrop-blur-md shadow-xs ${featuredPlatformStyle.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${featuredPlatformStyle.dot}`} />
            <span>{featuredPlatformStyle.label}</span>
          </span>
        </div>

        {/* Baris Bawah Banner 2:1: Judul, Deskripsi & Tombol Cek Promo */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-3.5 flex items-end justify-between gap-2">
          <div className="space-y-0.5 max-w-[72%]">
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-white text-sm sm:text-base tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] line-clamp-1">
                {featuredStore.name}
              </h3>
              <span className="text-emerald-400 text-xs font-black" title="Mitra Resmi Terverifikasi">
                ✓
              </span>
            </div>
            <p className="text-[10.5px] sm:text-[11.5px] text-slate-200/95 line-clamp-1 leading-snug drop-shadow-xs">
              {featuredStore.description}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleVisitStore(featuredStore.targetUrl);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10.5px] sm:text-xs shadow-md shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-blue-400/40 shrink-0"
          >
            <span>Cek Promo</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DUA SISI: LIHAT SEMUA KATEGORI (KIRI) & JELAJAHI TOKO (KANAN) (PUTIH)  */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between px-1 pt-1">
        <span className="text-[13px] sm:text-[14px] font-extrabold text-white tracking-tight drop-shadow-[0_1px_5px_rgba(0,0,0,0.7)]">
          Lihat semua kategori
        </span>
        <button
          onClick={() => {
            const el = document.getElementById('catalog-grid');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="group flex items-center gap-1 text-[12px] sm:text-[13px] font-bold text-white hover:text-amber-200 active:scale-95 transition-all cursor-pointer drop-shadow-[0_1px_5px_rgba(0,0,0,0.7)]"
        >
          <span>Jelajahi toko</span>
          <ChevronRight className="w-4 h-4 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Slider Kapsul Kategori */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
        {(config.categories || []).map((cat) => {
          const isSelected = selectedCatId === cat.id;
          const storeCount = (cat.stores || []).filter((s) => s.isActive).length;

          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCatId(cat.id);
                setSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-102 ring-2 ring-blue-400/30'
                  : 'bg-white/85 hover:bg-white text-slate-700 border border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              <span>{cat.icon || '🛍️'}</span>
              <span>{cat.name}</span>
              <span
                className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {storeCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. GRID KOTAK 1 BARIS 2 PERSEGI KOTAK (ASPECT-SQUARE)                     */}
      {/* ========================================================================= */}
      {displayedStores.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200 text-center space-y-2.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">Tidak ada toko</h4>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xs mx-auto">
              Belum ada toko di kategori {activeCategory.name}.
            </p>
          </div>
        </div>
      ) : (
        <div id="catalog-grid" className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {displayedStores.map((store) => {
            const platformStyle = getPlatformStyle(store.platform);
            const isSaved = savedStores.includes(store.id);
            const isCopied = copiedStoreId === store.id;

            return (
              <div
                key={store.id}
                onClick={() => handleVisitStore(store.targetUrl)}
                className="group relative w-full aspect-square rounded-2xl overflow-hidden border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-[0.98] flex flex-col justify-between"
              >
                {/* 1. Foto Toko Memenuhi Persegi Kotak (1:1 Aspect-Square) */}
                <img
                  src={store.imageUrl || '/src/assets/images/hero_model_1791792817383.jpg'}
                  alt={store.name}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Gradient Overlay Sinematik agar Teks di atas Foto Sangat Terbaca */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30 pointer-events-none" />

                {/* 2. Baris Atas Kotak Persegi: Platform Badge & Simpan/Bagikan */}
                <div className="relative z-10 p-2 sm:p-2.5 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8.5px] font-extrabold border backdrop-blur-md shadow-2xs ${platformStyle.bg}`}>
                    <span className={`w-1 h-1 rounded-full ${platformStyle.dot}`} />
                    <span>{platformStyle.label}</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleShareStore(store, e)}
                      title="Bagikan link toko"
                      className="w-5.5 h-5.5 rounded-full bg-black/45 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border border-white/20"
                    >
                      {isCopied ? (
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-2.5 h-2.5" />
                      )}
                    </button>

                    <button
                      onClick={(e) => toggleSaveStore(store.id, e)}
                      title="Simpan toko favorit"
                      className="w-5.5 h-5.5 rounded-full bg-black/45 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border border-white/20"
                    >
                      <Bookmark
                        className={`w-2.5 h-2.5 ${isSaved ? 'text-amber-400 fill-amber-400' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                {/* 3. Baris Bawah Kotak Persegi: Promo, Nama Toko, Deskripsi & Tombol Kunjungi */}
                <div className="relative z-10 p-2 sm:p-2.5 flex flex-col gap-0.5">
                  {store.promoBadge && (
                    <div className="flex mb-0.5">
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-500/95 text-white font-black text-[8px] shadow-xs backdrop-blur-md border border-rose-400/40">
                        <Tag className="w-2 h-2" />
                        <span className="truncate max-w-[95px]">{store.promoBadge}</span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <h4 className="font-extrabold text-[11px] sm:text-[12px] text-white truncate leading-tight tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {store.name}
                    </h4>
                    <span className="text-emerald-400 text-[9px] font-black shrink-0" title="Terverifikasi">
                      ✓
                    </span>
                  </div>

                  <p className="text-[9.5px] text-slate-200/90 line-clamp-1 leading-tight drop-shadow-xs">
                    {store.description}
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVisitStore(store.targetUrl);
                    }}
                    className="w-full mt-1 py-1 px-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer border border-blue-400/40"
                  >
                    <span>Kunjungi</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FOOTER CALL TO ACTION MITRA TOKO                                       */}
      {/* ========================================================================= */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-white shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-[11px] text-white truncate">
              Ingin Pasang Toko di Sini?
            </h4>
            <p className="text-[9.5px] text-slate-400 truncate">
              Pasang banner etalase toko Anda di SAE.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            window.open(
              'https://wa.me/?text=Halo%20Admin%20SAE,%20saya%20tertarik%20bekerja%20sama%20memasang%20banner%20promosi%20di%20Etalase%20SAE.',
              '_blank'
            );
          }}
          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs shrink-0"
        >
          <MessageCircle className="w-3 h-3" />
          <span>Hubungi</span>
        </button>
      </div>

    </div>
  );
};
