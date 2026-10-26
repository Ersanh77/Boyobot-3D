// Procedural Web Audio API sound generator for kids game
let audioCtx: AudioContext | null = null;
let bgMusicGain: GainNode | null = null;
let bgMusicNode: OscillatorNode | null = null;
let isBgMusicPlaying = false;
let bgMusicTimeoutId: ReturnType<typeof setTimeout> | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const startBackgroundMusic = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (isBgMusicPlaying || bgMusicGain) return;

    isBgMusicPlaying = true;
    bgMusicGain = ctx.createGain();
    bgMusicGain.gain.value = 0.05; // Keep it quiet
    bgMusicGain.connect(ctx.destination);

    // Simple looping melody
    const playNote = (freq: number, time: number, duration: number) => {
      const currentGain = bgMusicGain;
      if (!isBgMusicPlaying || !currentGain || ctx.state === 'closed') return;

      try {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(0.5, time + 0.05);
        env.gain.linearRampToValueAtTime(0, time + duration - 0.05);
        
        osc.connect(env);
        if (currentGain && currentGain instanceof GainNode) {
          env.connect(currentGain);
          osc.start(time);
          osc.stop(time + duration);
        }
      } catch (e) {
        console.warn('Audio note connect error:', e);
      }
    };

    const loop = () => {
      if (!isBgMusicPlaying || !bgMusicGain || ctx.state === 'closed') return;
      const now = ctx.currentTime;
      const melody = [523.25, 659.25, 783.99, 659.25, 523.25]; // C5, E5, G5, E5, C5
      melody.forEach((note, i) => playNote(note, now + i * 0.5, 0.4));
      
      if (isBgMusicPlaying) {
        bgMusicTimeoutId = setTimeout(loop, 2500); // Repeat every 2.5 seconds
      }
    };

    loop();
    bgMusicNode = ctx.createOscillator(); // Just a dummy to flag it's running
  } catch (e) {
    console.warn('Audio play error:', e);
  }
};

export const stopBackgroundMusic = () => {
  isBgMusicPlaying = false;
  if (bgMusicTimeoutId !== null) {
    clearTimeout(bgMusicTimeoutId);
    bgMusicTimeoutId = null;
  }
  if (bgMusicGain) {
    try {
      bgMusicGain.disconnect();
    } catch (e) {
      // ignore
    }
    bgMusicGain = null;
  }
  bgMusicNode = null;
};

export const playPop = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch (e) {
    console.warn('Audio play error:', e);
  }
};

export const playMagic = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    const now = ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + i * 0.05;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.2, startTime + 0.15);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });
  } catch (e) {
    console.warn('Audio play error:', e);
  }
};

export const playSpray = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1600;
    filter.Q.value = 2.0;

    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  } catch (e) {
    console.warn('Audio play error:', e);
  }
};

export const playBoing = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(659, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.25);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {
    console.warn('Audio play error:', e);
  }
};

export const playFanfare = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [440, 554.37, 659.25, 880];
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.1;
      const duration = idx === notes.length - 1 ? 0.4 : 0.12;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    });
  } catch (e) {
    console.warn('Audio play error:', e);
  }
};

// Turkish TTS helper
export const speakTurkish = (text: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    utterance.rate = 1.05;
    utterance.pitch = 1.25; // slightly higher, friendlier kid robot voice

    // Look for Turkish voice if available
    const voices = window.speechSynthesis.getVoices();
    const trVoice = voices.find(v => v.lang.startsWith('tr'));
    if (trVoice) {
      utterance.voice = trVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
};
