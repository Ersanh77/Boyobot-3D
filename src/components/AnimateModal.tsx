import React, { useState } from 'react';
import { WorldId } from '../types';
import confetti from 'canvas-confetti';
import { playFanfare, playMagic, playPop, speakTurkish } from '../utils/audio';
import { Sparkles, Download, Play, RefreshCw, X } from 'lucide-react';

interface AnimateModalProps {
  characterName: string;
  activeWorld: WorldId;
  onSelectWorld: (world: WorldId) => void;
  animationAction: 'dance' | 'jump' | 'fly' | 'confetti';
  onSelectAction: (act: 'dance' | 'jump' | 'fly' | 'confetti') => void;
  onStartAnimation: () => void;
  onClose: () => void;
  story: string;
  isStoryLoading: boolean;
  onRegenerateStory: () => void;
  onDownloadSnapshot: () => void;
}

export const AnimateModal: React.FC<AnimateModalProps> = ({
  characterName,
  activeWorld,
  onSelectWorld,
  animationAction,
  onSelectAction,
  onStartAnimation,
  onClose,
  story,
  isStoryLoading,
  onRegenerateStory,
  onDownloadSnapshot,
}) => {
  const [childName, setChildName] = useState('Usta Ressam');

  const worlds = [
    {
      id: 'space' as WorldId,
      name: 'Uzay',
      tag: 'Yıldızlı Galaksi',
      icon: '🌌',
      desc: 'Gezegenler & Kayan Yıldızlar',
      badgeBg: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      activeRing: 'border-indigo-500 bg-indigo-50 ring-4 ring-indigo-200',
    },
    {
      id: 'chocolate' as WorldId,
      name: 'Çikolata',
      tag: 'Tatlı Krallık',
      icon: '🍫',
      desc: 'Marshmallow & Şeker Ağaçları',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      activeRing: 'border-amber-600 bg-amber-50 ring-4 ring-amber-200',
    },
    {
      id: 'clouds' as WorldId,
      name: 'Bulutlar',
      tag: 'Gökkuşağı Ülkesi',
      icon: '🌈',
      desc: 'Pamuk Bulutlar & Gökkuşağı',
      badgeBg: 'bg-sky-100 text-sky-800 border-sky-200',
      activeRing: 'border-sky-500 bg-sky-50 ring-4 ring-sky-200',
    },
    {
      id: 'forest' as WorldId,
      name: 'Orman',
      tag: 'Büyülü Bahçe',
      icon: '🍄',
      desc: 'Işıldayan Mantarlar & Çimen',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      activeRing: 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-200',
    },
    {
      id: 'dino' as WorldId,
      name: 'Dino Adası',
      tag: 'Tarih Öncesi Macera',
      icon: '🦕',
      desc: 'Volkanlar & Sevimli Dinolar',
      badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
      activeRing: 'border-orange-500 bg-orange-50 ring-4 ring-orange-200',
    },
    {
      id: 'kawaii' as WorldId,
      name: 'Kawaii',
      tag: 'Gökkuşağı Rüyası',
      icon: '💖',
      desc: 'Kalpler, Yıldızlar & Pastel Neşe',
      badgeBg: 'bg-pink-100 text-pink-700 border-pink-200',
      activeRing: 'border-pink-500 bg-pink-50 ring-4 ring-pink-200',
    },
  ];

  const actions = [
    { id: 'dance' as const, name: 'Neşeyle Dans Et', icon: '💃' },
    { id: 'jump' as const, name: 'Zıp Zıp Zıpla', icon: '🦘' },
    { id: 'fly' as const, name: 'Gökyüzünde Uç', icon: '🚀' },
    { id: 'confetti' as const, name: 'Konfeti Püskürt', icon: '🎉' },
  ];

  const handleLaunch = () => {
    playFanfare();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    onStartAnimation();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-2xl border-2 sm:border-4 border-amber-300 flex flex-col gap-3 sm:gap-4 my-auto max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 sm:p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-sm text-white animate-bounce">
            ✨
          </div>
          <div>
            <h2 className="text-base sm:text-2xl font-black text-slate-800 leading-tight">
              Yapay Zekayla Canlandır!
            </h2>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500">
              Boyadığın <span className="text-pink-600 font-bold">{characterName}</span> şimdi hangi
              büyülü dünyada yaşasın?
            </p>
          </div>
        </div>

        {/* World Selection */}
        <div>
          <label className="text-[10px] sm:text-xs font-black text-slate-600 uppercase tracking-wider block mb-1.5">
            1. Büyülü Dünyanı Seç:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {worlds.map((w) => {
              const isSelected = activeWorld === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => {
                    playPop();
                    onSelectWorld(w.id);
                  }}
                  className={`p-2.5 sm:p-3.5 rounded-2xl border-2 sm:border-3 text-left transition transform flex flex-col items-start gap-1 cursor-pointer active:scale-95 group ${
                    isSelected
                      ? `${w.activeRing} scale-102 shadow-md border-current`
                      : 'border-slate-200 bg-slate-50/80 hover:bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-2xl sm:text-4xl filter drop-shadow-2xs group-hover:scale-110 transition-transform">
                      {w.icon}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shadow-2xs ${w.badgeBg}`}>
                      {w.name}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-black text-slate-800 mt-0.5">
                    {w.tag}
                  </span>
                  <span className="text-[9px] sm:text-[11px] font-bold text-slate-500 leading-tight">
                    {w.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Selection */}
        <div>
          <label className="text-[10px] sm:text-xs font-black text-slate-600 uppercase tracking-wider block mb-1.5">
            2. Karakterin Ne Yapsın?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {actions.map((act) => {
              const isSelected = animationAction === act.id;
              return (
                <button
                  key={act.id}
                  onClick={() => {
                    playPop();
                    onSelectAction(act.id);
                  }}
                  className={`py-1.5 px-2 rounded-xl border font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                    isSelected
                      ? 'bg-pink-500 text-white border-pink-600 shadow-sm scale-102'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                  }`}
                >
                  <span>{act.icon}</span>
                  <span>{act.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Story Box */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm sm:text-base">📖</span>
              <span className="text-[10px] sm:text-xs font-black text-sky-900 uppercase tracking-wider">
                Boyobot'un Canlandırma Hikayesi:
              </span>
            </div>

            <button
              onClick={() => {
                playMagic();
                onRegenerateStory();
              }}
              disabled={isStoryLoading}
              className="text-[10px] sm:text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isStoryLoading ? 'animate-spin' : ''}`} />
              Yeni Hikaye
            </button>
          </div>

          <p className="text-[11px] sm:text-xs md:text-sm font-bold text-sky-950 leading-snug italic">
            {isStoryLoading ? (
              <span className="flex items-center gap-1.5 text-sky-600">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Yapay zeka hikayeyi canlandırıyor...
              </span>
            ) : (
              `"${story}"`
            )}
          </p>

          <button
            onClick={() => speakTurkish(story)}
            className="self-start text-[10px] font-black text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
          >
            🔊 Hikayeyi Seslendir
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <button
            onClick={onDownloadSnapshot}
            className="w-full sm:w-auto px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>🖼️ Fotoğraf Çek & Kart Yap</span>
          </button>

          <button
            onClick={handleLaunch}
            className="w-full sm:w-auto bubble-btn px-5 sm:px-7 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-lg ring-2 sm:ring-4 ring-emerald-300 hover:ring-emerald-400 cursor-pointer transform hover:scale-102 active:scale-95 transition"
          >
            <Play className="w-4 h-4 fill-current animate-pulse" />
            <span className="drop-shadow-xs tracking-wide">HEMEN CANLANDIR! 🎈✨</span>
          </button>
        </div>
      </div>
    </div>
  );
};
