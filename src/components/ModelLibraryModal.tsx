import React, { useState } from 'react';
import { ModelId, ModelCategory } from '../types';
import { CATEGORIES, ALL_MODELS } from '../utils/modelRegistry';
import { playPop, playMagic } from '../utils/audio';
import { X, Sparkles, Check } from 'lucide-react';

interface ModelLibraryModalProps {
  currentModel: ModelId;
  onSelectModel: (id: ModelId) => void;
  onClose: () => void;
}

export const ModelLibraryModal: React.FC<ModelLibraryModalProps> = ({
  currentModel,
  onSelectModel,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<ModelCategory>('classics');

  const filteredModels = ALL_MODELS.filter((m) => m.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white/98 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-2xl border-2 sm:border-4 border-sky-300 flex flex-col gap-3 sm:gap-4 my-auto max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 sm:p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition cursor-pointer"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-sm text-white shrink-0">
            📚
          </div>
          <div>
            <h2 className="text-base sm:text-2xl md:text-3xl font-black text-slate-800 leading-tight">
              3D Karakter & Nesne Kütüphanesi
            </h2>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500">
              Boyamak istediğin kategoriyi seç ve hayal gücünü 3 boyuta taşı! 🎨✨
            </p>
          </div>
        </div>

        {/* Category Tabs - Compact and colorful for kids */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin pt-0.5 px-0.5">
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            const count = ALL_MODELS.filter((m) => m.category === cat.id).length;
            
            // Vibrant theme color per category for kid recognition
            const catColors: Record<string, { bg: string; ring: string }> = {
              classics: { bg: 'from-amber-400 to-orange-500', ring: 'ring-amber-200 border-amber-300' },
              flowers: { bg: 'from-rose-400 to-pink-500', ring: 'ring-pink-200 border-pink-300' },
              animals: { bg: 'from-emerald-400 to-teal-500', ring: 'ring-emerald-200 border-emerald-300' },
              fruits: { bg: 'from-red-400 to-rose-500', ring: 'ring-red-200 border-red-300' },
              vegetables: { bg: 'from-orange-400 to-amber-500', ring: 'ring-orange-200 border-orange-300' },
              houses: { bg: 'from-sky-400 to-indigo-500', ring: 'ring-sky-200 border-sky-300' },
            };
            const currentTheme = catColors[cat.id] || { bg: 'from-sky-500 to-blue-600', ring: 'ring-sky-200 border-sky-400' };

            return (
              <button
                key={cat.id}
                onClick={() => {
                  playPop();
                  setActiveCategory(cat.id);
                }}
                className={`min-h-[40px] sm:min-h-[48px] px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-black text-xs sm:text-sm flex items-center gap-2 transition transform cursor-pointer shrink-0 border-2 active:scale-95 shadow-2xs ${
                  isSelected
                    ? `bg-gradient-to-r ${currentTheme.bg} text-white ${currentTheme.ring} shadow-xs scale-102 ring-2 sm:ring-3`
                    : 'bg-slate-50 text-slate-700 hover:bg-white hover:border-slate-300 border-slate-200'
                }`}
              >
                <span className="text-xl sm:text-2xl filter drop-shadow-2xs">{cat.icon}</span>
                <span className="tracking-tight">{cat.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  isSelected ? 'bg-black/20 text-white' : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Model Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3.5 overflow-y-auto pr-1 max-h-[50vh]">
          {filteredModels.map((model) => {
            const isSelected = currentModel === model.id;
            return (
              <button
                key={model.id}
                onClick={() => {
                  playMagic();
                  onSelectModel(model.id);
                  onClose();
                }}
                className={`p-2.5 sm:p-3.5 rounded-2xl border-2 sm:border-3 text-left transition flex flex-col justify-between gap-1.5 group cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-amber-50/80 ring-2 ring-amber-300 shadow-sm scale-101'
                    : 'border-slate-200 bg-slate-50/90 hover:bg-white hover:border-sky-300 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1.5 rounded-xl bg-white shadow-2xs flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-110 transition-transform">
                    {model.emoji}
                  </div>
                  <h3 className="font-black text-xs sm:text-sm text-slate-800 text-center leading-tight">
                    {model.name}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] font-medium text-slate-500 text-center mt-0.5 leading-snug line-clamp-2">
                    {model.desc}
                  </p>
                </div>

                <div
                  className={`mt-1.5 py-1 px-2 rounded-lg font-black text-[10px] sm:text-xs flex items-center justify-center gap-1 transition ${
                    isSelected
                      ? 'bg-amber-400 text-amber-950'
                      : 'bg-sky-50 text-sky-700 group-hover:bg-sky-500 group-hover:text-white'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Seçili</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Bunu Boya!</span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
