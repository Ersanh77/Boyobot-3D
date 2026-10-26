import React, { useRef, useState, useEffect } from 'react';
import { MaterialType } from '../types';
import { playPop, playMagic, playFanfare, playSpray } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Sparkles, Eraser, Trash2, Undo, Wand2, Paintbrush } from 'lucide-react';

interface DrawCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  material: MaterialType;
  onMaterialChange: (m: MaterialType) => void;
  onBakeTo3D: () => void;
  onCancel: () => void;
}

export const DrawCanvas: React.FC<DrawCanvasProps> = ({
  canvasRef,
  material,
  onMaterialChange,
  onBakeTo3D,
  onCancel,
}) => {
  const [brushColor, setBrushColor] = useState('#ec4899');
  const [brushSize, setBrushSize] = useState(24);
  const [isEraser, setIsEraser] = useState(false);
  const [isRainbow, setIsRainbow] = useState(false);
  const [isBaking, setIsBaking] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState('star');
  const [history, setHistory] = useState<ImageData[]>([]);

  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const rainbowHueRef = useRef(0);

  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
    '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff', '#1e293b'
  ];

  const brushSizes = [
    { size: 14, label: 'İnce', icon: '✏️' },
    { size: 24, label: 'Orta', icon: '🖌️' },
    { size: 36, label: 'Pofuduk', icon: '🎨' },
    { size: 52, label: 'Süper Kalın', icon: '🎈' },
  ];

  const templates = [
    { id: 'car', label: 'Araba', icon: '🚗' },
    { id: 'monster', label: 'Canavar', icon: '👾' },
    { id: 'ufo', label: 'Uçan Daire', icon: '🛸' },
    { id: 'star', label: 'Yıldız', icon: '⭐' },
    { id: 'heart', label: 'Kalp', icon: '💖' },
    { id: 'fish', label: 'Balık', icon: '🐠' },
    { id: 'house', label: 'Ev', icon: '🏠' },
    { id: 'blank', label: 'Boş Tuval', icon: '🎨' },
  ];

  const materials: { id: MaterialType; label: string; icon: string; desc: string; color: string }[] = [
    { id: 'pelus', label: 'Pofuduk Pelüş', icon: '🧸', desc: 'Yumuşacık & sevimli', color: 'from-pink-400 to-rose-400' },
    { id: 'metal', label: 'Parıl Metal', icon: '⚡', desc: 'Işıl ışıl & parlak', color: 'from-slate-400 to-sky-400' },
    { id: 'hamur', label: 'Oyun Hamuru', icon: '🧁', desc: 'Renkli & pofuduk', color: 'from-purple-400 to-indigo-400' },
    { id: 'seker', label: 'Şeker Kristali', icon: '💎', desc: 'Cam gibi & tatlı', color: 'from-cyan-400 to-blue-400' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    drawTemplate('star');
  }, []);

  const saveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-12), snap]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    playPop();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    const prev = newHistory.pop();
    setHistory(newHistory);
    if (prev) {
      ctx.putImageData(prev, 0, 0);
    }
  };

  const handleClear = () => {
    playPop();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    saveHistory();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setActiveTemplate('blank');
  };

  const drawTemplate = (templateId: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setActiveTemplate(templateId);
    saveHistory();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (templateId === 'blank') return;

    ctx.save();
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    if (templateId === 'star') {
      ctx.strokeStyle = '#f59e0b';
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      const pts = 5;
      const rOut = 140;
      const rIn = 70;
      for (let i = 0; i < pts * 2; i++) {
        const a = (i * Math.PI) / pts - Math.PI / 2;
        const r = i % 2 === 0 ? rOut : rIn;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cute rosy cheek dots
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(cx - 50, cy + 15, 14, 0, Math.PI * 2);
      ctx.arc(cx + 50, cy + 15, 14, 0, Math.PI * 2);
      ctx.fill();
    } else if (templateId === 'heart') {
      ctx.strokeStyle = '#ec4899';
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.moveTo(cx, cy + 100);
      ctx.bezierCurveTo(cx - 170, cy - 40, cx - 130, cy - 140, cx, cy - 60);
      ctx.bezierCurveTo(cx + 130, cy - 140, cx + 170, cy - 40, cx, cy + 100);
      ctx.fill();
      ctx.stroke();

      // Sparkle accent
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(cx - 60, cy - 50, 24, Math.PI * 0.9, Math.PI * 1.5);
      ctx.stroke();
    } else if (templateId === 'car') {
      ctx.strokeStyle = '#2563eb';
      ctx.fillStyle = '#93c5fd';

      // Chassis Body
      ctx.beginPath();
      ctx.roundRect(cx - 160, cy - 15, 320, 95, [30, 30, 16, 16]);
      ctx.roundRect(cx - 90, cy - 95, 190, 85, [45, 45, 0, 0]);
      ctx.fill();
      ctx.stroke();

      // Windows
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.roundRect(cx - 75, cy - 80, 70, 55, [18, 5, 5, 12]);
      ctx.roundRect(cx + 5, cy - 80, 80, 55, [5, 25, 12, 5]);
      ctx.fill();

      // Headlight
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(cx + 150, cy + 25, 18, 0, Math.PI * 2);
      ctx.fill();

      // Wheels
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(cx - 100, cy + 85, 44, 0, Math.PI * 2);
      ctx.arc(cx + 100, cy + 85, 44, 0, Math.PI * 2);
      ctx.fill();

      // Hubcaps
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(cx - 100, cy + 85, 18, 0, Math.PI * 2);
      ctx.arc(cx + 100, cy + 85, 18, 0, Math.PI * 2);
      ctx.fill();
    } else if (templateId === 'monster') {
      ctx.strokeStyle = '#7c3aed';
      ctx.fillStyle = '#c084fc';

      // Chubby monster blob
      ctx.beginPath();
      ctx.ellipse(cx, cy + 20, 140, 120, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cute horns
      ctx.fillStyle = '#f472b6';
      ctx.strokeStyle = '#db2777';
      ctx.beginPath();
      ctx.arc(cx - 90, cy - 90, 32, 0, Math.PI * 2);
      ctx.arc(cx + 90, cy - 90, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Belly patch
      ctx.fillStyle = '#f3e8ff';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 45, 75, 60, 0, 0, Math.PI * 2);
      ctx.fill();

      // Feet
      ctx.fillStyle = '#7c3aed';
      ctx.beginPath();
      ctx.arc(cx - 60, cy + 135, 26, 0, Math.PI * 2);
      ctx.arc(cx + 60, cy + 135, 26, 0, Math.PI * 2);
      ctx.fill();
    } else if (templateId === 'ufo') {
      // Alien Cockpit Dome
      ctx.strokeStyle = '#0891b2';
      ctx.fillStyle = '#a5f3fc';
      ctx.beginPath();
      ctx.arc(cx, cy - 20, 85, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      // Antenna
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 105);
      ctx.lineTo(cx, cy - 135);
      ctx.stroke();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(cx, cy - 145, 16, 0, Math.PI * 2);
      ctx.fill();

      // Saucer Ring
      ctx.strokeStyle = '#ea580c';
      ctx.fillStyle = '#fed7aa';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 15, 185, 55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Flashing saucer lights
      const lightColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'];
      for (let i = 0; i < 5; i++) {
        const lx = cx - 120 + i * 60;
        ctx.fillStyle = lightColors[i];
        ctx.beginPath();
        ctx.arc(lx, cy + 20, 14, 0, Math.PI * 2);
        ctx.fill();
      }

      // Landing legs
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(cx - 90, cy + 65);
      ctx.lineTo(cx - 110, cy + 115);
      ctx.moveTo(cx, cy + 70);
      ctx.lineTo(cx, cy + 120);
      ctx.moveTo(cx + 90, cy + 65);
      ctx.lineTo(cx + 110, cy + 115);
      ctx.stroke();
    } else if (templateId === 'fish') {
      // Cute Balık 🐠
      ctx.strokeStyle = '#ea580c';
      ctx.fillStyle = '#fdba74';

      // Body (smooth teardrop fish)
      ctx.beginPath();
      ctx.moveTo(cx + 140, cy);
      ctx.bezierCurveTo(cx + 90, cy - 110, cx - 80, cy - 100, cx - 110, cy);
      ctx.bezierCurveTo(cx - 80, cy + 100, cx + 90, cy + 110, cx + 140, cy);
      ctx.fill();
      ctx.stroke();

      // Tail fin
      ctx.fillStyle = '#fb923c';
      ctx.beginPath();
      ctx.moveTo(cx - 100, cy);
      ctx.lineTo(cx - 180, cy - 80);
      ctx.quadraticCurveTo(cx - 145, cy, cx - 180, cy + 80);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Top dorsal fin
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - 85);
      ctx.quadraticCurveTo(cx + 10, cy - 135, cx + 55, cy - 70);
      ctx.fill();
      ctx.stroke();

      // Side flipper
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.ellipse(cx - 10, cy + 25, 38, 22, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + 75, cy - 25, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(cx + 80, cy - 25, 10, 0, Math.PI * 2);
      ctx.fill();

      // Mouth & Bubbles
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx + 165, cy - 35, 12, 0, Math.PI * 2);
      ctx.arc(cx + 185, cy - 75, 18, 0, Math.PI * 2);
      ctx.arc(cx + 195, cy - 120, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (templateId === 'house') {
      // Cute Ev 🏠
      // Chimney & Smoke
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(cx + 95, cy - 150, 16, 0, Math.PI * 2);
      ctx.arc(cx + 115, cy - 185, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ea580c';
      ctx.fillRect(cx + 65, cy - 110, 36, 60);

      // Main house box
      ctx.strokeStyle = '#c2410c';
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath();
      ctx.roundRect(cx - 120, cy - 30, 240, 160, 16);
      ctx.fill();
      ctx.stroke();

      // Triangular Roof
      ctx.fillStyle = '#f87171';
      ctx.strokeStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(cx - 150, cy - 25);
      ctx.lineTo(cx, cy - 145);
      ctx.lineTo(cx + 150, cy - 25);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Front Door with round top
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(cx - 30, cy + 30, 60, 100, [30, 30, 0, 0]);
      ctx.fill();
      ctx.stroke();

      // Golden knob
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(cx + 16, cy + 80, 7, 0, Math.PI * 2);
      ctx.fill();

      // Window with 4 panes
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(cx - 95, cy + 15, 48, 48, 8);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 71, cy + 15);
      ctx.lineTo(cx - 71, cy + 63);
      ctx.moveTo(cx - 95, cy + 39);
      ctx.lineTo(cx - 47, cy + 39);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Drawing event handlers
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveHistory();
    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    lastPointRef.current = { x, y };

    if (isRainbow) playMagic();
    else if (isEraser) playPop();
    else playSpray();
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(x, y);

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = Math.max(brushSize * 1.8, 44);
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = brushSize;
      if (isRainbow) {
        rainbowHueRef.current = (rainbowHueRef.current + 6) % 360;
        ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 95%, 55%)`;
      } else {
        ctx.strokeStyle = brushColor;
      }
    }

    ctx.stroke();
    lastPointRef.current = { x, y };
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const handleBakeTrigger = () => {
    playFanfare();
    playMagic();
    setIsBaking(true);

    // Initial celebratory burst
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
    });

    // Dual-cannon bursts for magical feel
    setTimeout(() => {
      confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0.15, y: 0.6 } });
      confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 0.85, y: 0.6 } });
    }, 280);

    setTimeout(() => {
      setIsBaking(false);
      onBakeTo3D();
    }, 1500);
  };

  return (
    <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl border-2 sm:border-4 border-amber-300 flex flex-col items-center max-h-[92vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-xs text-white animate-bounce shrink-0">
            🎨
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-slate-800 tracking-tight leading-tight">
              Kendi 3D Nesneni Çiz! ✨
            </h2>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500">
              Şablon seç veya hayal gücünle çiz, 3D Sihirli Fırında pofuduk oyuncağa dönüştür! 🎈
            </p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-lg text-xs transition cursor-pointer"
        >
          Kapat ✕
        </button>
      </div>

      {/* Cute Starter Templates Row */}
      <div className="w-full mb-2">
        <div className="flex items-center justify-between mb-1 px-1">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <span>✨</span> Sevimli Şablonlar:
          </span>
          <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
            Üzerine çizip değiştirebilirsin!
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-none">
          {templates.map((tpl) => {
            const isSel = activeTemplate === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => {
                  playPop();
                  drawTemplate(tpl.id);
                }}
                className={`px-2.5 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs border ${
                  isSel
                    ? 'bg-amber-400 text-amber-950 border-white ring-2 ring-amber-300 scale-102'
                    : 'bg-slate-50 hover:bg-pink-50 text-slate-700 border-slate-200'
                }`}
              >
                <span className="text-sm sm:text-base">{tpl.icon}</span>
                <span>{tpl.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Drawing Canvas with cartoon frame */}
      <div className="relative border-3 border-dashed border-pink-300 rounded-2xl overflow-hidden bg-slate-50 shadow-inner w-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={380}
          className="w-full max-w-[600px] h-[220px] xs:h-[260px] sm:h-[310px] cursor-crosshair touch-none"
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
        />

        {/* Enhanced Magic Oven Inflation Overlay */}
        {isBaking && (
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/95 via-orange-500/95 to-rose-500/95 flex flex-col items-center justify-center text-white z-20 backdrop-blur-sm animate-in fade-in duration-300 p-4 text-center">
            <div className="flex items-center gap-2 text-4xl sm:text-5xl mb-2 animate-bounce">
              <span>✨</span>
              <span>🧁</span>
              <span>🪄</span>
              <span>🎈</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-black drop-shadow-md">
              3D Sihirli Fırında Şişiriliyor! 🎈✨
            </h3>
            <p className="text-amber-100 text-xs sm:text-sm font-bold mt-1 max-w-xs">
              Hoppa! Çizimin pofuduk ve 3 boyutlu bir oyuncağa dönüşüyor... 🌟
            </p>
            <div className="mt-3 w-44 h-2.5 bg-white/30 rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-white rounded-full animate-[shimmer_1.2s_ease-in-out_infinite] w-full" />
            </div>
          </div>
        )}
      </div>

      {/* Tools Row: Brush Thickness, Rainbow, Big Eraser, Undo, Clear */}
      <div className="w-full mt-2 flex flex-wrap items-center justify-between gap-1.5 bg-slate-50/80 p-1.5 sm:p-2 rounded-xl border border-slate-200">
        {/* Brush Sizes */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-black text-slate-500 hidden sm:inline mr-1">
            Fırça:
          </span>
          {brushSizes.map((b) => (
            <button
              key={b.size}
              onClick={() => {
                playPop();
                setBrushSize(b.size);
                setIsEraser(false);
              }}
              className={`px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-black transition cursor-pointer flex items-center gap-1 border ${
                !isEraser && brushSize === b.size
                  ? 'bg-sky-500 text-white border-sky-600 shadow-2xs scale-102'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{b.icon}</span>
              <span className="hidden xs:inline">{b.label}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons: Rainbow, Big Eraser, Undo, Clear */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* Rainbow brush */}
          <button
            onClick={() => {
              playMagic();
              setIsRainbow(!isRainbow);
              setIsEraser(false);
            }}
            className={`px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-black shadow-2xs transition flex items-center gap-1 cursor-pointer ${
              isRainbow
                ? 'bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 text-white ring-1 ring-purple-600 scale-102'
                : 'bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 text-white hover:scale-102'
            }`}
          >
            <span>🌈</span>
            <span>Gökkuşağı {isRainbow && '✓'}</span>
          </button>

          {/* Big Eraser */}
          <button
            onClick={() => {
              playPop();
              setIsEraser(!isEraser);
            }}
            className={`px-2 py-0.5 sm:py-1 rounded-lg border flex items-center gap-1 text-[10px] sm:text-xs font-black shadow-2xs transition cursor-pointer ${
              isEraser
                ? 'bg-rose-500 text-white border-rose-600 ring-1 ring-rose-300 scale-102'
                : 'bg-white text-slate-700 hover:bg-rose-50 border-slate-200'
            }`}
          >
            <Eraser className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Silgi 🧼</span>
          </button>

          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className={`px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-black border shadow-2xs flex items-center gap-1 transition cursor-pointer ${
              history.length === 0
                ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Undo className="w-3 h-3" />
            <span className="hidden xs:inline">Geri</span>
          </button>

          {/* Quick Clear */}
          <button
            onClick={handleClear}
            className="px-2 py-0.5 sm:py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] sm:text-xs font-black border border-rose-200 shadow-2xs flex items-center gap-1 transition cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Temizle 🗑️</span>
          </button>
        </div>
      </div>

      {/* Color Palette Row */}
      <div className="flex items-center gap-1.5 mt-2 w-full overflow-x-auto pb-0.5 scrollbar-none">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0 mr-0.5">
          Renkler:
        </span>
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => {
              playPop();
              setBrushColor(c);
              setIsEraser(false);
              setIsRainbow(false);
            }}
            style={{ backgroundColor: c }}
            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 transition-transform shadow-2xs shrink-0 cursor-pointer ${
              !isEraser && !isRainbow && brushColor === c
                ? 'scale-115 border-slate-900 ring-2 ring-pink-400'
                : 'border-white hover:scale-105'
            }`}
          />
        ))}
      </div>

      {/* Transformation & Material Selection Section */}
      <div className="w-full mt-2 pt-2 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Material Selection Cards */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 w-full md:w-auto">
          <span className="text-[10px] sm:text-xs font-black text-slate-700 flex items-center gap-1 shrink-0">
            <span>✨</span> 3D Malzeme:
          </span>
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1 w-full">
            {materials.map((mat) => {
              const isSelected = material === mat.id;
              return (
                <button
                  key={mat.id}
                  onClick={() => {
                    playPop();
                    onMaterialChange(mat.id);
                  }}
                  className={`p-1.5 rounded-xl text-left transition shadow-2xs border cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-400 text-amber-950 border-white ring-2 ring-amber-300 scale-102'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="text-lg sm:text-xl shrink-0">{mat.icon}</span>
                  <div className="min-w-0">
                    <span className="block text-[10px] sm:text-xs font-black leading-tight truncate">
                      {mat.label}
                    </span>
                    <span className="block text-[8px] font-bold opacity-80 leading-tight truncate">
                      {mat.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Bubbly Animated "3D Sihirli Fırında Şişir!" Button */}
        <button
          onClick={handleBakeTrigger}
          className="relative bubble-btn w-full md:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 hover:from-emerald-500 hover:to-green-600 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg cursor-pointer ring-2 sm:ring-3 ring-emerald-300/80 hover:ring-emerald-400 transition transform hover:scale-102 active:scale-95 shrink-0"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center text-base shrink-0 animate-spin">
            🪄
          </div>
          <div className="text-left">
            <span className="block text-xs sm:text-sm font-black tracking-tight leading-none drop-shadow-xs">
              3D Sihirli Fırında Şişir! 🎈✨
            </span>
            <span className="block text-[9px] sm:text-[10px] font-bold text-emerald-100 leading-tight mt-0.5">
              Çizimin 3 boyutlu oyuncağa dönüşsün!
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
