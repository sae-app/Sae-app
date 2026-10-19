import React, { useState } from 'react';
import { X, Sparkles, Heart, Bookmark, Filter } from 'lucide-react';

interface InspirationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inspirations = [
  {
    title: 'Clean Minimalist Everyday',
    category: 'Casual Chic',
    tag: 'Trending',
    rating: '4.9 ★',
    desc: 'Kemeja katun oversized putih + straight denim light blue + sneakers klasik putih.',
    tags: ['Oversized Shirt', 'Light Denim', 'White Sneakers'],
  },
  {
    title: 'Smart Office Layering',
    category: 'Workwear',
    tag: 'Formal',
    rating: '4.8 ★',
    desc: 'Unstructured blazer navy + polo rajut putih + celana wool pleats abu-abu.',
    tags: ['Navy Blazer', 'Knit Polo', 'Wool Trousers'],
  },
  {
    title: 'Weekend Coffee Run',
    category: 'Relaxed',
    tag: 'Casual',
    rating: '5.0 ★',
    desc: 'Kardigan rajut beige lembut + tank top putih + celana linen loose cut.',
    tags: ['Beige Cardigan', 'Loose Linen', 'Tote Bag'],
  },
  {
    title: 'Monochrome Streetwear',
    category: 'Edgy',
    tag: 'Street',
    rating: '4.7 ★',
    desc: 'Jaket bomber hitam matte + kaos boxy hitam + cargo pants charcoal + chunky sneakers.',
    tags: ['Black Bomber', 'Boxy Tee', 'Cargo Charcoal'],
  },
];

export const InspirationModal: React.FC<InspirationModalProps> = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState('Semua');
  const [savedItems, setSavedItems] = useState<number[]>([]);

  if (!isOpen) return null;

  const toggleSave = (index: number) => {
    setSavedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-gradient-to-b from-[#e8f3fc] via-[#f4f9fd] to-[#ffffff] rounded-t-[32px] sm:rounded-[32px] shadow-[0_25px_60px_-15px_rgba(14,116,144,0.3)] border border-sky-200/80 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3.5 border-b border-sky-100/90 bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 tracking-tight">Inspirasi Outfit</h3>
              <p className="text-[11px] text-sky-800/70 font-medium">Ide gaya harian yang cocok untukmu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-600 border border-sky-100 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-sky-100/80 bg-white/50 backdrop-blur-md overflow-x-auto no-scrollbar">
          {['Semua', 'Casual Chic', 'Workwear', 'Relaxed', 'Edgy'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filter === cat
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-xs'
                  : 'bg-white/80 border border-sky-100 text-slate-700 hover:bg-sky-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List of inspirations */}
        <div className="p-6 overflow-y-auto space-y-3.5">
          {inspirations
            .filter((item) => filter === 'Semua' || item.category === filter)
            .map((item, index) => {
              const isSaved = savedItems.includes(index);
              return (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/50 to-white border border-purple-100/80 shadow-xs hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-amber-500 font-semibold">{item.rating}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                    </div>

                    <button
                      onClick={() => toggleSave(index)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                        isSaved
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-purple-600'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" fill={isSaved ? 'white' : 'none'} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mt-2">{item.desc}</p>

                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-purple-50">
                    {item.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] text-slate-500 bg-white px-2 py-1 rounded-full border border-slate-200 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
