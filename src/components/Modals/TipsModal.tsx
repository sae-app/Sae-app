import React from 'react';
import { X, SlidersHorizontal, BookOpen, CheckCircle, Lightbulb } from 'lucide-react';

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const guides = [
  {
    title: 'Aturan 1/3 dan 2/3 (Golden Ratio Siluet)',
    desc: 'Hindari membagi tubuh 50:50 (atasan sama panjang dengan bawahan). Masukkan atasan ke celana (tuck-in) untuk memberi ilusi kaki lebih jenjang dan proporsi tubuh yang seimbang.',
    badge: 'Proporsi',
  },
  {
    title: 'Memahami Undertone Kulit & Warna Pakaian',
    desc: 'Kulit cool undertone cocok dengan warna biru safir, emerald, dan pastel dingin. Kulit warm undertone bersinar dengan earth tones seperti terracotta, olive green, mustard, dan cream hangat.',
    badge: 'Teori Warna',
  },
  {
    title: 'Prinsip Sandwich Rule Saat Berpakaian',
    desc: 'Padukan warna sepatu dengan warna atasan atau jaketmu (misal: topi/outer biru, celana putih, sepatu biru). Ini menciptakan harmoni visual yang enak dipandang tanpa terlihat memaksa.',
    badge: 'Kombinasi',
  },
  {
    title: 'Capsule Wardrobe 10 Pakaian Esensial',
    desc: 'Investasikan pada 1 kemeja putih berkualitas, 1 celana denim raw cut, 1 blazer netral, 1 celana bahan pleats, dan 1 sepatu kulit/sneakers putih. Bisa dipadukan jadi 30+ look berbeda!',
    badge: 'Dasar Lemari',
  },
];

export const TipsModal: React.FC<TipsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-gradient-to-b from-[#e8f3fc] via-[#f4f9fd] to-[#ffffff] rounded-t-[32px] sm:rounded-[32px] shadow-[0_25px_60px_-15px_rgba(14,116,144,0.3)] border border-sky-200/80 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3.5 border-b border-sky-100/90 bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 tracking-tight">Tips & Panduan Gaya</h3>
              <p className="text-[11px] text-sky-800/70 font-medium">Rahasia tampil lebih stylish & percaya diri</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-600 border border-sky-100 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Guides List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {guides.map((guide, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-teal-50/40 border border-teal-100 shadow-xs hover:border-teal-200 transition-all"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/90 px-2.5 py-0.5 rounded-full">
                  {guide.badge}
                </span>
                <Lightbulb className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">{guide.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{guide.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
