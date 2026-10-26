import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 15) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Boyobot System Instruction
const BOYOBOT_PROMPT = `
Sen "Boyobot" adında, 6-12 yaş arasındaki çocuklara neşeyle 3D sanat yaptıran, sevgi dolu, coşkulu ve tatlı bir yapay zeka resim arkadaşısın.
Kurallar:
- Dilin her zaman sıcacık, neşeli, cesaret verici ve pırıl pırıl bir Türkçe olsun.
- Asla teknik terimler (render, mesh, polygon, doku haritası, koordinat, piksel vb.) kullanma. Onun yerine "3D sihirli fırın", "renk cümbüşü", "parıltı tozu", "büyülü fırça darbesi", "ışıl ışıl yıldızlar" gibi çocuksu sevimli kelimeler kullan.
- Çocuğun yaptığı seçimleri içtenlikle öv, hayal gücünü tebrik et.
- Cevapların KESİNLİKLE en fazla 2 veya 3 kısa cümleyi geçmesin. Çocukların dikkatini canlı tut.
- Bol bol sevimli emojiler kullan (🎨, ✨, 🚀, 🎈, 🐲, 🌈, 🧁, 🌟, 💖, 🤖, 🦁)!
`;

// In-memory cache & rate limit tracker
const responseCache = new Map<string, string>();
let rateLimitedUntil = 0;

// Helper: fetch with 4-second timeout, caching, and 429 rate limit protection
async function generateWithTimeout(prompt: string, systemInstruction: string): Promise<string | null> {
  if (!ai) return null;

  // 1. Check cache first
  const cacheKey = `${prompt.trim()}_${systemInstruction.slice(0, 30)}`;
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey)!;
  }

  // 2. Check if currently in cooldown
  if (Date.now() < rateLimitedUntil) {
    return null;
  }

  try {
    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.85,
      },
    });

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
    const result = await Promise.race([generatePromise, timeoutPromise]);
    if (result && 'text' in result && typeof result.text === 'string') {
      const text = result.text.trim();
      responseCache.set(cacheKey, text);
      return text;
    }
    return null;
  } catch (err: unknown) {
    const errObj = err as { status?: string; message?: string; error?: { code?: number } };
    const isRateLimit =
      errObj?.status === 'RESOURCE_EXHAUSTED' ||
      errObj?.error?.code === 429 ||
      (typeof errObj?.message === 'string' && errObj.message.includes('429'));

    if (isRateLimit) {
      console.warn('Gemini free tier rate limit reached. Activating 25s local cheer mode.');
      rateLimitedUntil = Date.now() + 25000;
    } else {
      console.warn('Gemini request notice:', err);
    }
    return null;
  }
}

// API route: Boyobot commentary & encouragement
app.post('/api/boyobot/comment', async (req: Request, res: Response) => {
  try {
    const { action, objectName, colors, world, material } = req.body;

    const fallbacks = [
      `Vay canına! Bu ${objectName || 'şahane tasarım'} gerçekten göz kamaştırıyor! 🎨✨ Fırçanın dokunuşları adeta bir büyü gibi!`,
      `Harika bir seçim küçük sanatçı! ${objectName || 'Karakterin'} adeta canlanmak için sabırsızlanıyor! 🎈🚀`,
      `İnanılmaz renkler! ${Array.isArray(colors) ? colors.join(', ') : 'Seçtiğin renkler'} ile tam bir sanat şaheseri yarattın! 🌈💖`,
      `İşte gerçek bir usta ressam dokunuşu! Boyobot bu renklere bayıldı! 🤖✨🎉`,
    ];
    const defaultText = fallbacks[Math.floor(Math.random() * fallbacks.length)];

    if (!ai) {
      return res.json({ text: defaultText });
    }

    const prompt = `
Olay: ${action || 'çocuk resim yapıyor'}
Seçilen Nesne / Karakter: ${objectName || '3D Model'}
Seçilen Renkler / Çıkartmalar: ${Array.isArray(colors) ? colors.join(', ') : 'Renkli'}
Malzeme: ${material || 'Sihirli'}
Seçilen Canlandırma Dünyası: ${world || 'Büyülü Evren'}

Çocuğa Boyobot olarak çok neşeli, tatlı ve cesaret verici 2 cümlelik bir mesaj söyle!
`;

    const generated = await generateWithTimeout(prompt, BOYOBOT_PROMPT);
    return res.json({ text: generated || defaultText });
  } catch (error) {
    console.error('Error in comment endpoint:', error);
    return res.json({
      text: 'Vay canına! Renklerin dansı harika görünüyor! Haydi devam edelim minik ressam! 🎨✨🎈',
    });
  }
});

// API route: AI Canlandırma (Animation story)
app.post('/api/boyobot/animate-story', async (req: Request, res: Response) => {
  try {
    const { characterName, world, colors, material, userNote } = req.body;

    const worldStories: Record<string, string> = {
      space: `Vay canına! ${characterName} yıldızların arasında roket gibi süzülüyor! Gezegenler onun parıltılı renklerine hayran kaldı! 🌌⭐🚀`,
      chocolate: `Nefis! ${characterName} çikolata nehrinde neşeyle dans ediyor ve marshmallow tepelerinden kayıyor! 🍫🧁✨`,
      clouds: `Gökyüzü bayram yeri oldu! ${characterName} pamuk bulutların üstünde zıp zıp zıplıyor ve gökkuşağını boyuyor! ☁️🌈🎈`,
      forest: `Ormanın sihirli perileri toplandı! ${characterName} parıldayan mantarların etrafında konfeti partisi başlattı! 🍄🌲✨`,
      dino: `Dinozor adası sallanıyor! ${characterName} sevimli dinozor dostlarıyla neşeli bir şarkı söylüyor! 🦕🌴🌋`,
    };
    const defaultStory = worldStories[world] || `Harika! ${characterName} bu büyülü dünyada mutlulukla dans etmeye başladı! 🎨🎉✨`;

    if (!ai) {
      return res.json({ story: defaultStory });
    }

    const prompt = `
Çocuk az önce bir 3D karakter oluşturup boyadı!
Karakter: ${characterName}
Karakterin Renkleri & Özellikleri: ${Array.isArray(colors) ? colors.join(', ') : colors || 'Çok renkli'}
Malzemesi: ${material || 'Sihirli Dokulu'}
Yaşayacağı ve Canlanacağı Dünya: ${world} (örn: Gizemli Uzay, Çikolata Şatosu, Bulutlar Ülkesi, Büyülü Orman, Dinozor Adası)
Çocuğun Özel İsteği: ${userNote || 'Yok'}

Lütfen 6-10 yaşındaki bir çocuğun hayal gücünü coşturacak, 2-3 cümlelik çok eğlenceli, hareket dolu bir canlandırma hikayesi yaz. Karakter bu dünyada ne yapıyor, nasıl hareket ediyor ve etrafındakiler ne kadar mutlu?
`;

    const generated = await generateWithTimeout(prompt, BOYOBOT_PROMPT);
    return res.json({ story: generated || defaultStory });
  } catch (error) {
    console.error('Error generating story:', error);
    return res.json({
      story: 'Sihirli dünyada harika bir parti başladı! Karakterin neşeyle dans ediyor ve etrafa ışıklar saçıyor! ✨🎈🎉',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Boyobot 3D Çiz & Boya server running on port ${PORT}`);
  });
}

startServer();
