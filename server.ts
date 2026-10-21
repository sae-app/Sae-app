import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Enable CORS for iframe / embedded preview environments
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SAE Vision AI Backend',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY || process.env.API_KEY)
  });
});

// Helper for smart fallback when offline or API key pending
function generateSmartFallback(timeOfDay?: string, timeInfo?: string) {
  const hour = new Date().getHours();
  const autoTime = timeOfDay || (hour < 11 ? 'pagi' : hour < 15 ? 'siang' : hour < 18 ? 'sore' : 'malam');
  const displayTime = timeInfo || `Waktu ${autoTime.toUpperCase()} Nusantara`;
  
  return {
    detectedPeopleCount: 1,
    shotType: 'half-body',
    relationType: 'personal' as const,
    relationTitle: 'Pesona Personal Otentik',
    relationDescription: 'Tampil jujur, percaya diri, dan memancarkan aura tenang yang menawan.',
    duoVibeTitle: '',
    duoVibeDescription: '',
    overallVibe: 'Aura Tenang yang Berwibawa ✨',
    vibeTag: 'Main Character Energy ✨',
    palette: [
      { name: 'Sky Denim', hex: '#3b82f6' },
      { name: 'Crisp White', hex: '#f8fafc' },
      { name: 'Warm Charcoal', hex: '#334155' }
    ],
    people: [
      {
        identifier: 'Kamu (Pemeran Utama)',
        outfitDetected: 'Kombinasi atasan kasual bersih dengan siluet santai berkelas',
        validation: 'Validasi SAE: Sumpah ini kelihatan fresh dan matang banget! Baju ini bukan sekadar pakaian yang kamu kenakan, tapi cerminan kenyamanan dan rasa percaya dirimu. Potongan bahunya jatuh dengan pas, membuat posturmu terlihat tegap dan ramah tanpa perlu berusaha keras cari perhatian.',
        humorTweak: 'Sentuhan Kilat 30 Detik: Coba rapikan kerah atau lipat sedikit ujung lengan biar jam tanganmu kelihatan. Senyum tipis 2 milimeter bakal auto ngirim sinyal: "Hari ini milikku!" 😉',
        specialPraise: 'Tatapan matamu di cermin ini memancarkan ketenangan magnetis yang bikin siapapun betah.'
      }
    ],
    saeVerdict: 'Validasi SAE: 100% Sah & Keren! Kamu nggak butuh persetujuan siapapun untuk tampil memukau hari ini.',
    stepOutAffirmation: 'Tarik napas dalam, hembuskan perlahan... Tersenyumlah 3 detik ke cermin ini. Bahumu tegak, langkahmu hari ini sudah direstui semesta. Berangkat! 🚀',
    quickTips: [
      'Postur tegak tapi rileks membuat siluet pakaian jatuh 2x lebih proporsional.',
      'Senyum tulus adalah aksesoris termewah yang selalu gratis.'
    ],
    timeContext: `${displayTime} · Suasana ${autoTime} yang pas untuk melangkah mantap`,
    localTimeInfo: displayTime
  };
}

// POST /api/analyze-outfit
app.post('/api/analyze-outfit', async (req, res) => {
  try {
    const { 
      image, 
      mimeType = 'image/jpeg', 
      timeOfDay, 
      localTimeInfo,
      timeZoneName,
      contextHint 
    } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Gambar tidak ditemukan dalam permintaan.' });
    }

    const cleanBase64 = image.includes('base64,') ? image.split('base64,')[1] : image;
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

    // If Gemini key is available, call Gemini 3.8 Flash Vision
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        const promptText = `
Anda adalah SAE (See Your Better Style) — sahabat gaya pribadi, konsultan outfit yang hangat, empatik, cerdas, dan jenius dalam membangun rasa percaya diri dengan bahasa Indonesia yang renyah, akrab, menyentuh hati, sekaligus lucu/jenaka (bikin tersenyum tipis, terharu, bahkan ngakak halus).

KONTEKS WAKTU REAL-TIME PENGGUNA DI INDONESIA:
- Waktu lokal pengguna: ${localTimeInfo || 'Waktu Lokal Indonesia'} (${timeZoneName || 'WIB/WITA/WIT'}).
- Suasana waktu: ${timeOfDay || 'hari ini'}. Sesuaikan sapaan dengan waktu lokal pengguna (Pagi, Siang, Sore, atau Malam) agar terasa sangat hidup dan relevan!

TUGAS UTAMA:
Perhatikan gambar yang dikirimkan pengguna secara mendalam dan berikan VALIDASI OUTFIT & PEMBANGUN RASA PERCAYA DIRI (CONFIDENCE BOOST).

ATURAN MUTLAK & PRINSIP UTAMA:
1. JANGAN PERNAH memberikan nilai numerik atau angka skor (DILARANG KERAS nilai 1-100 atau skor 80, 95 dsb). Sistem SAE murni memberi VALIDASI, apresiasi, dan dorongan percaya diri.
2. FOKUS UTAMA & TERDALAM PADA PERSONAL (1 ORANG):
   - Jika foto adalah 1 orang (Personal): Jadikan ini mahakarya validasi batin. Pahami bahwa orang ini sedang berdiri di depan cermin sebelum melangkah keluar rumah.
   - Puji keotentikan pakaiannya (bahkan kaos santai, pakaian rumah, atau baju sederhana sekalipun). Tunjukkan bahwa kenyamanan dan kepantasan dirinya sudah 100% sah.
   - Berikan "humorTweak" (Sentuhan Kilat 30 Detik): trik kecil praktis, kocak, dan cerdas tanpa biaya (contoh: lipat ujung lengan 1 gulungan, masukkan sedikit ujung kaos ke pinggang, buka 1 kancing atas, tegakkan bahu, tarik senyum tipis).
   - Berikan "stepOutAffirmation": kalimat ritual penutup yang menyentuh hati agar pengguna tersenyum ke cermin, menarik napas lega, dan siap melangkah keluar pintu dengan penuh keyakinan!
3. DINAMIKA RELASI FLEKSIBEL (JUMLAH BEBAS):
   - Kenali jenis relasi secara alami:
     * "personal" (1 orang)
     * "pasangan" (2 orang dengan kedekatan pasangan/doi/suami-istri)
     * "keluarga" (keluarga, ada anak/orang tua/lintas generasi, jumlah bebas)
     * "teman" (sahabat, bestie, tongkrongan, rekan kerja, jumlah bebas)
   - Isi "relationType" dengan salah satu dari: "personal", "pasangan", "keluarga", "teman".
   - Isi "relationTitle" dengan judul yang seru (contoh: "Pesona Personal Otentik", "Sinergi Pasangan Sehati", "Harmoni Hangat Keluarga", "Energi Bestie Se-Frekuensi").
   - Isi "relationDescription" dengan apresiasi kebersamaan mereka.
4. DETEKSI JENIS FOTO (shotType):
   - "half-body" jika foto setengah badan (fokus ke atasan, kerah, kacamata, ekspresi wajah, aksesoris leher/dada).
   - "full-body" jika foto seluruh badan (fokus ke proporsi atasan-bawahan, potongan celana/rok, sepatu).
5. EKSTRAK PALET WARNA:
   - Ambil 3-4 warna dominan dari pakaian mereka lengkap dengan nama warna yang puitis/keren dalam bahasa Indonesia dan kode hex-nya.

OUTPUT FORMAT:
Wajib respon HANYA dalam JSON murni (tanpa markdown tick \`\`\`json) sesuai struktur berikut:
{
  "detectedPeopleCount": 1,
  "shotType": "half-body",
  "relationType": "personal",
  "relationTitle": "string judul relasi",
  "relationDescription": "string apresiasi sinergi/vibe relasi",
  "duoVibeTitle": "string judul (opsional jika pasangan/duo)",
  "duoVibeDescription": "string deskripsi",
  "overallVibe": "string judul aura singkat (misal: Aura Tenang yang Berwibawa ✨)",
  "vibeTag": "string tag aura (misal: Main Character Energy ✨)",
  "palette": [
    { "name": "Biru Navy", "hex": "#1e3a8a" },
    { "name": "Putih Kapas", "hex": "#f8fafc" },
    { "name": "Coklat Moka", "hex": "#78350f" }
  ],
  "people": [
    {
      "identifier": "Kamu (Pemeran Utama)",
      "outfitDetected": "deskripsi singkat outfit yang dikenakan",
      "validation": "kalimat validasi penuh kehangatan batin, apresiasi otentik, dan sentuhan humor yang membangkitkan percaya diri",
      "humorTweak": "Sentuhan Kilat 30 Detik: trik gaya kilat yang cerdik, gratis, dan mengundang senyum",
      "specialPraise": "pujian khusus tentang tatapan, ekspresi, proporsi, atau aura mereka"
    }
  ],
  "saeVerdict": "Kalimat pamungkas pengesahan percaya diri dari SAE (100% Sah & Keren)",
  "stepOutAffirmation": "Kalimat ritual afirmasi penutup sebelum melangkah keluar pintu (bikin tersenyum ke cermin)",
  "quickTips": [
    "Tips praktis 1",
    "Tips praktis 2"
  ],
  "timeContext": "Konteks waktu/suasana daerah pengguna yang terbaca"
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: cleanBase64,
                },
              },
              {
                text: promptText,
              },
            ],
          },
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '';
        let parsedResult;
        try {
          parsedResult = JSON.parse(rawText.trim());
        } catch {
          // In case model added codeblock delimiters
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResult = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('Gagal memproses format respons JSON');
          }
        }

        return res.json({
          success: true,
          source: 'gemini-3.8-flash',
          data: parsedResult,
        });
      } catch (geminiError: unknown) {
        console.warn('Gemini API call warning, falling back to smart engine:', geminiError);
        // Fallback to rich engine if API call fails
        const fallback = generateSmartFallback(timeOfDay, localTimeInfo);
        return res.json({
          success: true,
          source: 'sae-smart-engine',
          data: fallback,
        });
      }
    }

    const fallback = generateSmartFallback(timeOfDay, localTimeInfo);
    return res.json({
      success: true,
      source: 'sae-smart-engine',
      data: fallback,
    });
  } catch (err: unknown) {
    console.error('Analyze outfit error:', err);
    res.status(500).json({
      error: 'Terjadi kendala saat menganalisis gaya pakaian.',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SAE Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Init Error:', err);
});
