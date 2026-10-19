import React, { useState, useEffect, useMemo } from 'react';
import { 
  Store, 
  ShoppingBag, 
  Sparkles, 
  Search, 
  ExternalLink, 
  Bookmark, 
  Tag, 
  MessageCircle,
  Share2,
  Check,
  Filter
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
        label: 'TikTok Shop'
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
  // Default to first category (tidak ada opsi "Semua Kategori")
  const [selectedCatId, setSelectedCatId] = useState<string>(
    DEFAULT_ETALASE_CONFIG.categories[0]?.id || 'cat_fashion'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [savedStores, setSavedStores] = useState<string[]>([]);
  const [copiedStoreId, setCopiedStoreId] = useState<string | null>(null);

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

  // Filter stores in the active category according to search query
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

  return (
    <div className="px-3 sm:px-4 py-2 space-y-3 animate-in fade-in duration-200 pb-20 select-none">
      {/* ================= 1. CLEAN & SLIM EDITORIAL HEADER (HEMAT RUANG) ================= */}
      <div className="pt-1 pb-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/80 text-[10px] font-extrabold text-blue-700 tracking-wider uppercase border border-blue-200/60 shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
              <span>{config.headerBadge || 'SPOTLIGHT MITRA'}</span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
              {config.headerTitle || 'Etalase Toko & Promo Pilihan'}
            </h2>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-500 bg-white/80 border border-slate-200 px-2 py-1 rounded-full shadow-2xs">
              {activeCategory?.stores?.filter((s) => s.isActive).length || 0} Toko Siap Cek
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-snug line-clamp-1">
          {config.headerSubtitle ||
            'Jelajahi penawaran spesial dari mitra brand fashion & beauty terpercaya SAE.'}
        </p>

        {/* Compact Search Bar */}
        <div className="relative pt-0.5">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari toko atau promo di ${activeCategory?.name || 'kategori ini'}...`}
            className="w-full pl-8.5 pr-8 py-1.5 text-xs rounded-2xl bg-white/90 border border-slate-200 text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
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
      </div>

      {/* ================= 2. BAR KATEGORI DINAMIS (TANPA "SEMUA KATEGORI") ================= */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-700">
            <Filter className="w-3 h-3 text-blue-600" />
            <span>Kategori Toko Mitra</span>
            <span className="text-[10px] font-bold text-slate-400">
              ({config.categories?.length || 0})
            </span>
          </div>
        </div>

        {/* Scrollable Category Pills Slider - Only pure categories */}
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
                    : 'bg-white/85 hover:bg-white text-slate-600 border border-slate-200/90 shadow-2xs hover:border-slate-300'
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
      </div>

      {/* ================= 3. SLOT KARTU SPANDUK TOKO MITRA (RASIO 2:1 MINI BILLBOARD) ================= */}
      {displayedStores.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200 text-center space-y-2.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">Tidak ada toko ditemukan</h4>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xs mx-auto">
              {searchQuery
                ? `Tidak ada toko yang cocok dengan "${searchQuery}".`
                : `Belum ada toko promosi di kategori ${activeCategory.name}.`}
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
            >
              Reset Pencarian
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayedStores.map((store) => {
            const platformStyle = getPlatformStyle(store.platform);
            const isSaved = savedStores.includes(store.id);
            const isCopied = copiedStoreId === store.id;

            return (
              <div
                key={store.id}
                onClick={() => handleVisitStore(store.targetUrl)}
                className="group relative w-full aspect-[2/1] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/80 cursor-pointer select-none"
              >
                {/* 1. Background Spanduk Foto dengan Rasio 2:1 Penuh */}
                <img
                  src={store.imageUrl || '/src/assets/images/hero_model_1791792817383.jpg'}
                  alt={store.name}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500"
                  loading="lazy"
                />

                {/* 2. Sinematik Glassmorphism Overlay (Gradasi Bawah Lebih Pekat agar Teks Sangat Jelas) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25 pointer-events-none" />

                {/* 3. Baris Atas: Badge Platform & Promo + Actions */}
                <div className="relative z-10 p-2.5 sm:p-3.5 flex items-center justify-between">
                  {/* Platform Badge */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border backdrop-blur-md shadow-xs ${platformStyle.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${platformStyle.dot}`} />
                      <span>{platformStyle.label}</span>
                    </span>

                    {/* Promo Badge */}
                    {store.promoBadge && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/95 text-white font-black text-[9.5px] shadow-xs backdrop-blur-md border border-rose-400/40">
                        <Tag className="w-2.5 h-2.5" />
                        <span>{store.promoBadge}</span>
                      </span>
                    )}
                  </div>

                  {/* Share & Bookmark Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleShareStore(store, e)}
                      title="Bagikan link toko"
                      className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border border-white/20"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3 h-3" />
                      )}
                    </button>

                    <button
                      onClick={(e) => toggleSaveStore(store.id, e)}
                      title="Simpan toko favorit"
                      className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border border-white/20"
                    >
                      <Bookmark
                        className={`w-3 h-3 ${isSaved ? 'text-amber-400 fill-amber-400' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                {/* 4. Baris Bawah: Nama Toko, Deskripsi Singkat & Tombol Kunjungi Ramping */}
                <div className="absolute inset-x-0 bottom-0 z-10 p-2.5 sm:p-3.5 flex items-end justify-between gap-2.5">
                  <div className="space-y-0.5 max-w-[70%] sm:max-w-[75%]">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-white text-xs sm:text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-tight line-clamp-1">
                        {store.name}
                      </h3>
                      <span className="text-emerald-400 text-[10px] font-black" title="Mitra Terverifikasi">
                        ✓
                      </span>
                    </div>

                    <p className="text-[10px] sm:text-[11px] text-slate-200/90 leading-tight line-clamp-1 drop-shadow-xs">
                      {store.description}
                    </p>
                  </div>

                  {/* Tombol Kunjungi ↗ Ramping */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVisitStore(store.targetUrl);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10.5px] sm:text-xs shadow-md shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-blue-400/40 shrink-0"
                  >
                    <span>Kunjungi</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= 4. SLIM PARTNERSHIP CALL TO ACTION ================= */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-white shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-[11px] sm:text-xs text-white truncate">
              Ingin Toko Anda Ada di Sini?
            </h4>
            <p className="text-[9.5px] text-slate-400 truncate">
              Pasang banner promosi toko Anda di Etalase SAE.
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
          <span>Mitra Toko</span>
        </button>
      </div>
    </div>
  );
};
