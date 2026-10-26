export type AppMode = 'ready_models' | 'draw_3d';

export type PaintTool =
  | 'brush'
  | 'eraser'
  | 'bucket'
  | 'spray'
  | 'magic'
  | 'watercolor'
  | 'sticker'
  | 'fine_detail'
  | 'eyebrow'
  | 'eyelash'
  | 'nose'
  | 'mouth'
  | 'pattern_brush';

export type AccessoryId = 'crown' | 'bow' | 'glasses' | 'wings';


export interface FineDetailStroke {
  id: string;
  points: [number, number, number][];
  color: string;
  size: number;
}

export type ModelCategory =
  | 'classics'
  | 'flowers'
  | 'animals'
  | 'fruits'
  | 'vegetables'
  | 'houses';

export type ModelId =
  // 🌟 Karakterler
  | 'rocket'
  | 'castle'
  | 'robot'
  // 🌺 1. Çeşitli Çiçekler
  | 'sunflower'
  | 'rose'
  | 'daisy'
  | 'tulip'
  // 🦁 2. Çeşitli Hayvanlar
  | 'kitty'
  | 'dog'
  | 'rabbit'
  | 'cow'
  | 'sheep'
  | 'horse'
  | 'chick'
  | 'penguin'
  | 'dragon'
  | 'dino'
  | 'turtle'
  | 'unicorn'
  | 'lion'
  | 'butterfly'
  | 'dolphin'
  | 'panda'
  // 🍎 3. Çeşitli Meyveler
  | 'apple'
  | 'banana'
  | 'strawberry'
  | 'watermelon'
  // 🥕 4. Çeşitli Sebzeler
  | 'carrot'
  | 'broccoli'
  | 'tomato'
  | 'corn'
  // 🏡 5. Ev ve Yaşam Alanları
  | 'cottage'
  | 'mushroom_house'
  | 'treehouse';

export interface ModelDefinition {
  id: ModelId;
  name: string;
  category: ModelCategory;
  emoji: string;
  desc: string;
}

export type MaterialType = 'pelus' | 'metal' | 'hamur' | 'seker';

export type WorldId = 'space' | 'chocolate' | 'clouds' | 'forest' | 'dino' | 'kawaii';

export interface StickerItem {
  id: string;
  emoji: string;
  name: string;
  category: 'eyes' | 'face' | 'accessories' | 'magic' | 'cute';
}

export interface PlacedSticker {
  id: string;
  emoji: string;
  position: [number, number, number];
  normal: [number, number, number];
  rotation: number;
  scale: number;
}

export interface ColorPreset {
  id: string;
  color: string;
  name: string;
  type: 'solid' | 'glitter' | 'pattern';
  secondaryColor?: string;
  patternId?: string;
}

export interface DailyTask {
  id: string;
  description: string;
  category: ModelCategory | 'any';
  action: 'paint' | 'sticker';
  target: string; // color name, sticker emoji, etc.
  requiredCount?: number;
  currentCount: number;
}

export type StudioThemeId = 'sunny_sky' | 'green_garden' | 'candy_workshop' | 'kawaii';

export interface StudioTheme {
  id: StudioThemeId;
  name: string;
  emoji: string;
  bgColor: string;
  podiumColor: string;
}

export const STUDIO_THEMES: StudioTheme[] = [
  {
    id: 'kawaii',
    name: 'Kawaii Dünyası',
    emoji: '💖',
    bgColor: '#fbcfe8', // Soft Pink
    podiumColor: '#fbcfe8', // Pastel Pink Stand
  },
  {
    id: 'sunny_sky',
    name: 'Güneşli Gökyüzü',
    emoji: '☀️',
    bgColor: '#bae6fd', // Pastel Sky Blue
    podiumColor: '#fde68a', // Soft Warm Honey Wood
  },
  {
    id: 'green_garden',
    name: 'Yeşil Bahçe',
    emoji: '🌿',
    bgColor: '#bbf7d0', // Soft Meadow Green
    podiumColor: '#fef08a', // Daisy Yellow
  },
  {
    id: 'candy_workshop',
    name: 'Şeker Atölyesi',
    emoji: '🍬',
    bgColor: '#fdf4ff', // Light Lavender
    podiumColor: '#a7f3d0', // Mint Stand
  },
];
