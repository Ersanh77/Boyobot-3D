import React, { useState, useRef, useEffect } from 'react';
import { AppMode, ModelId, MaterialType, WorldId, PaintTool, PlacedSticker, DailyTask, ModelCategory, FineDetailStroke, StudioThemeId, STUDIO_THEMES, AccessoryId } from './types';
import { ThreeCanvas } from './components/ThreeCanvas';
import { DrawCanvas } from './components/DrawCanvas';
import { RightPalette } from './components/RightPalette';
import { BoyobotDialogue } from './components/BoyobotDialogue';
import { AnimateModal } from './components/AnimateModal';
import { ModelLibraryModal } from './components/ModelLibraryModal';
import { ALL_MODELS, CATEGORIES } from './utils/modelRegistry';
import { generateDailyTask } from './utils/tasks';
import { playPop, playMagic, playBoing, playFanfare, startBackgroundMusic, stopBackgroundMusic } from './utils/audio';
import confetti from 'canvas-confetti';
import { RotateCw, ZoomIn, Undo, Home, Camera, Sparkles, Play, StopCircle, Library, RotateCcw, Music, Palette } from 'lucide-react';

export default function App() {
  // Navigation & Model State
  const [mode, setMode] = useState<AppMode>('ready_models');
  const [studioThemeId, setStudioThemeId] = useState<StudioThemeId>('kawaii');
  const activeStudioTheme = STUDIO_THEMES.find((t) => t.id === studioThemeId) || STUDIO_THEMES[0];
  const [currentModel, setCurrentModel] = useState<ModelId>(() => {
    try {
      const saved = localStorage.getItem('boyobot_last_model_v1') as ModelId;
      if (saved && ALL_MODELS.some((m) => m.id === saved)) return saved;
    } catch { /* fallback */ }
    return 'unicorn';
  });

  // Color & Sticker & Canvas storage per model ID
  const [modelsData, setModelsData] = useState<Record<ModelId, { colors: Record<string, string>; stickers: PlacedSticker[]; accessories: AccessoryId[]; canvasMaps?: Record<string, string>; cameraOrbit?: { theta: number; phi: number; distance: number } }>>(() => {
    try {
      const savedV2 = localStorage.getItem('boyobot_models_data_v2');
      if (savedV2) return JSON.parse(savedV2);
      const savedV1 = localStorage.getItem('boyobot_models_data_v1');
      if (savedV1) return JSON.parse(savedV1);
    } catch { /* fallback */ }
    return {} as any;
  });

  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [drawingMaterial, setDrawingMaterial] = useState<MaterialType>('pelus');
  const [drawingVersion, setDrawingVersion] = useState(1);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Paint & Sticker Tools
  const [activeTool, setActiveTool] = useState<PaintTool>('bucket');
  const [activeColor, setActiveColor] = useState('#facc15');
  const [activeColorType, setActiveColorType] = useState<'solid' | 'glitter' | 'pattern'>('solid');
  const [activeStickerEmoji, setActiveStickerEmoji] = useState('👀');
  const [stickerSize, setStickerSize] = useState(1.0);
  const [brushSize, setBrushSize] = useState<number>(2);
  const [colorHistory, setColorHistory] = useState<Record<string, string>[]>([]);
  const [redoHistory, setRedoHistory] = useState<Record<string, string>[]>([]);

  // Auto-Save & Storage State
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('boyobot_autosave_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'failed' | 'manual_only'>('saved');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Current model state (derived or synced)
  const currentModelData = modelsData[currentModel] || { colors: {}, stickers: [], accessories: [], canvasMaps: {} };
  const modelPartColors = currentModelData.colors || {};
  const stickers = currentModelData.stickers || [];
  const activeAccessories = currentModelData.accessories || [];
  const canvasMaps = currentModelData.canvasMaps || {};

  const getDisplayColor = (spec: string): string => {
    if (!spec) return '#cccccc';
    if (spec.startsWith('glitter:')) return spec.replace('glitter:', '');
    if (spec.startsWith('pattern:')) {
      const pat = spec.replace('pattern:', '');
      if (pat === 'rainbow') return '#ec4899';
      if (pat === 'polka') return '#f59e0b';
      if (pat === 'stripes') return '#3b82f6';
      if (pat === 'stars') return '#8b5cf6';
      if (pat === 'hearts') return '#f43f5e';
      if (pat === 'kawaii_face') return '#f472b6';
      return '#a855f7';
    }
    return spec;
  };

  const handleToggleAccessory = (accId: AccessoryId) => {
    playPop();
    setModelsData(prev => {
      const current = prev[currentModel] || { colors: {}, stickers: [], accessories: [], canvasMaps: {} };
      const currentAccs = current.accessories || [];
      const updatedAccs = currentAccs.includes(accId)
        ? currentAccs.filter(id => id !== accId)
        : [...currentAccs, accId];
      
      return {
        ...prev,
        [currentModel]: {
          ...current,
          accessories: updatedAccs
        }
      };
    });
  };

  // 3D Controls
  const [zoomLevel, setZoomLevel] = useState(0);
  const [rotationOffset, setRotationOffset] = useState(0);

  // AI Canlandırma State
  const [isAnimateModalOpen, setIsAnimateModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeWorld, setActiveWorld] = useState<WorldId>('kawaii');
  const [animationAction, setAnimationAction] = useState<'dance' | 'jump' | 'fly' | 'confetti'>('dance');
  const [story, setStory] = useState('');
  const [isStoryLoading, setIsStoryLoading] = useState(false);
  const [mobileTab, setMobileTab] = useState<'none' | 'model' | 'regions' | 'paint' | 'accessories'>('none');

  // Boyobot Companion Message
  const [boyobotMsg, setBoyobotMsg] = useState(
    'Heyecan dolu sanat dünyamıza hoş geldin! Ben Boyobot! 🤖 Bugün birlikte harika şeyler yaratacağız!'
  );
  const [isBoyobotThinking, setIsBoyobotThinking] = useState(false);

  // Daily Task State
  const [task, setTask] = useState<DailyTask | null>(null);
  const [completedTaskModal, setCompletedTaskModal] = useState<string | null>(null);

  const modelNames: Record<ModelId, string> = ALL_MODELS.reduce(
    (acc, m) => ({ ...acc, [m.id]: `${m.name} ${m.emoji}` }),
    {} as Record<ModelId, string>
  );

  const lastTipRequestTimeRef = useRef(0);
  const storyCacheRef = useRef<Record<string, string>>({});
  const lastActionRef = useRef<string | null>(null);

  // Debounced Auto-Save side effect
  useEffect(() => {
    if (!isAutoSaveEnabled) {
      setSaveStatus('manual_only');
      return;
    }

    setSaveStatus('saving');
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);

    autoSaveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem('boyobot_models_data_v2', JSON.stringify(modelsData));
        localStorage.setItem('boyobot_last_model_v1', currentModel);
        setSaveStatus('saved');
      } catch (err) {
        console.warn('Auto-save storage warning:', err);
        setSaveStatus('failed');
      }
    }, 1200);

    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [modelsData, currentModel, isAutoSaveEnabled]);

  const handleManualSave = () => {
    playMagic();
    try {
      localStorage.setItem('boyobot_models_data_v2', JSON.stringify(modelsData));
      localStorage.setItem('boyobot_last_model_v1', currentModel);
      setSaveStatus('saved');
      setBoyobotMsg(`Harika! ${modelNames[currentModel]} çalışman başarıyla kaydedildi! 💾✨`);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      setBoyobotMsg('Kayıt yapılırken bir uyarı oluştu. ⚠️');
    }
  };

  const handleToggleAutoSave = () => {
    playPop();
    setIsAutoSaveEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('boyobot_autosave_enabled', JSON.stringify(next));
      if (next) {
        setSaveStatus('saving');
        try {
          localStorage.setItem('boyobot_models_data_v2', JSON.stringify(modelsData));
          setSaveStatus('saved');
        } catch {}
        setBoyobotMsg('Otomatik kayıt etkinleştirildi! 🟢 Değişikliklerin anında saklanacak.');
      } else {
        setSaveStatus('manual_only');
        setBoyobotMsg('Otomatik kayıt kapatıldı. Değişikliklerini "Kaydet" düğmesiyle saklayabilirsin! 💾');
      }
      return next;
    });
  };

  const handleConfirmReset = () => {
    playPop();
    setModelsData((prev) => ({
      ...prev,
      [currentModel]: { colors: {}, stickers: [], accessories: [], canvasMaps: {} },
    }));
    setColorHistory([]);
    setRedoHistory([]);
    setIsResetConfirmOpen(false);
    setBoyobotMsg(`${modelNames[currentModel]} çalışması sıfırlandı. Yepyeni bir tuval açtın! 🎨✨`);
  };

  // Color change handler
  const handleModelPartColorChange = (part: string, color: string) => {
    setColorHistory((prev) => [...prev, { ...modelPartColors }]);
    setRedoHistory([]);
    
    let spec = color;
    if (!color.startsWith('glitter:') && !color.startsWith('pattern:')) {
      if (activeColorType === 'glitter') {
        spec = `glitter:${color}`;
      } else if (activeColorType === 'pattern') {
        const patternId = color.startsWith('#') ? 'spots' : color;
        spec = `pattern:${patternId}`;
      }
    }

    setModelsData(prev => {
      const current = prev[currentModel] || { colors: {}, stickers: [], accessories: [], canvasMaps: {} };
      let updatedColors = { ...(current.colors || {}), [part]: spec };

      // Meta-part: 'eyes' updates both left and right iris
      if (part === 'eyes') {
        updatedColors = {
          ...updatedColors,
          eye_iris_L: spec,
          eye_iris_R: spec,
        };
      }

      // Clear any saved canvasMaps for this part so Bucket fill overrides old stroke drawings
      const updatedCanvasMaps = { ...(current.canvasMaps || {}) };
      const lowerPart = part.toLowerCase();
      Object.keys(updatedCanvasMaps).forEach((key) => {
        const lowerKey = key.toLowerCase();
        if (lowerKey === lowerPart || lowerKey.startsWith(lowerPart + '_')) {
          delete updatedCanvasMaps[key];
        }
      });

      return {
        ...prev,
        [currentModel]: {
          ...current,
          colors: updatedColors,
          canvasMaps: updatedCanvasMaps,
        }
      };
    });

    const model = ALL_MODELS.find((m) => m.id === currentModel);
    if (model) {
      const actionKey = `paint_${model.id}_${part}_${spec}`;
      if (lastActionRef.current !== actionKey) {
        checkTaskCompletion('paint', model.category, spec);
        lastActionRef.current = actionKey;
      }
    }
  };

  const handleSaveCanvasMap = (part: string, dataUrl: string) => {
    setModelsData((prev) => {
      const current = prev[currentModel] || { colors: {}, stickers: [], accessories: [], canvasMaps: {} };
      return {
        ...prev,
        [currentModel]: {
          ...current,
          canvasMaps: {
            ...(current.canvasMaps || {}),
            [part]: dataUrl,
          },
        },
      };
    });
  };

  const handleSaveCameraOrbit = (orbit: { theta: number; phi: number; distance: number }) => {
    setModelsData((prev) => {
      const current = prev[currentModel] || { colors: {}, stickers: [], accessories: [], canvasMaps: {} };
      return {
        ...prev,
        [currentModel]: {
          ...current,
          cameraOrbit: orbit,
        },
      };
    });
  };

  const handleAddSticker = (newSticker: PlacedSticker) => {
    setModelsData(prev => ({
      ...prev,
      [currentModel]: {
        ...prev[currentModel],
        colors: prev[currentModel]?.colors || {},
        stickers: [...(prev[currentModel]?.stickers || []), newSticker]
      }
    }));
    
    const model = ALL_MODELS.find((m) => m.id === currentModel);
    if (model) {
      const actionKey = `sticker_${newSticker.id}`;
      if (lastActionRef.current !== actionKey) {
        checkTaskCompletion('sticker', model.category, newSticker.emoji);
        lastActionRef.current = actionKey;
      }
    }
  };

  const handleAddFineDetailStroke = (stroke: FineDetailStroke) => {
    // Note: fine details live on the CanvasTexture
  };

  const handleUndo = () => {
    playPop();
    if (stickers.length > 0) {
      setModelsData(prev => ({
        ...prev,
        [currentModel]: {
          ...prev[currentModel],
          stickers: prev[currentModel].stickers.slice(0, -1)
        }
      }));
      return;
    }
    if (colorHistory.length > 0) {
      const prevColors = colorHistory[colorHistory.length - 1];
      setColorHistory((h) => h.slice(0, -1));
      setRedoHistory((r) => [...r, { ...modelPartColors }]);
      setModelsData(prev => ({
        ...prev,
        [currentModel]: {
          ...prev[currentModel],
          colors: prevColors
        }
      }));
    }
  };

  const handleRedo = () => {
    playPop();
    if (redoHistory.length > 0) {
      const nextColors = redoHistory[redoHistory.length - 1];
      setRedoHistory((r) => r.slice(0, -1));
      setColorHistory((h) => [...h, { ...modelPartColors }]);
      setModelsData(prev => ({
        ...prev,
        [currentModel]: {
          ...prev[currentModel],
          colors: nextColors
        }
      }));
    }
  };
  
  const handleClearStickers = () => {
    playPop();
    setModelsData(prev => ({
      ...prev,
      [currentModel]: {
        ...prev[currentModel],
        stickers: []
      }
    }));
  };

  const handleReset = () => {
    setIsResetConfirmOpen(true);
  };

  const handleRotate = () => {
    playPop();
    setRotationOffset((prev) => prev + 1);
  };

  const handleZoom = () => {
    playPop();
    setZoomLevel((prev) => (prev >= 2 ? 0 : prev + 1));
  };

  const handleCycleTheme = () => {
    playPop();
    setStudioThemeId((prev) => {
      const idx = STUDIO_THEMES.findIndex((t) => t.id === prev);
      const nextIdx = (idx + 1) % STUDIO_THEMES.length;
      return STUDIO_THEMES[nextIdx].id;
    });
  };

  const handleSelectModel = (id: ModelId) => {
    playPop();
    setCurrentModel(id);
    localStorage.setItem('boyobot_last_model_v1', id);
    setMode('ready_models');
    
    // Reset transient history & active tool states on model swap
    setColorHistory([]);
    setRedoHistory([]);
    setActiveTool('bucket');

    const found = ALL_MODELS.find((m) => m.id === id);
    if (found) {
      setBoyobotMsg(`${found.name} ${found.emoji} harika bir seçim! Hadi boyamaya başlayalım! 🎨✨`);
    }
  };

  const handleAskTip = async () => {
    const now = Date.now();
    if (now - lastTipRequestTimeRef.current < 4000) return;

    lastTipRequestTimeRef.current = now;
    setIsBoyobotThinking(true);

    const tipFallbacks = [
      `Vay canına! ${mode === 'draw_3d' ? '3D Çizim' : modelNames[currentModel]} harika görünüşe sahip! Biraz simli renkler ekleyerek parlatabilirsin! ✨`,
      `Işıl ışıl bir renk uyumu! Sol menüden diğer vücut parçalarını boyamayı veya komik göz çıkartmaları eklemeyi dene! 👁️🎨`,
      `Muhteşem görünüyor küçük ressam! Gökyüzü temasını veya Şeker Atölyesi arka planını değiştirmeyi denedin mi? 🍬☀️`,
      `Boyobot bu tasarıma bayıldı! Üzerine şirin bir krallık tacı veya fiyonk kondurabilirsin! 👑🎀✨`,
    ];

    try {
      const res = await fetch('/api/boyobot/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'çocuğa boyama için çok yaratıcı bir fikir ver',
          objectName: mode === 'draw_3d' ? '3D Çizim' : modelNames[currentModel],
          colors: Object.values(modelPartColors),
        }),
      });
      const data = await res.json();
      if (data?.text) {
        setBoyobotMsg(data.text);
      } else {
        setBoyobotMsg(tipFallbacks[Math.floor(Math.random() * tipFallbacks.length)]);
      }
    } catch {
      setBoyobotMsg(tipFallbacks[Math.floor(Math.random() * tipFallbacks.length)]);
    } finally {
      setIsBoyobotThinking(false);
    }
  };

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      const savedData = localStorage.getItem('boyobot_daily_task_v1');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.date === todayStr) {
          if (parsed.completed) {
            setTask(null);
            return;
          } else if (parsed.task) {
            setTask(parsed.task);
            return;
          }
        }
      }
    } catch { /* ignore */ }

    const newTask = generateDailyTask();
    setTask(newTask);
  }, []);

  const checkTaskCompletion = (action: 'paint' | 'sticker', category: ModelCategory, targetValue: string) => {
    if (!task || (task.category !== 'any' && task.category !== category) || task.action !== action) return;

    if (targetValue.includes(task.target)) {
      const newCount = task.currentCount + 1;
      const required = task.requiredCount || 1;
      if (newCount >= required) {
        setTask(null);
        setCompletedTaskModal(task.description);
        playFanfare();
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      } else {
        setTask({ ...task, currentCount: newCount });
      }
    }
  };

  const fetchAnimationStory = async (world: WorldId, forceRefresh = false) => {
    const charName = mode === 'draw_3d' ? '3D Tasarımın' : modelNames[currentModel];
    const cacheKey = `${charName}_${world}`;
    if (!forceRefresh && storyCacheRef.current[cacheKey]) {
      setStory(storyCacheRef.current[cacheKey]);
      return;
    }

    const worldStories: Record<string, string> = {
      space: `Vay canına! ${charName} yıldızların arasında bir roket gibi süzülüyor! Gezegenler onun pırıl pırıl renklerine hayran kaldı! 🌌⭐🚀`,
      chocolate: `Nefis! ${charName} çikolata nehrinde neşeyle dans ediyor ve marshmallow tepelerinden neşeyle kayıyor! 🍫🧁✨`,
      clouds: `Gökyüzü bayram yeri oldu! ${charName} pamuk bulutların üstünde zıp zıp zıplıyor ve gökkuşağını boyuyor! ☁️🌈🎈`,
      forest: `Ormanın sihirli perileri toplandı! ${charName} parıldayan mantarların etrafında harika bir konfeti partisi başlattı! 🍄🌲✨`,
      dino: `Dinozor adası neşeyle sallanıyor! ${charName} sevimli dinozor dostlarıyla birlikte harika bir dans gösterisi yapıyor! 🦕🌴🌋`,
      kawaii: `Sihirli bir rüya gibi! ${charName} pastel gökkuşağının altında uçan kalpler ve yıldızlarla dolu bir partide dans ediyor! 💖🌈✨`,
    };

    setIsStoryLoading(true);
    try {
      const res = await fetch('/api/boyobot/animate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterName: charName, world, colors: Object.values(modelPartColors) }),
      });
      const data = await res.json();
      if (data?.story) {
        storyCacheRef.current[cacheKey] = data.story;
        setStory(data.story);
      } else {
        setStory(worldStories[world] || `Harika! ${charName} bu büyülü dünyada mutlulukla dans ediyor! 🎨🎉✨`);
      }
    } catch {
      setStory(worldStories[world] || `Harika! ${charName} bu büyülü dünyada mutlulukla dans ediyor! 🎨🎉✨`);
    } finally {
      setIsStoryLoading(false);
    }
  };

  const handleOpenAnimate = () => {
    playMagic();
    setIsAnimateModalOpen(true);
    fetchAnimationStory(activeWorld);
  };

  const handleStartAnimation = () => {
    setIsAnimateModalOpen(false);
    setIsAnimating(true);
    playMagic();
    
    // Multi-stage confetti burst
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#ff94a8', '#ffb3ba', '#ffffba', '#baffc9', '#bae1ff', '#e0baff']
    });
    
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff94a8', '#ec4899']
      });
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#facc15', '#fef08a']
      });
    }, 250);
  };

  // Keyboard 1, 2, 3, 4 Live Action Control during Animation Mode
  useEffect(() => {
    if (!isAnimating) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') {
        playPop();
        setAnimationAction('dance');
      } else if (e.key === '2') {
        playBoing();
        setAnimationAction('jump');
      } else if (e.key === '3') {
        playMagic();
        setAnimationAction('fly');
      } else if (e.key === '4') {
        playMagic();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        setAnimationAction('confetti');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnimating]);

  const handleBakeSuccess = () => {
    setIsDrawingModalOpen(false);
    setMode('draw_3d');
    setDrawingVersion((v) => v + 1);
    playFanfare();
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
    setBoyobotMsg("Vay canına! Çizimin sihirli fırından taptaze çıktı! Harika görünüyorsun! 🎨✨🎈");
  };

  const handleDownloadSnapshot = async () => {
    playFanfare();
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f472b6', '#38bdf8', '#fbbf24', '#34d399']
    });

    const webglCanvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!webglCanvas) return;

    const width = 1200;
    const height = 900;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d')!;

    // 1. Background / Main Frame (White Paper Look)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 2. Draw 3D scene with a border margin
    const margin = 40;
    const sceneWidth = width - margin * 2;
    const sceneHeight = height - margin * 2.5;
    ctx.drawImage(webglCanvas, margin, margin + 40, sceneWidth, sceneHeight - 80);

    // 3. Top Decorative Band (Pink/Purple)
    const bandHeight = 70;
    ctx.fillStyle = '#d946ef'; // Fuchsia/Purple
    ctx.fillRect(0, 0, width, bandHeight);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ Boyobot 3D Eserim ✨', width / 2, bandHeight / 2);

    // 4. Bottom Badge (Blue)
    const badgeHeight = 60;
    const badgeWidth = 500;
    const badgeX = (width - badgeWidth) / 2;
    const badgeY = height - badgeHeight - 20;

    // Draw Badge Background
    ctx.fillStyle = '#0ea5e9'; // Sky Blue
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 30);
      ctx.fill();
    } else {
      ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
    }

    // Badge Text
    const todayStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    const charName = mode === 'draw_3d' ? '3D Çizimim' : modelNames[currentModel];
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${charName} • ${todayStr} 🎨`, width / 2, badgeY + badgeHeight / 2 + 8);

    // 5. Outer Frame Accents (Dotted lines or colorful corners)
    ctx.strokeStyle = '#f472b6';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, width - 20, height - 20);
    ctx.setLineDash([]);

    // Convert canvas to Blob
    tempCanvas.toBlob(async (blob) => {
      if (!blob) return;

      const fileName = `Boyobot-Eserim-${Date.now()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Mobile Native Share (Save to Gallery)
      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        navigator.share
      ) {
        try {
          await navigator.share({
            title: 'Boyobot 3D Eserim 🎨',
            text: 'Bak ne güzel bir boyama yaptım! ✨',
            files: [file],
          });
          setBoyobotMsg('Harika! Eserin başarıyla paylaşıldı veya kaydedildi! 📸✨');
          return;
        } catch (err) {
          // Fallback if share is cancelled
        }
      }

      // Desktop Download Fallback
      const link = document.createElement('a');
      link.download = fileName;
      link.href = URL.createObjectURL(blob);
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 2000);
      setBoyobotMsg('Şahane! Fotoğraf bilgisayarına indirildi! 📸✨');
    }, 'image/png');
  };

  const getRegions = () => {
    let baseParts: string[] = [];
    
    // Fruit & Veg
    if (currentModel === 'apple') baseParts = ['body', 'stem', 'leaf'];
    else if (currentModel === 'banana') baseParts = ['body', 'stem', 'tip'];
    else if (currentModel === 'strawberry') baseParts = ['body', 'leaves', 'stem', 'seeds'];
    else if (currentModel === 'watermelon') baseParts = ['body', 'rind', 'inner_rind', 'seeds'];
    else if (currentModel === 'carrot') baseParts = ['body', 'leaves', 'stem'];
    else if (currentModel === 'tomato') baseParts = ['body', 'stem'];
    else if (currentModel === 'corn') baseParts = ['body', 'leaves', 'stem'];
    else if (currentModel === 'broccoli') baseParts = ['body', 'stalk'];
    
    // Flowers
    else if (currentModel === 'sunflower') baseParts = ['petals', 'center', 'seeds', 'stem', 'leaves', 'face', 'blush', 'critters'];
    else if (currentModel === 'rose') baseParts = ['petals', 'stem', 'leaves'];
    else if (currentModel === 'daisy') baseParts = ['petals', 'center', 'stem'];
    else if (currentModel === 'tulip') baseParts = ['petals', 'stem', 'leaves'];
    
    // Animals
    else if (currentModel === 'kitty') baseParts = ['body', 'head', 'belly', 'ears', 'paws', 'tail', 'eyes'];
    else if (currentModel === 'dog') baseParts = ['body', 'head', 'belly', 'ears', 'paws', 'tail', 'snout', 'eyes'];
    else if (currentModel === 'rabbit') baseParts = ['body', 'head', 'belly', 'ears', 'legs', 'tail', 'eyes'];
    else if (currentModel === 'horse') baseParts = ['body', 'head', 'neck', 'mane', 'tail', 'ears', 'hooves', 'eyes'];
    else if (currentModel === 'cow') baseParts = ['body', 'head', 'spots', 'snout', 'ears', 'horns', 'hooves', 'eyes'];
    else if (currentModel === 'sheep') baseParts = ['body', 'head', 'ears', 'legs', 'wool_crown', 'eyes'];
    else if (currentModel === 'chick') baseParts = ['body', 'head', 'belly', 'wings', 'tail', 'beak', 'feet', 'blush', 'perch', 'eyes'];
    else if (currentModel === 'penguin') baseParts = ['body', 'head', 'belly', 'wings', 'beak', 'feet', 'eyes'];
    else if (currentModel === 'dragon') baseParts = ['body', 'head', 'belly', 'wings', 'horns', 'spikes', 'tail'];
    else if (currentModel === 'dino') baseParts = ['body', 'head', 'belly', 'spikes', 'snout', 'tail'];
    else if (currentModel === 'turtle') baseParts = ['shell', 'spots', 'head', 'belly', 'flippers', 'tail'];
    else if (currentModel === 'unicorn') baseParts = ['body', 'head', 'mane', 'tail', 'horn', 'eyes'];
    else if (currentModel === 'lion') baseParts = ['body', 'head', 'belly', 'mane', 'tail', 'snout', 'ears', 'eyes'];
    else if (currentModel === 'butterfly') baseParts = ['body', 'wings', 'spots', 'eyes'];
    else if (currentModel === 'dolphin') baseParts = ['body', 'belly', 'snout', 'dorsal_fin', 'flippers', 'tail', 'blush', 'eyes'];
    else if (currentModel === 'panda') baseParts = ['body', 'head', 'belly', 'ears', 'arms', 'legs', 'eye_patches', 'snout', 'blush', 'eyes'];
    
    // Classics & Houses
    else if (currentModel === 'rocket') baseParts = ['body', 'head', 'wings', 'tip'];
    else if (currentModel === 'castle') baseParts = ['walls', 'roofs', 'gate', 'bridge', 'flags', 'windows', 'garden', 'decorations'];
    else if (currentModel === 'robot') baseParts = ['head', 'body', 'arms', 'legs', 'eyes', 'blush', 'face_screen', 'antenna', 'belly_screen', 'jetpack'];
    else if (currentModel === 'cottage') baseParts = ['body', 'head', 'windows', 'door'];
    else if (currentModel === 'mushroom_house') baseParts = ['body', 'head', 'spots', 'door'];
    else if (currentModel === 'treehouse') baseParts = ['body', 'head', 'leaves', 'ladder'];
    
    return Array.from(new Set([...baseParts, ...activeAccessories]));
  };

  const REGION_LABELS: Record<string, string> = {
    body: '👕 Gövde',
    head: '👤 Kafa',
    belly: '☁️ Karın / Göbek',
    snout: '👃 Burun / Ağız',
    ears: '👂 Kulaklar',
    tail: '🐈 Kuyruk',
    paws: '🐾 Patiler',
    legs: '🦵 Bacaklar',
    hooves: '👞 Toynaklar',
    mane: '💇 Yele',
    neck: '🦒 Boyun',
    spots: '🏁 Benekler',
    wings: '🦋 Kanatlar',
    beak: '👄 Gaga',
    feet: '👣 Ayaklar',
    blush: '🌸 Pembe Yanak Allığı',
    horns: '👿 Boynuzlar',
    wool_crown: '👑 Yün Taç',
    eyes: '👀 Gözler',
    shell: '🛡️ Kabuk',
    spikes: '🌵 Dikenler',
    stem: '🪵 Sap / Dal',
    leaf: '🍃 Yeşil Yaprak',
    leaves: '🌿 Yapraklar',
    seeds: '🟡 Çekirdekler',
    rind: '🍏 Dış Kabuk',
    inner_rind: '⚪ İç Katman',
    tip: '🟤 Uç / Köken',
    stalk: '🪵 Sap / Gövde',
    crown: '👑 Altın Taç',
    bow: '🎀 Sevimli Fiyonk',
    glasses: '👓 Havalı Gözlük',
  };

  const getRegionLabel = (model: ModelId, region: string) => {
    if (model === 'chick') {
      if (region === 'body') return '🦜 Papağan Gövdesi';
      if (region === 'head') return '👑 Sarı Baş & İbik';
      if (region === 'belly') return '☁️ Canlı Göğüs';
      if (region === 'wings') return '🪽 Açılıp Kapanan Kanatlar';
      if (region === 'tail') return '🌈 Uzun Renkli Kuyruk';
      if (region === 'beak') return '👄 Kıvrık Papağan Gagası';
      if (region === 'feet') return '🐾 Tünek Pençeleri';
      if (region === 'blush') return '🌸 Menekşe Yanak Lekesi';
      if (region === 'perch') return '🪵 Ahşap Tünek';
      if (region === 'eyes') return '👀 Parlak Anime Gözler';
    }
    if (model === 'butterfly') {
      if (region === 'body') return '🌸 Kelebek Gövdesi';
      if (region === 'wings') return '🌈 Gökkuşağı Kanatlar';
      if (region === 'spots') return '⭐ Parlak Yıldızlar';
    }
    if (region === 'body') {
      if (model === 'apple') return '🍎 Elma Gövdesi';
      if (model === 'banana') return '🍌 Muz Gövdesi';
      if (model === 'strawberry') return '🍓 Çilek Gövdesi';
      if (model === 'watermelon') return '🍉 Karpuz İçi';
      if (model === 'carrot') return '🥕 Havuç Gövdesi';
      if (model === 'tomato') return '🍅 Domates Gövdesi';
      if (model === 'corn') return '🌽 Mısır Taneleri';
      if (model === 'broccoli') return '🥦 Brokoli Başı';
    }
    if (region === 'stem') {
      if (model === 'apple') return '🪵 Elma Sapı';
      if (model === 'banana') return '🪵 Muz Sapı';
      if (model === 'strawberry') return '🪵 Çilek Sapı';
      if (model === 'carrot') return '🪵 Havuç Sapı';
      if (model === 'tomato') return '🌿 Domates Yaprağı';
      if (model === 'corn') return '🪵 Mısır Sapı';
    }
    if (region === 'leaves' && model === 'corn') return '🌿 Mısır Yaprakları';
    if (region === 'seeds' && model === 'watermelon') return '⚫ Karpuz Çekirdekleri';
    
    // Dragon specific labels
    if (model === 'dragon') {
      if (region === 'body') return '🐲 Ejderha Gövdesi';
      if (region === 'head') return '👤 Kafa';
      if (region === 'belly') return '☁️ Karın / Göbek';
      if (region === 'wings') return '🪽 Minik Kanatlar';
      if (region === 'horns') return '🦄 Boynuzlar';
      if (region === 'spikes') return '⚡ Sırt Dikenleri';
      if (region === 'tail') return '🦊 Sevimli Kuyruk';
    }
    
    if (model === 'dino') {
      if (region === 'body') return '🦕 Dinozor Gövdesi';
      if (region === 'head') return '👤 Kafa';
      if (region === 'belly') return '☁️ Karın / Göbek';
      if (region === 'spikes') return '⚡ Sırt Dikenleri';
      if (region === 'snout') return '👃 Sevimli Ağız / Burun';
      if (region === 'tail') return '🦊 Kıvrık Kuyruk';
    }

    if (model === 'turtle') {
      if (region === 'shell') return '🐢 Kaplumbağa Kabuğu';
      if (region === 'spots') return '🟡 Kabuk Desenleri';
      if (region === 'head') return '👤 Kafa';
      if (region === 'belly') return '☁️ Karın / Alt Gövde';
      if (region === 'flippers') return '🏊 Yüzme Yüzgeçleri';
      if (region === 'tail') return '🦊 Minik Kuyruk';
    }

    if (model === 'dolphin') {
      if (region === 'body') return '🐬 Pürüzsüz Yunus Sırtı';
      if (region === 'belly') return '☁️ Beyaz Göbek';
      if (region === 'snout') return '👄 Gülen Yunus Burnu';
      if (region === 'dorsal_fin') return '🦈 Sırt Yüzgeci';
      if (region === 'flippers') return '🪽 Yan Yüzgeçler';
      if (region === 'tail') return '🌊 İkili Kuyruk Yüzgeci';
      if (region === 'blush') return '🌸 Pembe Yanak Allığı';
      if (region === 'eyes') return '👀 Kawaii Anime Gözler';
    }

    if (model === 'panda') {
      if (region === 'body') return '🐼 Beyaz Gövde';
      if (region === 'head') return '👤 Sevimli Baş';
      if (region === 'belly') return '☁️ Bembeyaz Göbek';
      if (region === 'ears') return '👂 Kömürsü Kulaklar';
      if (region === 'arms') return '🙌 Kalkan Kollar';
      if (region === 'legs') return '🐾 Kömürsü Bacaklar';
      if (region === 'eye_patches') return '🖤 Panda Göz Lekeleri';
      if (region === 'snout') return '🌸 Minik Pembe Burun';
      if (region === 'blush') return '🌸 Pembe Yanak Allığı';
      if (region === 'eyes') return '👀 Kawaii Anime Gözler';
    }

    if (model === 'castle') {
      if (region === 'walls') return '🏰 Pembe Şato Duvarları';
      if (region === 'roofs') return '✨ Sivri Kule Çatıları';
      if (region === 'gate') return '🚪 Kalpli Masal Kapısı';
      if (region === 'bridge') return '🌉 Giriş Köprüsü';
      if (region === 'flags') return '💜 Dalgalanan Bayraklar';
      if (region === 'windows') return '💡 Işıklı Pencereler';
      if (region === 'garden') return '🌸 Çiçek Bahçesi & Sarmaşık';
      if (region === 'decorations') return '🧚 Peri, Kelebek & Yıldızlar';
    }

    if (model === 'robot') {
      if (region === 'head') return '🤖 Sevimli Kare Kafa';
      if (region === 'body') return '🔲 Gümüş & Mavi Gövde';
      if (region === 'arms') return '🦾 Eklemli Şirin Kollar';
      if (region === 'legs') return '🦿 Kısa Bacaklar & Geniş Taban';
      if (region === 'face_screen') return '📺 Dijital Yüz Ekranı';
      if (region === 'eyes') return '👀 Parlayan LED Gözler & Gülümseme';
      if (region === 'blush') return '🌸 Pembe LED Allık';
      if (region === 'antenna') return '💖 Kalpli Uzay Anteni';
      if (region === 'belly_screen') return '📟 Göğüs Göstergesi & Düğmeler';
      if (region === 'jetpack') return '🚀 Sırt Jetpack & İticiler';
    }

    if (model === 'sunflower') {
      if (region === 'petals') return '🌻 Parlak Güneş Yaprakları';
      if (region === 'center') return '🍯 Altın Bal Tohum Diski';
      if (region === 'seeds') return '🟡 Altın Tohum Taneleri';
      if (region === 'stem') return '🌿 Rüzgarda Salınan Sap';
      if (region === 'leaves') return '🍃 Taze Yeşil Yapraklar';
      if (region === 'face') return '👀 Gülen & Kırpan Kawaii Yüz';
      if (region === 'blush') return '🌸 Pembe Yanak Allığı';
      if (region === 'critters') return '🐝 Uçuşan Arı & Kelebek';
    }

    if (model === 'rose') {
      if (region === 'petals') return '🌹 Derin Kırmızı Gül Yaprakları';
      if (region === 'stem') return '🌿 Dikenli Gül Sapı';
      if (region === 'leaves') return '🍃 Yeşil Gül Yaprakları';
      if (region === 'dew') return '✨ Çiğ Damlaları';
    }

    if (model === 'tulip') {
      if (region === 'petals') return '🌷 Tam Açık Parlak Lale Yaprakları';
      if (region === 'stem') return '🌿 Uzun İnce Lale Sapı';
      if (region === 'leaves') return '🍃 Uzun Şerit Lale Yaprakları';
    }

    if (model === 'apple') {
      if (region === 'body') return '🍎 Parlak Kırmızı Elma Gövdesi';
      if (region === 'stem') return '🪵 Kahverengi Sap';
      if (region === 'leaf') return '🍃 Damarlı Yeşil Yaprak';
      if (region === 'face') return '👀 Kawaii Anime Gözler & Gülümseme';
      if (region === 'blush') return '🌸 Pembe Yanak Allığı';
      if (region === 'decorations') return '💖 Kalpler & Yıldızlar';
    }
    
    return REGION_LABELS[region] || region.replace(/_/g, ' ');
  };

  const getDefaultColor = (model: ModelId, part: string): string => {
    // These match the hardcoded defaults in newModels.ts
    const defaults: Record<string, Record<string, string>> = {
      kitty: { body: '#f97316', head: '#f97316', belly: '#ffffff', ears: '#f97316', paws: '#ffffff', tail: '#f97316', eyes: '#0f172a' },
      dog: { body: '#f59e0b', head: '#f59e0b', belly: '#fef3c7', ears: '#b45309', snout: '#ffffff', paws: '#ffffff', legs: '#ffffff', tail: '#f59e0b', eyes: '#0f172a' },
      rabbit: { body: '#ffffff', head: '#ffffff', belly: '#f8fafc', ears: '#fbcfe8', legs: '#ffffff', tail: '#f8fafc', eyes: '#0f172a' },
      horse: { body: '#d97706', head: '#d97706', neck: '#d97706', mane: '#451a03', tail: '#451a03', legs: '#d97706', hooves: '#1e293b', snout: '#fde68a', ears: '#d97706', eyes: '#0f172a' },
      cow: { body: '#ffffff', head: '#ffffff', spots: '#1e293b', snout: '#fbcfe8', ears: '#ffffff', horns: '#facc15', hooves: '#1e293b', eyes: '#0f172a' },
      sheep: { body: '#ffffff', head: '#334155', wool_crown: '#ffffff', ears: '#334155', legs: '#1e293b', eyes: '#0f172a' },
      chick: { body: '#22c55e', head: '#facc15', belly: '#4ade80', wings: '#16a34a', tail: '#0284c7', beak: '#f59e0b', feet: '#fb923c', blush: '#818cf8', perch: '#a16207', eyes: '#0f172a' },
      penguin: { body: '#0f172a', head: '#0f172a', belly: '#ffffff', wings: '#0f172a', beak: '#f97316', feet: '#f97316', eyes: '#ffffff' },
      lion: { body: '#f59e0b', head: '#f59e0b', belly: '#fef3c7', mane: '#b45309', tail: '#f59e0b', snout: '#fef3c7', ears: '#f59e0b', eyes: '#0f172a' },
      apple: {
        body: '#DD2222',
        stem: '#78350f',
        leaf: '#22c55e',
        face: '#0f172a',
        blush: '#ff94a8',
        decorations: '#f43f5e',
      },
      banana: { body: '#facc15', stem: '#65a30d', tip: '#5c2c16' },
      strawberry: { body: '#e11d48', leaves: '#16a34a', stem: '#78350f', seeds: '#facc15' },
      watermelon: { body: '#ef4444', rind: '#15803d', inner_rind: '#f8fafc', seeds: '#1e293b' },
      carrot: { body: '#ea580c', leaves: '#16a34a', stem: '#78350f' },
      tomato: { body: '#dc2626', stem: '#16a34a' },
      corn: { body: '#eab308', leaves: '#15803d', stem: '#78350f' },
      broccoli: { body: '#15803d', stalk: '#86efac' },
      dragon: { body: '#a7f3d0', head: '#a7f3d0', belly: '#fef08a', wings: '#f472b6', horns: '#fde047', spikes: '#f472b6', tail: '#a7f3d0' },
      dino: { body: '#34d399', head: '#34d399', belly: '#fef08a', spikes: '#38bdf8', snout: '#34d399', tail: '#34d399' },
      turtle: { shell: '#059669', spots: '#facc15', head: '#34d399', belly: '#fef08a', flippers: '#34d399', tail: '#34d399' },
      unicorn: { body: '#ffffff', head: '#ffffff', mane: '#fbcfe8', tail: '#fbcfe8', horn: '#fef08a', eyes: '#111827' },
      butterfly: { body: '#fbcfe8', wings: '#ffffff', spots: '#fbbf24', eyes: '#111827' },
      dolphin: { body: '#38bdf8', belly: '#ffffff', snout: '#bae6fd', dorsal_fin: '#0284c7', flippers: '#38bdf8', tail: '#0284c7', blush: '#f472b6', eyes: '#0f172a' },
      panda: { body: '#ffffff', head: '#ffffff', belly: '#ffffff', ears: '#374151', arms: '#374151', legs: '#374151', eye_patches: '#374151', snout: '#f472b6', blush: '#ff94a8', eyes: '#0f172a' },
      castle: {
        walls: '#fbcfe8',
        roofs: '#ec4899',
        gate: '#f59e0b',
        bridge: '#f8fafc',
        flags: '#a855f7',
        windows: '#fef08a',
        garden: '#22c55e',
        decorations: '#fbbf24',
      },
      robot: {
        head: '#7dd3fc',
        body: '#e2e8f0',
        arms: '#7dd3fc',
        legs: '#cbd5e1',
        face_screen: '#0f172a',
        eyes: '#22d3ee',
        blush: '#f472b6',
        antenna: '#facc15',
        belly_screen: '#facc15',
        jetpack: '#94a3b8',
      },
      sunflower: {
        petals: '#fde047',
        center: '#854d0e',
        seeds: '#f59e0b',
        stem: '#16a34a',
        leaves: '#22c55e',
        face: '#1e293b',
        blush: '#f472b6',
        critters: '#facc15',
      },
      rose: {
        petals: '#CC0000',
        stem: '#14532d',
        leaves: '#16a34a',
        dew: '#ffffff',
      },
      tulip: {
        petals: '#CC0000',
        stem: '#16a34a',
        leaves: '#16a34a',
      },
    };

    const accessoryDefaults: Record<string, string> = {
      crown: '#facc15',
      bow: '#ec4899',
      glasses: '#1e293b',
      wings: '#bae1ff',
    };

    return defaults[model]?.[part] || accessoryDefaults[part] || '#cccccc';
  };

  return (
    <main className="relative w-screen h-dvh overflow-hidden bg-[#f7f9fe] flex flex-col justify-between font-['Fredoka',sans-serif] pb-[env(safe-area-inset-bottom)]">
      {/* 3D Viewport - Fixed to background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <ThreeCanvas
          mode={mode}
          currentModel={currentModel}
          drawingCanvasRef={drawingCanvasRef}
          drawingMaterial={drawingMaterial}
          drawingVersion={drawingVersion}
          activeTool={activeTool}
          activeColor={activeColor}
          activeColorType={activeColorType}
          activeStickerEmoji={activeStickerEmoji}
          modelPartColors={modelPartColors}
          onModelPartColorChange={handleModelPartColorChange}
          stickers={stickers}
          onAddSticker={handleAddSticker}
          fineDetailStrokes={[]}
          onAddFineDetailStroke={handleAddFineDetailStroke}
          isAnimating={isAnimating}
          activeWorld={activeWorld}
          animationAction={animationAction}
          zoomLevel={zoomLevel}
          rotationOffset={rotationOffset}
          brushSize={brushSize}
          stickerSize={stickerSize}
          studioThemeId={studioThemeId}
          activeAccessories={activeAccessories}
          canvasMaps={canvasMaps}
          onSaveCanvasMap={handleSaveCanvasMap}
          cameraOrbit={currentModelData.cameraOrbit}
          onSaveCameraOrbit={handleSaveCameraOrbit}
        />
      </div>

      {/* HEADER */}
      <header className="relative z-10 w-full px-2 sm:px-6 pt-[max(0.35rem,env(safe-area-inset-top))] sm:pt-4 flex items-center justify-between pointer-events-none gap-1 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-3 pointer-events-auto shrink-0">
          <button
            onClick={() => { playPop(); if (isAnimating) setIsAnimating(false); else setIsLibraryModalOpen(true); }}
            className="w-8 h-8 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center text-sky-500 shadow-md sm:shadow-lg border-b-2 sm:border-b-4 border-slate-200 hover:translate-y-0.5 active:border-b-0 transition-all cursor-pointer"
            title="Ana Menü / Galeri"
          >
            <Home size={16} className="sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() => { playMagic(); setIsDrawingModalOpen(true); }}
            className="px-2 sm:px-5 py-1.5 sm:py-2.5 bg-indigo-500 text-white font-black rounded-full shadow-md sm:shadow-lg border-b-2 sm:border-b-4 border-indigo-700 hover:translate-y-0.5 active:border-b-0 transition-all flex items-center gap-1 sm:gap-2 cursor-pointer text-[11px] sm:text-base animate-pulse shrink-0"
            title="Sihirli Çizim Fırını"
          >
            <Sparkles size={13} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">✨ Sihirli Fırın 🎨</span>
            <span className="sm:hidden font-bold">Fırın</span>
          </button>
          <h1 className="text-xs sm:text-3xl font-black tracking-tight flex items-center gap-1 leading-tight shrink-0">
            <span className="text-pink-500 drop-shadow-sm">3D BOYAMA</span>
            <span className="text-sky-500 drop-shadow-sm hidden md:inline">STÜDYOSU</span>
          </h1>
        </div>

        <div className="pointer-events-auto flex items-center gap-1 sm:gap-2.5 justify-end shrink-0">
          {/* Auto Save Status Badge & Toggle */}
          <button
            onClick={handleToggleAutoSave}
            className={`h-8 px-2 sm:h-auto sm:px-3 py-1 sm:py-2 rounded-full font-black text-[10px] sm:text-xs flex items-center justify-center gap-1 shadow-md border-b-2 transition-all cursor-pointer ${
              saveStatus === 'saving'
                ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                : saveStatus === 'saved'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : saveStatus === 'failed'
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
            }`}
            title={saveStatus === 'saving' ? 'Kaydediliyor…' : saveStatus === 'saved' ? 'Otomatik Kaydedildi ✓' : 'Otomatik Kayıt'}
          >
            <span className="text-xs sm:text-sm">
              {saveStatus === 'saving' ? '⏳' : saveStatus === 'saved' ? '✓' : saveStatus === 'failed' ? '⚠️' : '💾'}
            </span>
            <span className="hidden sm:inline">
              {saveStatus === 'saving'
                ? 'Kaydediliyor…'
                : saveStatus === 'saved'
                ? 'Oto Kayıt ✓'
                : saveStatus === 'failed'
                ? 'Hata'
                : 'Oto Kapalı'}
            </span>
          </button>

          {/* Manual Save Button */}
          <button
            onClick={handleManualSave}
            className="w-8 h-8 sm:w-auto sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black rounded-full shadow-md sm:shadow-lg border-b-2 sm:border-b-4 border-emerald-700 hover:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-1 cursor-pointer text-xs sm:text-sm"
            title="Mevcut Eseri Manuel Kaydet"
          >
            <span>💾</span>
            <span className="hidden sm:inline">Kaydet</span>
          </button>

          {/* New / Clear Artwork Button */}
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="w-8 h-8 sm:w-auto sm:px-4 sm:py-2 bg-white text-rose-500 font-bold rounded-full shadow-md sm:shadow-lg border-b-2 sm:border-b-4 border-slate-200 hover:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-1 cursor-pointer text-xs sm:text-sm"
            title="Yeni Çalışma Aç / Temizle"
          >
            <span>✨</span>
            <span className="hidden sm:inline">Yeni</span>
          </button>

          {/* Cycle theme button */}
          <button
            onClick={handleCycleTheme}
            className="w-8 h-8 sm:w-auto sm:px-4 sm:py-2 bg-white text-slate-700 font-bold rounded-full shadow-md sm:shadow-lg border-b-2 sm:border-b-4 border-slate-200 hover:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs sm:text-sm"
            title="Sahne Temasını Değiştir"
          >
            <span className="text-sm sm:text-lg">{activeStudioTheme.emoji}</span>
            <span className="hidden md:inline">{activeStudioTheme.name}</span>
          </button>

          {/* Music button */}
          <button
            onClick={() => {
              if (isMusicPlaying) stopBackgroundMusic();
              else startBackgroundMusic();
              setIsMusicPlaying(!isMusicPlaying);
              playPop();
            }}
            className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-md sm:shadow-lg border-b-2 sm:border-b-4 transition-all cursor-pointer ${
              isMusicPlaying 
                ? 'bg-amber-400 border-amber-600 text-white' 
                : 'bg-white text-slate-400 border-slate-200'
            }`}
            title="Arka Plan Müziği"
          >
            <Music size={15} className="sm:w-5 sm:h-5" />
          </button>

          {/* Snapshot button */}
          <button
            onClick={handleDownloadSnapshot}
            className="w-8 h-8 sm:w-auto sm:px-4 sm:py-2 bg-white text-slate-700 font-bold rounded-full shadow-md sm:shadow-lg border-b-2 sm:border-b-4 border-slate-200 hover:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs sm:text-sm"
            title="Fotoğraf Çek"
          >
            <Camera size={14} className="sm:w-5 sm:h-5 text-pink-400 shrink-0" />
            <span className="hidden sm:inline">Fotoğraf</span>
          </button>

          {isAnimating && (
            <button
              onClick={() => setIsAnimating(false)}
              className="px-2.5 sm:px-5 py-1.5 sm:py-2.5 bg-rose-500 text-white font-black rounded-full shadow-md sm:shadow-lg border-b-2 sm:border-b-4 border-rose-700 hover:translate-y-0.5 active:border-b-0 transition-all cursor-pointer flex items-center gap-1.5 text-xs sm:text-sm"
            >
              <StopCircle size={14} className="sm:w-5 sm:h-5" />
              <span>Durdur</span>
            </button>
          )}
        </div>
      </header>



      {/* CENTER ROW (Desktop sidebars side-by-side) */}
      <div className="relative z-10 flex-1 w-full px-4 sm:px-6 hidden sm:flex items-center justify-between pointer-events-none gap-2 sm:gap-6 overflow-hidden">
        {/* LEFT SIDEBAR - Responsive & Modernized */}
        <aside className="flex flex-col gap-2 sm:gap-3 pointer-events-auto w-44 sm:w-64 max-h-[76vh] select-none overflow-y-auto kawaii-scrollbar pr-0.5">
          {/* 1. SEÇ - Hayvan Seçimi Card */}
          <div className="bg-gradient-to-br from-white via-sky-50/60 to-indigo-50/40 backdrop-blur-lg p-2.5 sm:p-4 rounded-[2rem] shadow-2xl border-3 sm:border-4 border-sky-100/90 flex flex-col gap-2 sm:gap-3 relative overflow-hidden">
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none opacity-20">
              <span className="absolute top-1 right-2 text-[10px]">✨</span>
            </div>
            <div className="flex items-center justify-between relative z-10">
              <span className="font-black text-sky-900 text-[10px] sm:text-xs tracking-tight flex items-center gap-1.5">
                <Library size={15} className="text-sky-500 shrink-0" />
                <span className="hidden xs:inline">🐾 HAYVAN SEÇ</span>
                <span className="xs:hidden">🐾 SEÇ</span>
              </span>
              <button
                onClick={() => {
                  playPop();
                  setIsLibraryModalOpen(true);
                }}
                className="px-2.5 py-1 bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-500 hover:to-indigo-600 active:scale-95 text-white font-black text-[9px] sm:text-[10px] rounded-full shadow-xs transition-all flex items-center gap-1 cursor-pointer btn-press"
              >
                <span>TÜMÜ</span>
                <span className="text-[10px]">✨</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 relative z-10">
              {ALL_MODELS.filter((m) => m.category === 'animals').slice(0, 8).map((m) => {
                const isSelected = currentModel === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectModel(m.id)}
                    title={m.name}
                    className={`w-full aspect-square rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-2xl transition-all duration-200 border-2 cursor-pointer btn-press ${
                      isSelected
                        ? 'bg-gradient-to-tr from-sky-400 to-blue-500 border-white text-white scale-110 shadow-lg ring-3 ring-sky-200 -translate-y-0.5 z-10'
                        : 'bg-white/95 border-slate-200/90 text-slate-800 hover:bg-white hover:border-sky-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-md grayscale hover:grayscale-0'
                    }`}
                  >
                    <span className="filter drop-shadow-2xs">{m.emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. EK - Aksesuarlar Card */}
          <div className="bg-gradient-to-br from-white via-amber-50/60 to-orange-50/40 backdrop-blur-lg p-2.5 sm:p-4 rounded-[2rem] shadow-2xl border-3 sm:border-4 border-amber-100/90 flex flex-col gap-2 sm:gap-3 relative overflow-hidden">
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none opacity-20">
              <span className="absolute top-1 right-2 text-[10px]">💖</span>
            </div>
            <span className="font-black text-amber-900 text-[10px] sm:text-xs tracking-tight flex items-center gap-1.5 relative z-10">
              <span className="text-amber-500 text-sm">✨</span>
              <span className="hidden xs:inline">AKSESUARLAR</span>
              <span className="xs:hidden">EK</span>
            </span>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 relative z-10">
              {[
                { id: 'crown', emoji: '👑', label: 'Taç' },
                { id: 'bow', emoji: '🎀', label: 'Fiyonk' },
                { id: 'glasses', emoji: '👓', label: 'Gözlük' },
                { id: 'wings', emoji: '🪽', label: 'Kanat' },
              ].map((acc) => {
                const isSelected = activeAccessories.includes(acc.id as AccessoryId);
                return (
                  <button
                    key={acc.id}
                    onClick={() => handleToggleAccessory(acc.id as AccessoryId)}
                    title={acc.label}
                    className={`w-full aspect-square rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-2xl transition-all duration-200 border-2 cursor-pointer btn-press ${
                      isSelected
                        ? 'bg-gradient-to-tr from-amber-400 to-orange-400 border-white text-amber-950 scale-110 shadow-lg ring-3 ring-amber-200 -translate-y-0.5 z-10'
                        : 'bg-white/95 border-slate-200/90 text-slate-800 hover:bg-amber-50 hover:border-amber-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-md grayscale hover:grayscale-0'
                    }`}
                  >
                    <span className="filter drop-shadow-2xs">{acc.emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. YER - Boyama Bölgeleri Card */}
          <div className="bg-gradient-to-br from-white via-purple-50/60 to-pink-50/40 backdrop-blur-lg p-2.5 sm:p-4 rounded-[2rem] shadow-2xl border-3 sm:border-4 border-purple-100/90 flex flex-col gap-2 sm:gap-3 flex-1 overflow-hidden min-h-0 relative">
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none opacity-20">
              <span className="absolute top-1 right-2 text-[10px]">🌸</span>
            </div>
            <span className="font-black text-purple-900 text-[10px] sm:text-xs tracking-tight flex items-center gap-1.5 relative z-10">
              <span className="text-purple-500 text-sm">🎯</span>
              <span className="hidden xs:inline">BOYAMA BÖLGELERİ</span>
              <span className="xs:hidden">BÖLGELER</span>
            </span>
            <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 kawaii-scrollbar max-h-[20vh] sm:max-h-[38vh]">
              {getRegions().map((r) => {
                const resolvedColor = modelPartColors[r] || getDefaultColor(currentModel, r);
                return (
                  <button
                    key={r}
                    onClick={() => {
                      playPop();
                      setActiveTool('bucket');
                      handleModelPartColorChange(r, activeColor);
                    }}
                    className="px-3 py-2.5 bg-slate-50/90 hover:bg-purple-50/80 active:bg-purple-100 text-slate-700 hover:text-purple-950 font-bold text-[10px] sm:text-xs rounded-2xl border border-slate-200/80 text-left capitalize transition-all duration-200 flex items-center justify-between group cursor-pointer btn-press shadow-2xs hover:shadow-xs hover:border-purple-200"
                  >
                    <span className="truncate pr-1">{getRegionLabel(currentModel, r)}</span>
                    <div
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white shadow-md ring-1 ring-black/10 transition-transform duration-200 group-hover:scale-110 shrink-0 flex items-center justify-center text-[10px]"
                      style={{ backgroundColor: getDisplayColor(resolvedColor) }}
                    >
                      {resolvedColor.startsWith('glitter:') && '✨'}
                      {resolvedColor.startsWith('pattern:') && '🎨'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* RIGHT SIDEBAR */}
        <aside className="pointer-events-auto">
          <RightPalette
            activeTool={activeTool}
            onSelectTool={setActiveTool}
            activeColor={activeColor}
            activeColorType={activeColorType}
            onSelectColor={(p) => { setActiveColor(p.color); setActiveColorType(p.type); playPop(); }}
            activeStickerEmoji={activeStickerEmoji}
            onSelectSticker={(e) => { setActiveStickerEmoji(e); setActiveTool('sticker'); playMagic(); }}
            stickerSize={stickerSize}
            onStickerSizeChange={setStickerSize}
            brushSize={brushSize}
            onBrushSizeChange={setBrushSize}
            onUndo={handleUndo}
            onClearStickers={handleClearStickers}
          />
        </aside>
      </div>

      {/* MOBILE BOTTOM SHEET MODAL (< sm portrait) */}
      {mobileTab !== 'none' && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end sm:hidden">
          {/* Backdrop Dismiss Area */}
          <div className="absolute inset-0" onClick={() => setMobileTab('none')} />

          <div className="relative w-full max-h-[52vh] bg-white rounded-t-[2.25rem] p-3.5 shadow-2xl border-t-4 border-indigo-300 flex flex-col gap-2.5 overflow-hidden animate-in slide-in-from-bottom duration-200 z-10 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {/* Drawer Handle & Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto absolute top-2 left-1/2 -translate-x-1/2" />
              <span className="font-black text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                {mobileTab === 'model' && '🐾 Hayvan & Karakter Seç'}
                {mobileTab === 'regions' && '🎯 Boyama Bölgeleri'}
                {mobileTab === 'paint' && '🎨 Boya, Renkler & Fırça'}
                {mobileTab === 'accessories' && '💖 Aksesuarlar & Süsler'}
              </span>
              <button
                onClick={() => setMobileTab('none')}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-full flex items-center justify-center text-slate-600 font-black text-xs cursor-pointer"
                title="Kapat"
              >
                ✕
              </button>
            </div>

            {/* TAB CONTENT: MODEL SELECTOR */}
            {mobileTab === 'model' && (
              <div className="flex-1 overflow-y-auto kawaii-scrollbar flex flex-col gap-2.5 pr-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">Boyamak istediğin hayvanı seç:</span>
                  <button
                    onClick={() => {
                      playPop();
                      setIsLibraryModalOpen(true);
                      setMobileTab('none');
                    }}
                    className="px-2.5 py-1 bg-gradient-to-r from-sky-400 to-indigo-500 text-white font-black text-[10px] rounded-full shadow-xs cursor-pointer active:scale-95"
                  >
                    Tüm Modeller ✨
                  </button>
                </div>
                <div className="grid grid-cols-4 xs:grid-cols-5 gap-2 pb-2">
                  {ALL_MODELS.filter((m) => m.category === 'animals').slice(0, 16).map((m) => {
                    const isSelected = currentModel === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          handleSelectModel(m.id);
                          setMobileTab('none');
                        }}
                        className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-400 border-white text-white shadow-md scale-105 ring-2 ring-sky-200'
                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-white'
                        }`}
                      >
                        <span className="text-2xl">{m.emoji}</span>
                        <span className="text-[9px] font-bold truncate max-w-full px-1">{m.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: REGIONS */}
            {mobileTab === 'regions' && (
              <div className="flex-1 overflow-y-auto kawaii-scrollbar flex flex-col gap-2 pr-0.5 pb-2">
                <p className="text-[11px] text-slate-500 font-semibold">
                  Bir bölgeye dokunarak boyayabilirsin (Aktif Renk: {activeColor}):
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {getRegions().map((r) => {
                    const resolvedColor = modelPartColors[r] || getDefaultColor(currentModel, r);
                    return (
                      <button
                        key={r}
                        onClick={() => {
                          playPop();
                          setActiveTool('bucket');
                          handleModelPartColorChange(r, activeColor);
                        }}
                        className="px-2.5 py-2.5 bg-slate-50 hover:bg-purple-50 active:bg-purple-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer shadow-2xs"
                      >
                        <span className="truncate pr-1 text-[11px]">{getRegionLabel(currentModel, r)}</span>
                        <div
                          className="w-5 h-5 rounded-full border-2 border-white shadow-sm shrink-0 flex items-center justify-center text-[9px]"
                          style={{ backgroundColor: getDisplayColor(resolvedColor) }}
                        >
                          {resolvedColor.startsWith('glitter:') && '✨'}
                          {resolvedColor.startsWith('pattern:') && '🎨'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: PAINT & COLORS */}
            {mobileTab === 'paint' && (
              <div className="flex-1 overflow-y-auto kawaii-scrollbar flex justify-center w-full pb-2">
                <RightPalette
                  activeTool={activeTool}
                  onSelectTool={setActiveTool}
                  activeColor={activeColor}
                  activeColorType={activeColorType}
                  onSelectColor={(p) => { setActiveColor(p.color); setActiveColorType(p.type); playPop(); }}
                  activeStickerEmoji={activeStickerEmoji}
                  onSelectSticker={(e) => { setActiveStickerEmoji(e); setActiveTool('sticker'); playMagic(); }}
                  stickerSize={stickerSize}
                  onStickerSizeChange={setStickerSize}
                  brushSize={brushSize}
                  onBrushSizeChange={setBrushSize}
                  onUndo={handleUndo}
                  onClearStickers={handleClearStickers}
                  initialTab="paint"
                  isMobileModal={true}
                />
              </div>
            )}

            {/* TAB CONTENT: ACCESSORIES & STICKERS */}
            {mobileTab === 'accessories' && (
              <div className="flex-1 overflow-y-auto kawaii-scrollbar flex flex-col gap-3 pb-2">
                {/* 3D Accessories Toggle */}
                <div className="bg-amber-50/80 p-2.5 rounded-2xl border border-amber-200/90">
                  <span className="font-black text-amber-900 text-xs flex items-center gap-1.5 mb-2">
                    <span>✨</span> 3D Aksesuarlar (Tak / Çıkar)
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'crown', emoji: '👑', label: 'Taç' },
                      { id: 'bow', emoji: '🎀', label: 'Fiyonk' },
                      { id: 'glasses', emoji: '👓', label: 'Gözlük' },
                      { id: 'wings', emoji: '🪽', label: 'Kanat' },
                    ].map((acc) => {
                      const isSelected = activeAccessories.includes(acc.id as AccessoryId);
                      return (
                        <button
                          key={acc.id}
                          onClick={() => handleToggleAccessory(acc.id as AccessoryId)}
                          className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-400 border-white text-amber-950 shadow-md scale-105'
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <span className="text-2xl">{acc.emoji}</span>
                          <span className="text-[10px] font-bold">{acc.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sticker Palette */}
                <div className="flex justify-center w-full">
                  <RightPalette
                    activeTool={activeTool}
                    onSelectTool={setActiveTool}
                    activeColor={activeColor}
                    activeColorType={activeColorType}
                    onSelectColor={(p) => { setActiveColor(p.color); setActiveColorType(p.type); playPop(); }}
                    activeStickerEmoji={activeStickerEmoji}
                    onSelectSticker={(e) => { setActiveStickerEmoji(e); setActiveTool('sticker'); playMagic(); }}
                    stickerSize={stickerSize}
                    onStickerSizeChange={setStickerSize}
                    brushSize={brushSize}
                    onBrushSizeChange={setBrushSize}
                    onUndo={handleUndo}
                    onClearStickers={handleClearStickers}
                    initialTab="accessories"
                    isMobileModal={true}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER - Floating controls above bottom dock on mobile */}
      <footer className="relative z-10 w-full px-2 sm:px-8 pb-16 sm:pb-8 flex items-end justify-between pointer-events-none gap-2 sm:gap-8">
        <div className="flex items-center gap-1 sm:gap-3 pointer-events-auto bg-white/90 backdrop-blur-md p-1 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-xl border border-white shrink-0">
          <button onClick={handleRotate} className="w-8 h-8 sm:w-12 sm:h-12 bg-white rounded-lg sm:rounded-2xl flex items-center justify-center text-sky-600 shadow-md border-b-2 sm:border-b-4 border-slate-200 hover:translate-y-0.5 active:border-b-0 transition-all cursor-pointer" title="Döndür"><RotateCw size={15} className="sm:w-5 sm:h-5" /></button>
          <button onClick={handleZoom} className="w-8 h-8 sm:w-12 sm:h-12 bg-white rounded-lg sm:rounded-2xl flex items-center justify-center text-sky-600 shadow-md border-b-2 sm:border-b-4 border-slate-200 hover:translate-y-0.5 active:border-b-0 transition-all cursor-pointer" title="Yakınlaştır"><ZoomIn size={15} className="sm:w-5 sm:h-5" /></button>
          <button onClick={handleUndo} className="w-8 h-8 sm:w-12 sm:h-12 bg-white rounded-lg sm:rounded-2xl flex items-center justify-center text-slate-600 shadow-md border-b-2 sm:border-b-4 border-slate-200 hover:translate-y-0.5 active:border-b-0 transition-all cursor-pointer" title="Geri Al"><Undo size={15} className="sm:w-5 sm:h-5" /></button>
          <button onClick={handleReset} className="w-8 h-8 sm:w-12 sm:h-12 bg-white rounded-lg sm:rounded-2xl flex items-center justify-center text-rose-500 shadow-md border-b-2 sm:border-b-4 border-slate-200 hover:translate-y-0.5 active:border-b-0 transition-all cursor-pointer" title="Sıfırla"><RotateCcw size={15} className="sm:w-5 sm:h-5" /></button>
        </div>

        <div className="pointer-events-auto flex-1 max-w-xl hidden md:block">
          <BoyobotDialogue message={boyobotMsg} onAskTip={handleAskTip} isLoading={isBoyobotThinking} task={task} />
        </div>

        <div className="pointer-events-auto shrink-0">
          <button
            onClick={handleOpenAnimate}
            className="px-3 sm:px-10 py-2 sm:py-5 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-black text-xs sm:text-2xl rounded-xl sm:rounded-[2.5rem] shadow-xl sm:shadow-2xl border-b-2 sm:border-b-8 border-emerald-700 hover:translate-y-0.5 sm:hover:translate-y-1 active:border-b-0 transition-all flex items-center gap-1.5 sm:gap-4 group cursor-pointer"
          >
            <Sparkles size={16} className="sm:w-7 sm:h-7 group-hover:animate-spin" />
            <span>CANLANDIR!</span>
          </button>
        </div>
      </footer>

      {/* MOBILE BOTTOM DOCK TOOLBAR (< sm portrait) */}
      <div className="sm:hidden fixed bottom-1 inset-x-2 z-30 pointer-events-auto">
        <nav aria-label="Mobil Araç Çubuğu" className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-indigo-100/90 p-1 flex items-center justify-between gap-1">
          <button
            onClick={() => { playPop(); setMobileTab(mobileTab === 'model' ? 'none' : 'model'); }}
            className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              mobileTab === 'model' ? 'bg-sky-500 text-white shadow-md scale-102' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-base">🐾</span>
            <span className="text-[10px] font-black tracking-tight">Model</span>
          </button>

          <button
            onClick={() => { playPop(); setMobileTab(mobileTab === 'regions' ? 'none' : 'regions'); }}
            className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              mobileTab === 'regions' ? 'bg-purple-500 text-white shadow-md scale-102' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-base">🎯</span>
            <span className="text-[10px] font-black tracking-tight">Bölgeler</span>
          </button>

          <button
            onClick={() => { playPop(); setMobileTab(mobileTab === 'paint' ? 'none' : 'paint'); }}
            className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              mobileTab === 'paint' ? 'bg-pink-500 text-white shadow-md scale-102' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-base">🎨</span>
            <span className="text-[10px] font-black tracking-tight">Boya</span>
          </button>

          <button
            onClick={() => { playMagic(); setMobileTab(mobileTab === 'accessories' ? 'none' : 'accessories'); }}
            className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              mobileTab === 'accessories' ? 'bg-amber-400 text-amber-950 shadow-md scale-102' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-base">💖</span>
            <span className="text-[10px] font-black tracking-tight">Aksesuar</span>
          </button>
        </nav>
      </div>

      {/* LIVE ANIMATION 4-ACTION BAR (1, 2, 3, 4 Shortcuts & Touch Bar) */}
      {isAnimating && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md p-2 sm:p-3 rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-amber-300 flex items-center gap-2 sm:gap-4 max-w-[95vw] overflow-x-auto">
          {[
            { id: 'dance', label: '1. Dans Et', emoji: '💃', bg: 'from-pink-500 to-rose-500 border-pink-700' },
            { id: 'jump', label: '2. Zıpla', emoji: '🦘', bg: 'from-amber-400 to-orange-500 border-amber-700' },
            { id: 'fly', label: '3. Uç', emoji: '🚀', bg: 'from-sky-400 to-blue-600 border-sky-700' },
            { id: 'confetti', label: '4. Konfeti', emoji: '🎉', bg: 'from-purple-500 to-indigo-600 border-purple-700' },
          ].map((act) => {
            const isActive = animationAction === act.id;
            return (
              <button
                key={act.id}
                onClick={() => {
                  if (act.id === 'confetti') {
                    playMagic();
                    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
                  } else if (act.id === 'jump') {
                    playBoing();
                  } else if (act.id === 'fly') {
                    playMagic();
                  } else {
                    playPop();
                  }
                  setAnimationAction(act.id as any);
                }}
                className={`px-3 sm:px-5 py-2 sm:py-3.5 rounded-xl sm:rounded-2xl text-white font-black text-xs sm:text-base flex items-center gap-1.5 sm:gap-2 shadow-lg border-b-4 transition-all cursor-pointer whitespace-nowrap bg-gradient-to-r ${act.bg} ${
                  isActive ? 'scale-110 ring-4 ring-yellow-300 z-10' : 'opacity-90 hover:opacity-100 hover:scale-105 active:scale-95'
                }`}
              >
                <span className="text-base sm:text-xl">{act.emoji}</span>
                <span>{act.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => { playPop(); setIsAnimating(false); }}
            className="px-3 sm:px-5 py-2 sm:py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs sm:text-base rounded-xl sm:rounded-2xl shadow-lg border-b-4 border-slate-950 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            title="Animasyonu Durdur"
          >
            <StopCircle size={18} className="sm:w-5 sm:h-5 text-rose-400" />
            <span>Durdur</span>
          </button>
        </div>
      )}

      {/* MODALS */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border-4 border-pink-300 text-center flex flex-col items-center gap-5">
            <div className="w-20 h-20 bg-pink-100 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner border-2 border-pink-200">🧼</div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">Çalışmayı Sıfırla?</h2>
              <p className="text-slate-600 font-bold text-sm mt-2">
                {modelNames[currentModel]} üzerindeki tüm renk, desen ve süslemeleri temizlemek istediğine emin misin?
              </p>
            </div>
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl border-2 border-slate-200 transition-all cursor-pointer"
              >
                Vazgeç ❌
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-2xl shadow-lg border-b-4 border-rose-700 transition-all cursor-pointer"
              >
                Evet, Temizle 🧼
              </button>
            </div>
          </div>
        </div>
      )}

      {isAnimateModalOpen && (
        <AnimateModal
          characterName={mode === 'draw_3d' ? '3D Tasarımın' : modelNames[currentModel]}
          activeWorld={activeWorld}
          onSelectWorld={(w) => { setActiveWorld(w); fetchAnimationStory(w); }}
          animationAction={animationAction}
          onSelectAction={setAnimationAction}
          onStartAnimation={handleStartAnimation}
          onClose={() => setIsAnimateModalOpen(false)}
          story={story}
          isStoryLoading={isStoryLoading}
          onRegenerateStory={() => fetchAnimationStory(activeWorld, true)}
          onDownloadSnapshot={handleDownloadSnapshot}
        />
      )}

      {isLibraryModalOpen && (
        <ModelLibraryModal
          onClose={() => setIsLibraryModalOpen(false)}
          onSelectModel={handleSelectModel}
          currentModel={currentModel}
        />
      )}

      {isDrawingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <DrawCanvas
            canvasRef={drawingCanvasRef}
            material={drawingMaterial}
            onMaterialChange={setDrawingMaterial}
            onBakeTo3D={handleBakeSuccess}
            onCancel={() => setIsDrawingModalOpen(false)}
          />
        </div>
      )}

      {completedTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl border-4 border-amber-400 text-center flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-[2rem] flex items-center justify-center text-6xl shadow-lg border-4 border-white animate-bounce">🏆</div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-700 bg-amber-100 px-4 py-1.5 rounded-full border border-amber-200">Görev Tamamlandı!</span>
              <h2 className="text-3xl font-black text-slate-800 mt-3">Harikasın! 🎉</h2>
              <p className="text-slate-600 font-bold mt-2">"{completedTaskModal}"</p>
            </div>
            <button onClick={() => setCompletedTaskModal(null)} className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-black text-lg rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">Süper!</button>
          </div>
        </div>
      )}
    </main>
  );
}
