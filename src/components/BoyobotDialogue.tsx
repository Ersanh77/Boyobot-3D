import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Lightbulb, Sparkles, Target } from 'lucide-react';
import { speakTurkish, playPop, playMagic } from '../utils/audio';
import { DailyTask } from '../types';

interface BoyobotDialogueProps {
  message: string;
  onAskTip: () => void;
  isLoading?: boolean;
  task: DailyTask | null;
}

export const BoyobotDialogue: React.FC<BoyobotDialogueProps> = ({
  message,
  onAskTip,
  isLoading = false,
  task,
}) => {
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // Auto-speak message when it changes if TTS enabled
  useEffect(() => {
    if (ttsEnabled && message && !isLoading) {
      speakTurkish(message);
    }
  }, [message, ttsEnabled, isLoading]);

  const toggleTts = () => {
    playPop();
    const next = !ttsEnabled;
    setTtsEnabled(next);
    if (next && message) {
      speakTurkish(message);
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const handleSpeakNow = () => {
    playPop();
    if (message) {
      speakTurkish(message);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg">
      {/* Daily Task Card */}
      {task && (
        <div className="bg-emerald-50/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5 shadow-sm border border-emerald-300 flex items-center gap-2">
          <div className="w-7 h-7 sm:w-9 sm:h-9 bg-emerald-400 rounded-lg sm:rounded-xl flex items-center justify-center text-sm sm:text-base shadow-xs text-white shrink-0">
            <Target className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] sm:text-[10px] font-black text-emerald-900 uppercase tracking-wide">Günün Görevi</p>
            <p className="text-[10px] sm:text-xs font-bold text-emerald-800 truncate">{task.description}</p>
          </div>
          <div className="text-[10px] sm:text-xs font-black text-emerald-600 bg-white px-1.5 sm:px-2 py-0.5 rounded-md shadow-2xs shrink-0">
            {task.currentCount}/{task.requiredCount || 1}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 sm:gap-2.5 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 shadow-lg border-2 sm:border-3 border-sky-300">
        {/* Boyobot Avatar */}
        <div className="relative shrink-0">
          <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-500 flex items-center justify-center text-lg xs:text-xl sm:text-2xl shadow-xs border border-white">
            🤖
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 text-[8px] sm:text-[9px] font-black px-1 py-0.2 rounded-full border border-white shadow-2xs">
            AI
          </div>
        </div>

        {/* Bubble text & controls */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-[9px] xs:text-[10px] sm:text-xs text-sky-700 uppercase tracking-wider">
                Boyobot (AI Arkadaşın)
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>

            <div className="flex items-center gap-0.5">
              <button
                onClick={handleSpeakNow}
                title="Sesi Dinle"
                className="p-1 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-600 transition"
              >
                <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
              <button
                onClick={toggleTts}
                title={ttsEnabled ? 'Otomatik sesi kapat' : 'Otomatik sesi aç'}
                className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition text-[9px] sm:text-[10px]"
              >
                {ttsEnabled ? (
                  <span className="text-[9px] font-bold text-emerald-600">Ses Açık</span>
                ) : (
                  <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          <p className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-bold text-slate-800 leading-tight sm:leading-snug">
            {isLoading ? (
              <span className="flex items-center gap-1 text-sky-600">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                Boyobot harika bir fikir düşünüyor... 💭
              </span>
            ) : (
              message
            )}
          </p>

          {/* Suggestion prompt button */}
          <div className="mt-1 flex items-center gap-1.5">
            <button
              onClick={() => {
                playMagic();
                onAskTip();
              }}
              disabled={isLoading}
              className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[9px] xs:text-[10px] sm:text-[11px] font-black rounded-md sm:rounded-lg transition flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Lightbulb className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600" />
              <span>Bana Bir Fikir Ver! 💡</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
