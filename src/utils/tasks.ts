import { DailyTask, ModelCategory } from '../types';

const taskPool: Omit<DailyTask, 'currentCount'>[] = [
  { id: '1', description: 'Bugün bir hayvanı maviye boya!', category: 'animals', action: 'paint', target: 'blue' },
  { id: '2', description: 'Bugün bir çiçeğe 3 yıldız çıkartması yapıştır!', category: 'flowers', action: 'sticker', target: '⭐', requiredCount: 3 },
  { id: '3', description: 'Bugün bir meyveyi kırmızıya boya!', category: 'fruits', action: 'paint', target: 'red' },
  { id: '4', description: 'Bugün bir eve 2 kalp çıkartması yapıştır!', category: 'houses', action: 'sticker', target: '💖', requiredCount: 2 },
];

export function generateDailyTask(): DailyTask {
  const task = taskPool[Math.floor(Math.random() * taskPool.length)];
  return { ...task, currentCount: 0 };
}
