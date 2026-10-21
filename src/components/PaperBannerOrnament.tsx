import React from 'react';
import { PaperBannerConfig } from '../services/firebase';

interface PaperBannerOrnamentProps {
  config: PaperBannerConfig;
}

export const PaperBannerOrnament: React.FC<PaperBannerOrnamentProps> = ({ config }) => {
  if (!config.enabled) return null;

  return (
    <div
      className="absolute pointer-events-none transition-transform duration-300 z-15"
      style={{
        transform: `translate(${config.offsetX}px, ${config.offsetY}px) scale(${config.scale / 100}) rotate(${config.rotate}deg)`,
        opacity: config.opacity / 100,
      }}
    >
      {config.imageUrl ? (
        <img
          src={config.imageUrl}
          alt="Paper Banner Ornament"
          className="max-w-[280px] drop-shadow-md"
        />
      ) : (
        <div className="relative px-4 py-2 bg-amber-50 border border-amber-200/90 rounded-md shadow-sm text-center">
          <span className="font-handwritten text-xs text-amber-900 font-bold">
            {config.title || 'Inspirasi Gaya Hari Ini'}
          </span>
        </div>
      )}
    </div>
  );
};
