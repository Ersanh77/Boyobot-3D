import * as THREE from 'three';
import { ModelId, ModelCategory, ModelDefinition } from '../types';
import {
  createBabyDragon,
  createRocket,
  createCastle,
  createRobot,
  createKitty,
} from './models';
import {
  createSunflower,
  createRose,
  createDaisy,
  createTulip,
  createLion,
  createDog,
  createRabbit,
  createCow,
  createSheep,
  createHorse,
  createChick,
  createPenguin,
  createDino,
  createTurtle,
  createUnicorn,
  createButterfly,
  createDolphin,
  createPanda,
  createApple,
  createBanana,
  createStrawberry,
  createWatermelon,
  createCarrot,
  createBroccoli,
  createTomato,
  createCorn,
  createCottage,
  createMushroomHouse,
  createTreehouse,
} from './newModels';

export const CATEGORIES: { id: ModelCategory; label: string; icon: string }[] = [
  { id: 'animals', label: 'Hayvanlar', icon: '🐶' },
  { id: 'classics', label: 'Karakterler', icon: '🌟' },
  { id: 'flowers', label: 'Çiçekler', icon: '🌺' },
  { id: 'fruits', label: 'Meyveler', icon: '🍎' },
  { id: 'vegetables', label: 'Sebzeler', icon: '🥕' },
  { id: 'houses', label: 'Evler & Yaşam', icon: '🏡' },
];

export const ALL_MODELS: ModelDefinition[] = [
  // 🐶 1. Hayvanlar (Animals) - Featured First!
  { id: 'kitty', name: 'Sevimli Kedi', category: 'animals', emoji: '🐱', desc: 'Büyük sevimli gözlü, patili oyuncak yavru kedi!' },
  { id: 'dog', name: 'Sevimli Köpek', category: 'animals', emoji: '🐶', desc: 'Sarkan kulaklı, neşeli oyuncak köpek yavrusu!' },
  { id: 'rabbit', name: 'Minik Tavşan', category: 'animals', emoji: '🐰', desc: 'Uzun kulaklı, pofuduk sevimli tavşan!' },
  { id: 'cow', name: 'Sütçü İnek', category: 'animals', emoji: '🐮', desc: 'Siyah beyaz benekli, pembe burunlu sevimli inek!' },
  { id: 'sheep', name: 'Kıvırcık Koyun', category: 'animals', emoji: '🐑', desc: 'Yumuşacık kıvırcık yünlü sevimli koyun!' },
  { id: 'horse', name: 'Rüzgar Atı', category: 'animals', emoji: '🐴', desc: 'Yeleli ve toynaklı sevimli oyuncak at!' },
  { id: 'chick', name: 'Papağan & Muhabbet Kuşu', category: 'animals', emoji: '🦜', desc: 'Tünekte duran, açılıp kapanan kanatlı ve uzun renkli kuyruklu sevimli papağan!' },
  { id: 'penguin', name: 'Pofuduk Penguen', category: 'animals', emoji: '🐧', desc: 'Siyah beyaz sevimli penguen dostumuz!' },
  { id: 'dragon', name: 'Sevimli Ejderha', category: 'animals', emoji: '🐲', desc: 'Ateş saçan, pofuduk sevimli ejderha!' },
  { id: 'dino', name: 'Sevimli Dinozor', category: 'animals', emoji: '🦕', desc: 'Sırtı dikenli, uzun kuyruklu sevimli dinozor!' },
  { id: 'turtle', name: 'Sevimli Kaplumbağa', category: 'animals', emoji: '🐢', desc: 'Desenli kabuklu, deniz sakini kaplumbağa!' },
  { id: 'unicorn', name: 'Tek Boynuzlu At', category: 'animals', emoji: '🦄', desc: 'Altın boynuzlu ve gökkuşağı yeleli unicorn!' },
  { id: 'lion', name: 'Sevimli Aslan', category: 'animals', emoji: '🦁', desc: 'Pofuduk yelesi olan neşeli ormanlar kralı!' },
  { id: 'butterfly', name: 'Renkli Kelebek', category: 'animals', emoji: '🦋', desc: 'Desenli geniş kanatlarıyla süzülen kelebek!' },
  { id: 'dolphin', name: 'Sevimli Yunus', category: 'animals', emoji: '🐬', desc: 'Parlak gövdeli, güler yüzlü ve su kabarcıklı sevimli chibi yunus!' },
  { id: 'panda', name: 'Sevimli Panda', category: 'animals', emoji: '🐼', desc: 'Kollarını havaya kaldırmış neşeli kawaii chibi panda!' },

  // 🌟 Karakterler
  { id: 'rocket', name: 'Renkli Roket', category: 'classics', emoji: '🚀', desc: 'Yıldızlara uçmaya hazır uzay roketi!' },
  { id: 'castle', name: 'Masal Şatosu', category: 'classics', emoji: '🏰', desc: '5 kuleli, çiçek bahçeli, dalgalanan bayraklı ve perili masalsı Disney prenses şatosu!' },
  { id: 'robot', name: 'Kawaii Uzay Robotu', category: 'classics', emoji: '🤖', desc: 'LED gözlü, kalpli antenli, jetpackli ve renkli düğmeli sevimli uzay robotu!' },

  // 🌺 1. Çeşitli Çiçekler
  { id: 'sunflower', name: 'Kawaii Ayçiçeği', category: 'flowers', emoji: '🌻', desc: 'Göz kırpan sevimli anime yüzlü, altın tohumlu ve uçuşan arılı/kelebekli neşeli ayçiçeği!' },
  { id: 'rose', name: 'Klasik Kırmızı Gül', category: 'flowers', emoji: '🌹', desc: 'Spiral katmanlı yaprakları, dikenli sapı ve çiğ damlalarıyla muhteşem 3D derin kırmızı gül!' },
  { id: 'daisy', name: 'Papatya', category: 'flowers', emoji: '🌼', desc: 'Beyaz yapraklı, ortası sıcacık sarı papatya!' },
  { id: 'tulip', name: 'Tam Açık Yıldız Lale', category: 'flowers', emoji: '🌷', desc: '6 adet tamamen dışa açılmış sivri yaprağı, sarı ercik merkezi ve uzun şerit yapraklarıyla zarif tam açık lale!' },

  // 🍎 3. Çeşitli Meyveler
  { id: 'apple', name: 'Ayrık İkili Elma Kompozisyonu', category: 'fruits', emoji: '🍎', desc: 'Sağda su damlacıklı parlak kırmızı tam elma, solda kawaii yüzlü ve çekirdekli yarım elma — bağımsız ve yan yana!' },
  { id: 'banana', name: 'Sevimli Muz', category: 'fruits', emoji: '🍌', desc: 'Tatlı sarı kabuklu güler yüzlü muz!' },
  { id: 'strawberry', name: 'Sulu Çilek', category: 'fruits', emoji: '🍓', desc: 'Altın benekli, yeşil şapkalı taze çilek!' },
  { id: 'watermelon', name: 'Karpuz Dilimi', category: 'fruits', emoji: '🍉', desc: 'Çekirdekli, sulu kırmızı ferah karpuz dilimi!' },

  // 🥕 4. Çeşitli Sebzeler
  { id: 'carrot', name: 'Kawaii Sevimli Havuç', category: 'vegetables', emoji: '🥕', desc: 'Göz kırpan sevimli yüzü, tombul kavisli turuncu gövdesi, gür yeşil saçları, çiçekli tarlası ve minik tavşan arkadaşıyla neşeli havuç!' },
  { id: 'broccoli', name: 'Pofuduk Brokoli', category: 'vegetables', emoji: '🥦', desc: 'Küçük bir orman ağacına benzeyen brokoli!' },
  { id: 'tomato', name: 'Tombul Domates', category: 'vegetables', emoji: '🍅', desc: 'Kırmızı tombul ve yeşil şapkalı domates!' },
  { id: 'corn', name: 'Kawaii Sevimli Mısır', category: 'vegetables', emoji: '🌽', desc: 'Puf puf mısır taneli, püskül saçlı, açık yeşil kabuklu, dilli güler yüzlü ve ışıltılı altın mısır karakteri!' },

  // 🏡 5. Ev ve Yaşam Alanları
  { id: 'cottage', name: 'Şirin Masal Evi', category: 'houses', emoji: '🏡', desc: 'Bacası tüten, pencereli sıcak bir şirin kulübe!' },
  { id: 'mushroom_house', name: 'Büyülü Mantar Ev', category: 'houses', emoji: '🍄', desc: 'Beyaz benekli çatısı ve ahşap kapılı peri mantar evi!' },
  { id: 'treehouse', name: 'Macera Ağaç Ev', category: 'houses', emoji: '🌲', desc: 'Ağaç dalları üzerine kurulmuş eğlenceli macera evi!' },
];

export function extractBaseColor(spec?: string, fallback: string = '#ffffff'): string {
  if (!spec) return fallback;
  if (spec.startsWith('glitter:')) {
    return spec.replace('glitter:', '');
  }
  if (spec.startsWith('pattern:')) {
    const pat = spec.replace('pattern:', '');
    if (pat === 'rainbow') return '#ec4899';
    if (pat === 'polka' || pat === 'polka_dots') return '#f59e0b';
    if (pat === 'stripes') return '#3b82f6';
    if (pat === 'stars') return '#8b5cf6';
    if (pat === 'hearts') return '#f43f5e';
    if (pat === 'kawaii_face') return '#f472b6';
    return '#ffffff';
  }
  return spec;
}

export function sanitizeColorsForModelCreation(colors?: Record<string, string>): Record<string, string> {
  if (!colors) return {};
  const cleaned: Record<string, string> = {};
  for (const [key, spec] of Object.entries(colors)) {
    cleaned[key] = extractBaseColor(spec);
  }
  return cleaned;
}

export function instantiate3DModel(modelId: ModelId, colors?: Record<string, string>): THREE.Group {
  const safeColors = sanitizeColorsForModelCreation(colors);
  switch (modelId) {
    // Animals & Classics
    case 'kitty':
      return createKitty(safeColors);
    case 'dog':
      return createDog(safeColors);
    case 'rabbit':
      return createRabbit(safeColors);
    case 'cow':
      return createCow(safeColors);
    case 'sheep':
      return createSheep(safeColors);
    case 'horse':
      return createHorse(safeColors);
    case 'chick':
      return createChick(safeColors);
    case 'penguin':
      return createPenguin(safeColors);
    case 'dragon':
      return createBabyDragon(safeColors);
    case 'dino':
      return createDino(safeColors);
    case 'turtle':
      return createTurtle(safeColors);
    case 'unicorn':
      return createUnicorn(safeColors);
    case 'lion':
      return createLion(safeColors);
    case 'butterfly':
      return createButterfly(safeColors);
    case 'dolphin':
      return createDolphin(safeColors);
    case 'panda':
      return createPanda(safeColors);

    case 'rocket':
      return createRocket(safeColors);
    case 'castle':
      return createCastle(safeColors);
    case 'robot':
      return createRobot(safeColors);

    // Flowers
    case 'sunflower':
      return createSunflower(safeColors);
    case 'rose':
      return createRose(safeColors);
    case 'daisy':
      return createDaisy(safeColors);
    case 'tulip':
      return createTulip(safeColors);

    // Fruits
    case 'apple':
      return createApple(safeColors);
    case 'banana':
      return createBanana(safeColors);
    case 'strawberry':
      return createStrawberry(safeColors);
    case 'watermelon':
      return createWatermelon(safeColors);

    // Vegetables
    case 'carrot':
      return createCarrot(safeColors);
    case 'broccoli':
      return createBroccoli(safeColors);
    case 'tomato':
      return createTomato(safeColors);
    case 'corn':
      return createCorn(safeColors);

    // Houses
    case 'cottage':
      return createCottage(safeColors);
    case 'mushroom_house':
      return createMushroomHouse(safeColors);
    case 'treehouse':
      return createTreehouse(safeColors);

    default:
      return createKitty(safeColors);
  }
}
