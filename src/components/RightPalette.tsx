import React, { useState } from 'react';
import { PaintTool, ColorPreset } from '../types';
import { playPop, playMagic, playSpray, playBoing } from '../utils/audio';

interface RightPaletteProps {
  activeTool: PaintTool;
  onSelectTool: (tool: PaintTool) => void;
  activeColor: string;
  activeColorType: 'solid' | 'glitter' | 'pattern';
  onSelectColor: (preset: ColorPreset) => void;
  activeStickerEmoji: string;
  onSelectSticker: (emoji: string) => void;
  stickerSize: number;
  onStickerSizeChange: (size: number) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onClearStickers?: () => void;
}

export const RightPalette: React.FC<RightPaletteProps> = ({
  activeTool,
  onSelectTool,
  activeColor,
  activeColorType,
  onSelectColor,
  activeStickerEmoji,
  onSelectSticker,
  stickerSize,
  onStickerSizeChange,
  brushSize,
  onBrushSizeChange,
  onUndo,
  onRedo,
  onClearStickers,
}) => {
  // Main Tabs: 'paint' (Boya & Renkler), 'accessories' (Aksesuarlar & Süsler)
  const [tab, setTab] = useState<'paint' | 'accessories'>(() =>
    activeTool === 'sticker' ? 'accessories' : 'paint'
  );

  // Sub-category for colors
  const [colorCategory, setColorCategory] = useState<'solid' | 'glitter' | 'pattern'>('solid');

  // Sub-category for accessories
  const [accessoryCat, setAccessoryCat] = useState<'hats' | 'glasses' | 'wings' | 'sweets'>('hats');

  const solidColors: ColorPreset[] = [
    { id: 'pink', color: '#ffb3ba', name: 'Pastel Pembe', type: 'solid' },
    { id: 'peach', color: '#ffdfba', name: 'Şeftali', type: 'solid' },
    { id: 'yellow', color: '#ffffba', name: 'Limon Sarısı', type: 'solid' },
    { id: 'mint', color: '#baffc9', name: 'Nane Ferahlığı', type: 'solid' },
    { id: 'sky', color: '#bae1ff', name: 'Buz Mavisi', type: 'solid' },
    { id: 'lavender', color: '#e0baff', name: 'Lavanta Rüyası', type: 'solid' },
    { id: 'rose', color: '#ff94a8', name: 'Gül Kurusu', type: 'solid' },
    { id: 'lilac', color: '#d946ef', name: 'Lila', type: 'solid' },
    { id: 'white', color: '#ffffff', name: 'Bulut Beyazı', type: 'solid' },
    { id: 'gray', color: '#94a3b8', name: 'Gümüş Gri', type: 'solid' },
    { id: 'brown', color: '#b45309', name: 'Tarçın', type: 'solid' },
    { id: 'black', color: '#1e293b', name: 'Gece Siyahı', type: 'solid' },
  ];

  const glitterColors: ColorPreset[] = [
    { id: 'gold_glitter', color: '#facc15', name: 'Altın Sim', type: 'glitter' },
    { id: 'silver_glitter', color: '#e2e8f0', name: 'Gümüş Kristal', type: 'glitter' },
    { id: 'pink_glitter', color: '#f472b6', name: 'Pembe Elmas', type: 'glitter' },
    { id: 'emerald_glitter', color: '#34d399', name: 'Zümrüt Pırıltısı', type: 'glitter' },
    { id: 'purple_glitter', color: '#c084fc', name: 'Mor Galaksi', type: 'glitter' },
    { id: 'ocean_glitter', color: '#38bdf8', name: 'Okyanus Işıltısı', type: 'glitter' },
  ];

  const patternColors: ColorPreset[] = [
    { id: 'rainbow', color: 'rainbow', patternId: 'rainbow', name: 'Gökkuşağı', type: 'pattern' },
    { id: 'hearts', color: 'hearts', patternId: 'hearts', name: 'Minik Kalpler', type: 'pattern' },
    { id: 'stars', color: 'stars', patternId: 'stars', name: 'Işıldayan Yıldızlar', type: 'pattern' },
    { id: 'polka_dots', color: 'polka_dots', patternId: 'polka_dots', name: 'Renkli Puantiye', type: 'pattern' },
    { id: 'spots', color: 'spots', patternId: 'spots', name: 'İnek Benekleri', type: 'pattern' },
    { id: 'stripes', color: 'stripes', patternId: 'stripes', name: 'Şeker Çizgileri', type: 'pattern' },
  ];

  const accessories = {
    hats: { label: 'Şapkalar', icon: '👑', emojis: ['👑', '🎩', '🎀', '🥳', '🌸', '🧢'] },
    glasses: { label: 'Gözlükler', icon: '🕶️', emojis: ['🕶️', '👓', '😎', '🥸', '🩹', '👄'] },
    wings: { label: 'Büyü', icon: '🪽', emojis: ['🪽', '🦋', '✨', '🪄', '🎈', '🌈'] },
    sweets: { label: 'Tatlılar', icon: '🍭', emojis: ['💖', '🥇', '🍦', '🍓', '💎', '⭐'] },
  };

  const currentEmojiList = accessories[accessoryCat].emojis;

  // Keep colorCategory synced with activeColorType from props
  React.useEffect(() => {
    if (activeColorType) {
      setColorCategory(activeColorType);
    }
  }, [activeColorType]);

  // Color Category Tabs
  return (
    <aside
      aria-label="Boyama ve Aksesuar Paneli"
      className="w-36 xs:w-40 sm:w-44 md:w-52 bg-white/95 backdrop-blur-lg rounded-[2.5rem] border-4 border-sky-100/90 shadow-2xl p-2.5 sm:p-3.5 flex flex-col items-center gap-3.5 max-h-[92vh] overflow-y-auto z-10 kawaii-scrollbar select-none"
    >
      {/* 1. Main Mode Tabs */}
      <div className="flex flex-col gap-2 w-full shrink-0">
        <button
          onClick={() => {
            playPop();
            setTab('paint');
            if (activeTool === 'sticker') onSelectTool('brush');
          }}
          className={`w-full py-3 px-3 rounded-2xl text-[11px] sm:text-xs font-black transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer btn-press ${
            tab === 'paint'
              ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white ring-4 ring-sky-100 shadow-lg scale-[1.02]'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200/80'
          }`}
        >
          <span className="text-base sm:text-lg filter drop-shadow-sm">🎨</span>
          <span>Boya & Renkler</span>
        </button>

        <button
          onClick={() => {
            playMagic();
            setTab('accessories');
            onSelectTool('sticker');
            onSelectSticker(activeStickerEmoji || '👑');
          }}
          className={`w-full py-3 px-3 rounded-2xl text-[11px] sm:text-xs font-black transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer btn-press ${
            tab === 'accessories'
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 ring-4 ring-amber-100 shadow-lg scale-[1.02]'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200/80'
          }`}
        >
          <span className="text-base sm:text-lg filter drop-shadow-sm">💖</span>
          <span>Aksesuarlar</span>
        </button>
      </div>

      <div className="w-full h-[2px] bg-slate-100/80 rounded-full shrink-0" />

      {/* VIEW A: PAINT & COLORS */}
      {tab === 'paint' && (
        <div className="flex flex-col gap-3.5 w-full">
          {/* Custom Color Picker at the TOP */}
          <label className="relative w-full h-11 rounded-2xl bg-gradient-to-r from-red-500 via-amber-400 via-emerald-400 via-sky-500 to-purple-500 p-1 flex items-center justify-center cursor-pointer shadow-md hover:scale-[1.02] active:scale-98 transition-all duration-200 group shrink-0 border-2 border-white/80">
            <input
              type="color"
              value={activeColor.startsWith('#') ? activeColor : '#ef4444'}
              onChange={(e) => onSelectColor({ id: 'custom', color: e.target.value, name: 'Özel', type: 'solid' })}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <span className="text-[11px] sm:text-xs font-black text-white drop-shadow-md flex items-center gap-1.5 tracking-tight">
              <span>🌈</span>
              <span>Özel Renk Seç</span>
            </span>
          </label>

          {/* Brush/Bucket/Spray/Eraser Tools */}
          <div className="grid grid-cols-2 gap-2 w-full">
            {[
              { id: 'brush', icon: '🖌️', label: 'Fırça', bg: 'from-sky-400 to-blue-500' },
              { id: 'bucket', icon: '🪣', label: 'Kova', bg: 'from-amber-400 to-orange-400' },
              { id: 'spray', icon: '🖍️', label: 'Sprey', bg: 'from-rose-400 to-red-500' },
              { id: 'eraser', icon: '🧹', label: 'Silgi', bg: 'from-purple-400 to-pink-500' },
            ].map((t) => {
              const isActive = activeTool === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    t.id === 'spray' ? playSpray() : playPop();
                    onSelectTool(t.id as PaintTool);
                  }}
                  className={`h-14 sm:h-15 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer btn-press border-2 ${
                    isActive
                      ? `bg-gradient-to-tr ${t.bg} text-white scale-105 border-white ring-4 ring-sky-100 shadow-lg -translate-y-0.5`
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200/80 hover:-translate-y-0.5'
                  }`}
                >
                  <span className="text-xl sm:text-2xl filter drop-shadow-2xs">{t.icon}</span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Visual Brush Sizes */}
          <div className="flex flex-col items-center gap-1.5 w-full bg-slate-50/90 p-2 sm:p-2.5 rounded-2xl border border-slate-200/80">
            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <span>📐</span> Fırça Boyutu
            </span>
            <div className="grid grid-cols-3 gap-1.5 w-full">
              {[
                { sz: 4, label: 'İnce', dotSize: 'w-1.5 h-1.5' },
                { sz: 12, label: 'Orta', dotSize: 'w-2.5 h-2.5' },
                { sz: 24, label: 'Kalın', dotSize: 'w-3.5 h-3.5' },
              ].map((item) => {
                const isActive = brushSize === item.sz;
                return (
                  <button
                    key={item.sz}
                    onClick={() => {
                      playPop();
                      onBrushSizeChange(item.sz);
                    }}
                    className={`h-9 rounded-xl text-[10px] font-black flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all duration-200 btn-press border ${
                      isActive
                        ? 'bg-sky-500 text-white border-sky-600 shadow-md scale-105'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`${item.dotSize} rounded-full ${isActive ? 'bg-white' : 'bg-slate-600'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Category Tabs */}
          <div className="grid grid-cols-3 gap-1 w-full bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80">
            {[
              { id: 'solid', label: 'Düz', icon: '🎨' },
              { id: 'glitter', label: 'Simli', icon: '✨' },
              { id: 'pattern', label: 'Desen', icon: '🏁' },
            ].map((cat) => {
              const isActive = colorCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    cat.id === 'solid' ? playPop() : playMagic();
                    setColorCategory(cat.id as any);
                    if (cat.id === 'solid') onSelectColor(solidColors[0]);
                    else if (cat.id === 'glitter') onSelectColor(glitterColors[0]);
                    else if (cat.id === 'pattern') onSelectColor(patternColors[0]);
                  }}
                  className={`py-2 px-1 rounded-xl text-[9px] sm:text-[10px] font-black transition-all duration-200 text-center cursor-pointer flex items-center justify-center gap-1 btn-press ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200 scale-[1.02]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="text-xs">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Color Grid Container with Ultra-Soft Near-White Kawaii Pastel Background */}
          <div className="relative w-full p-2.5 rounded-[1.75rem] bg-gradient-to-br from-white via-pink-50/70 to-purple-50/60 border-2 border-pink-200/70 shadow-sm shadow-pink-100/40 overflow-hidden flex flex-col items-center">
            {/* Subtle Kawaii Decorative Background Accents */}
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden select-none">
              <span className="absolute top-1 left-1.5 text-[10px] opacity-20 filter drop-shadow-2xs">✨</span>
              <span className="absolute top-1.5 right-1.5 text-[10px] opacity-20 filter drop-shadow-2xs">💖</span>
              <span className="absolute bottom-1.5 left-2 text-[10px] opacity-20 filter drop-shadow-2xs">⭐</span>
              <span className="absolute bottom-1 right-2 text-[10px] opacity-20 filter drop-shadow-2xs">🌸</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 w-full justify-items-center relative z-10 py-0.5">
              {(colorCategory === 'solid' ? solidColors : colorCategory === 'glitter' ? glitterColors : patternColors).map((preset) => {
                const isSelected = (activeColor === preset.color || activeColor === preset.patternId) && activeColorType === preset.type;

                let bgStyle: React.CSSProperties = { backgroundColor: preset.color };
                if (preset.type === 'glitter') {
                  bgStyle = {
                    backgroundColor: preset.color,
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.85) 12%, transparent 16%)',
                    backgroundSize: '8px 8px',
                  };
                } else if (preset.type === 'pattern') {
                  if (preset.patternId === 'rainbow') bgStyle = { background: 'linear-gradient(to right, #ef4444, #facc15, #38bdf8, #a855f7)' };
                  else if (preset.patternId === 'hearts') bgStyle = { backgroundColor: '#fbcfe8' };
                  else if (preset.patternId === 'stars') bgStyle = { backgroundColor: '#0f172a' };
                  else if (preset.patternId === 'stripes') bgStyle = { background: 'repeating-linear-gradient(45deg, #ec4899, #ec4899 5px, #ffffff 5px, #ffffff 10px)' };
                  else bgStyle = { backgroundColor: '#ffffff', border: '1px solid #e2e8f0' };
                }

                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      playPop();
                      onSelectColor(preset);
                    }}
                    style={bgStyle}
                    title={preset.name}
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full shadow-md border-3 border-white transition-all duration-200 flex items-center justify-center cursor-pointer btn-press ${
                      isSelected
                        ? 'scale-125 ring-4 ring-pink-400 shadow-xl z-10 -translate-y-0.5'
                        : 'hover:scale-110 hover:-translate-y-0.5'
                    }`}
                  >
                    {preset.type === 'pattern' && (
                      <span className="text-sm filter drop-shadow-2xs">
                        {preset.patternId === 'rainbow' ? '🌈' : preset.patternId === 'hearts' ? '💖' : preset.patternId === 'stars' ? '⭐' : '🍭'}
                      </span>
                    )}
                    {isSelected && preset.type !== 'pattern' && (
                      <span className="text-white text-xs drop-shadow-md font-black">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 w-full mt-1">
            <button
              onClick={onUndo}
              className="py-2.5 bg-purple-50 hover:bg-purple-100 active:bg-purple-200 text-purple-700 rounded-2xl text-[10px] sm:text-[11px] font-black transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer border-2 border-purple-200 btn-press shadow-xs"
            >
              <span className="text-xs">↩️</span>
              <span>Geri Al</span>
            </button>
            <button
              onClick={onRedo}
              className="py-2.5 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 rounded-2xl text-[10px] sm:text-[11px] font-black transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer border-2 border-indigo-200 btn-press shadow-xs"
            >
              <span className="text-xs">↪️</span>
              <span>Yinele</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW B: ACCESSORIES & STICKERS */}
      {tab === 'accessories' && (
        <div className="flex flex-col gap-3.5 w-full">
          {/* Accessory Categories */}
          <div className="grid grid-cols-2 gap-1.5 w-full bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
            {Object.entries(accessories).map(([key, data]) => {
              const isActive = accessoryCat === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    playPop();
                    setAccessoryCat(key as any);
                  }}
                  className={`py-2 px-1 rounded-xl text-[9px] sm:text-[10px] font-black flex flex-col items-center justify-center transition-all duration-200 cursor-pointer btn-press ${
                    isActive ? 'bg-white text-amber-700 shadow-sm border border-slate-200 scale-[1.02]' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="text-base sm:text-lg">{data.icon}</span>
                  <span>{data.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sticker Sizes */}
          <div className="flex flex-col items-center gap-1.5 w-full bg-amber-50/90 p-2 sm:p-2.5 rounded-2xl border border-amber-200/80">
            <span className="text-[9px] sm:text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-1">
              <span>✨</span> Etiket Boyutu
            </span>
            <div className="grid grid-cols-3 gap-1.5 w-full">
              {[
                { label: 'Minik', val: 0.45, dotSize: 'w-1.5 h-1.5' },
                { label: 'Normal', val: 0.65, dotSize: 'w-2.5 h-2.5' },
                { label: 'Büyük', val: 0.9, dotSize: 'w-3.5 h-3.5' },
              ].map((sz) => {
                const isActive = stickerSize === sz.val;
                return (
                  <button
                    key={sz.label}
                    onClick={() => {
                      playPop();
                      onStickerSizeChange(sz.val);
                    }}
                    className={`h-9 rounded-xl text-[10px] font-black flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all duration-200 btn-press border ${
                      isActive
                        ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-md scale-105'
                        : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-100/50'
                    }`}
                  >
                    <div className={`${sz.dotSize} rounded-full ${isActive ? 'bg-amber-950' : 'bg-amber-600'}`} />
                    <span>{sz.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emoji Grid */}
          <div className="grid grid-cols-3 gap-2.5 w-full justify-items-center py-1">
            {currentEmojiList.map((emoji, idx) => {
              const isSelected = activeTool === 'sticker' && activeStickerEmoji === emoji;
              return (
                <button
                  key={`${emoji}_${idx}`}
                  onClick={() => {
                    playBoing();
                    onSelectSticker(emoji);
                  }}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-200 cursor-pointer btn-press border-2 ${
                    isSelected
                      ? 'bg-amber-200 border-amber-400 scale-125 ring-4 ring-amber-300 shadow-xl z-10 -translate-y-0.5'
                      : 'bg-white hover:bg-amber-50 border-slate-200/80 hover:-translate-y-0.5 hover:shadow-md'
                  }`}
                >
                  <span className="filter drop-shadow-2xs">{emoji}</span>
                </button>
              );
            })}
          </div>

          {/* Control Buttons */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="grid grid-cols-2 gap-1.5 w-full">
              <button
                onClick={onUndo}
                className="py-2.5 bg-purple-50 hover:bg-purple-100 active:bg-purple-200 text-purple-700 rounded-2xl text-[10px] sm:text-[11px] font-black transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer border-2 border-purple-200 btn-press shadow-xs"
              >
                <span className="text-xs">↩️</span>
                <span>Geri Al</span>
              </button>
              <button
                onClick={onRedo}
                className="py-2.5 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 rounded-2xl text-[10px] sm:text-[11px] font-black transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer border-2 border-indigo-200 btn-press shadow-xs"
              >
                <span className="text-xs">↪️</span>
                <span>Yinele</span>
              </button>
            </div>
            <button
              onClick={onClearStickers}
              className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 rounded-2xl text-[10px] sm:text-[11px] font-black transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border-2 border-rose-200 btn-press shadow-xs"
            >
              <span className="text-xs">🗑️</span>
              <span>Süsleri Temizle</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
