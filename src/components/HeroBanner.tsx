import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { subscribeBannersConfig, BannerItem, DEFAULT_BANNERS } from '../services/firebase';

interface HeroBannerProps {
  onStartCheck?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onStartCheck }) => {
  const [banners, setBanners] = useState<BannerItem[]>(DEFAULT_BANNERS);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Subscribe to real-time banner changes from Firebase
  useEffect(() => {
    const unsubscribe = subscribeBannersConfig((updatedBanners) => {
      setBanners(updatedBanners);
    });
    return () => unsubscribe();
  }, []);

  // Auto-advance spanduk setiap 4.5 detik
  useEffect(() => {
    if (isPaused || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, banners.length]);

  // Touch Swipe Handlers untuk kemudahan geser di HP
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    } else if (diff < -40) {
      setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    }
    touchStartX.current = null;
    setIsPaused(false);
  };

  return (
    <div
      className="relative mx-3.5 my-1 shrink-0 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Outer Glow Halo */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-300/30 via-indigo-200/20 to-cyan-300/30 rounded-[28px] blur-lg opacity-70 pointer-events-none" />

      {/* Main Glassmorphic Container (Tinggi Terkunci Presisi: h-[204px], Anti-Lompat Ukuran) */}
      <div className="relative overflow-hidden rounded-[26px] glass-panel border border-white/85 shadow-[0_10px_30px_-10px_rgba(37,99,235,0.16)] h-[204px]">
        {/* Subtle decorative glowing light swirls */}
        <div className="absolute -top-10 -left-10 w-36 h-36 bg-blue-300/25 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-8 right-8 w-36 h-36 bg-cyan-200/30 rounded-full blur-xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

        {/* Carousel Stack */}
        {banners.map((slide, index) => {
          const isActive = currentSlide === index;
          const hasImage = Boolean(slide.imageUrl && slide.imageUrl.trim().length > 0);

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {hasImage ? (
                slide.layoutType === 'hero-full' ? (
                  /* Slide Full Background Hero */
                  <div className="relative w-full h-full p-4 flex flex-col justify-between overflow-hidden">
                    {/* Full background image */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        referrerPolicy="no-referrer"
                        style={{
                          transform: `scale(${(slide.imageZoom || 100) / 100})`,
                          objectPosition: slide.imagePosition === 'center' ? 'center' : slide.imagePosition === 'bottom' ? 'bottom' : 'top'
                        }}
                        className={`w-full h-full ${slide.imageFit === 'contain' ? 'object-contain' : 'object-cover'} transition-transform duration-300`}
                      />
                      {/* Gradient overlay for readability */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/30" />
                    </div>

                    <div className="relative z-10 max-w-[70%]">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-handwritten text-lg sm:text-xl font-bold text-blue-600 tracking-wide drop-shadow-xs">
                          {slide.tagline || 'Spanduk ' + (index + 1)}
                        </span>
                        <span className="text-blue-500 text-xs">◡̈</span>
                      </div>
                      <h2 className="text-[15.5px] sm:text-[17.5px] leading-[1.22] font-bold text-slate-800 tracking-tight mb-1 line-clamp-2">
                        {slide.title}
                      </h2>
                      <p className="text-[11px] sm:text-[11.5px] text-slate-600 font-medium leading-[1.35] line-clamp-2">
                        {slide.subtitle}
                      </p>
                    </div>

                    {slide.actionText && (
                      <div className="relative z-10">
                        <button
                          onClick={onStartCheck}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 shadow-xs cursor-pointer group"
                        >
                          <span>{slide.actionText}</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Slide Split Layout (Teks Kiri, Gambar Kanan) */
                  <div className="relative flex items-stretch w-full h-full p-3.5 sm:p-4 pb-6">
                    {/* Left Text Column */}
                    <div className="w-[58%] z-10 flex flex-col justify-center pr-1 py-1">
                      {/* Tagline / Greeting */}
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-handwritten text-lg sm:text-xl font-bold text-blue-600 tracking-wide drop-shadow-xs">
                          {slide.tagline || 'Spanduk ' + (index + 1)}
                        </span>
                        <span className="text-blue-500 text-xs">◡̈</span>
                      </div>

                      {/* Headline */}
                      <h2 className="text-[15.5px] sm:text-[17.5px] leading-[1.22] font-bold text-slate-800 tracking-tight mb-1.5 line-clamp-3">
                        {slide.title}
                      </h2>

                      {/* Subtitle */}
                      <p className="text-[11px] sm:text-[11.5px] text-slate-500 font-medium leading-[1.35] max-w-[210px] line-clamp-2">
                        {slide.subtitle}
                      </p>

                      {slide.actionText && (
                        <button
                          onClick={onStartCheck}
                          className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 w-fit cursor-pointer group"
                        >
                          <span>{slide.actionText}</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </div>

                    {/* Right Image Mask */}
                    <div className="absolute right-0 top-0 bottom-0 w-[48%] overflow-hidden pointer-events-none">
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={slide.imageUrl}
                          alt={slide.title}
                          referrerPolicy="no-referrer"
                          style={{
                            transform: `scale(${(slide.imageZoom || 100) / 100})`,
                            objectPosition: slide.imagePosition === 'center' ? 'center' : slide.imagePosition === 'bottom' ? 'bottom' : 'top'
                          }}
                          className={`w-full h-full ${slide.imageFit === 'contain' ? 'object-contain' : 'object-cover'} transition-transform duration-300`}
                        />

                        {/* Soft Gradient Masks */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent w-14" />
                        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/60 to-transparent" />
                        <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white/40 to-transparent" />
                        <div className="absolute inset-0 border-l border-white/60 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )
              ) : (
                /* Slide Tanpa Gambar (Desain Grafis Tipografis Elegan) */
                <div className="relative flex flex-col justify-center p-5 pb-7 w-full h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-100/70 border border-blue-200/60 flex items-center justify-center text-blue-600 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/50">
                      {slide.tagline || `Spanduk SAE ${index + 1}`}
                    </span>
                  </div>

                  <h3 className="text-[16px] sm:text-[18px] font-bold text-slate-800 leading-snug line-clamp-2 max-w-[310px]">
                    {slide.title}
                  </h3>
                  <p className="text-[11.5px] text-slate-500 mt-1.5 line-clamp-2 max-w-[310px] leading-relaxed">
                    {slide.subtitle}
                  </p>

                  {slide.actionText && (
                    <div className="mt-3">
                      <button
                        onClick={onStartCheck}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <span>{slide.actionText}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* 5 Dots Carousel Pagination Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Buka spanduk ${index + 1}`}
              className={`transition-all duration-300 cursor-pointer ${
                currentSlide === index
                  ? 'w-5 h-1.5 rounded-full bg-blue-600 shadow-xs ring-1 ring-white'
                  : 'w-1.5 h-1.5 rounded-full bg-slate-300/80 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
