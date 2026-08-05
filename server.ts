import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Ensure data directory exists for persistent sync storage
const DATA_DIR = process.env.VERCEL ? '/tmp/data' : path.join(process.cwd(), 'data');
const SYNC_FILE = path.join(DATA_DIR, 'sync-store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Memory store for device sync
let syncStore: Record<string, { bookmarks: any[]; collections: any[]; updatedAt: string }> = {};

if (fs.existsSync(SYNC_FILE)) {
  try {
    const raw = fs.readFileSync(SYNC_FILE, 'utf-8');
    syncStore = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load sync store, starting fresh', err);
  }
}

function saveSyncStore() {
  try {
    fs.writeFileSync(SYNC_FILE, JSON.stringify(syncStore, null, 2));
  } catch (err) {
    console.error('Failed to write sync store', err);
  }
}

// Shared Gemini AI client helper
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ---------------- API ENDPOINTS ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Device Synchronization Endpoints
app.get('/api/sync/:syncCode', (req, res) => {
  const syncCode = req.params.syncCode.toUpperCase().trim();
  if (!syncCode) {
    return res.status(400).json({ error: 'Sync code is required' });
  }

  const data = syncStore[syncCode];
  if (!data) {
    return res.json({
      exists: false,
      bookmarks: null,
      collections: null,
      updatedAt: null,
    });
  }

  res.json({
    exists: true,
    bookmarks: data.bookmarks,
    collections: data.collections,
    updatedAt: data.updatedAt,
  });
});

app.post('/api/sync/:syncCode', (req, res) => {
  const syncCode = req.params.syncCode.toUpperCase().trim();
  const { bookmarks, collections } = req.body;

  if (!syncCode) {
    return res.status(400).json({ error: 'Sync code is required' });
  }

  const now = new Date().toISOString();
  syncStore[syncCode] = {
    bookmarks: bookmarks || [],
    collections: collections || [],
    updatedAt: now,
  };

  saveSyncStore();

  res.json({
    success: true,
    syncCode,
    updatedAt: now,
  });
});

// URL Metadata Extraction & AI Summary Endpoint
app.post('/api/metadata', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Valid URL is required' });
  }

  let normalizedUrl = url.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  let domain = '';
  try {
    const parsed = new URL(normalizedUrl);
    domain = parsed.hostname;
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const defaultFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  let extractedTitle = domain;
  let extractedDescription = '';
  let extractedCoverImage = '';

  // Attempt to fetch raw HTML page title and metadata
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
      },
    });

    clearTimeout(timeout);

    if (response.ok) {
      const html = await response.text();

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        extractedTitle = titleMatch[1].trim();
      }

      // Extract og:title
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
      if (ogTitleMatch && ogTitleMatch[1]) {
        extractedTitle = ogTitleMatch[1].trim();
      }

      // Extract description
      const descMatch =
        html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
      if (descMatch && descMatch[1]) {
        extractedDescription = descMatch[1].trim();
      }

      // Extract og:image
      const ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
      if (ogImgMatch && ogImgMatch[1]) {
        let imgUrl = ogImgMatch[1].trim();
        if (imgUrl.startsWith('//')) {
          imgUrl = 'https:' + imgUrl;
        } else if (imgUrl.startsWith('/')) {
          const origin = new URL(normalizedUrl).origin;
          imgUrl = origin + imgUrl;
        }
        extractedCoverImage = imgUrl;
      }
    }
  } catch (err) {
    console.log(`Could not fetch HTML directly for ${normalizedUrl}, using AI fallback metadata analysis`);
  }

  // Use Gemini AI to enrich title, generate Japanese summary, tags, and category
  const ai = getGeminiClient();
  let aiMetadata = {
    title: extractedTitle || domain,
    description: extractedDescription || `Web page bookmark from ${domain}`,
    category: 'article' as const,
    suggestedTags: [domain.replace(/^www\./, '').split('.')[0], 'Web'],
    aiSummary: `${domain} のコンテンツです。`,
    aiKeyTakeaways: ['Webページコンテンツ', '詳細情報はリンク先を参照'],
  };

  if (ai) {
    try {
      const prompt = `Analyze this web bookmark URL and extracted information, and generate clean Japanese metadata for a bookmark manager.

URL: ${normalizedUrl}
Domain: ${domain}
Extracted Title: ${extractedTitle}
Extracted Description: ${extractedDescription}

Output JSON matching this exact structure:
- title: Refined clean Japanese title or original title
- description: Concise 1-2 sentence Japanese description
- category: One of ['article', 'video', 'tool', 'product', 'code', 'doc', 'other']
- suggestedTags: Array of 3 to 5 relevant Japanese or English tags
- aiSummary: Clear 1-2 sentence summary in Japanese
- aiKeyTakeaways: Array of 2 to 3 bullet points highlighting main takeaways in Japanese`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: {
                type: Type.STRING,
                enum: ['article', 'video', 'tool', 'product', 'code', 'doc', 'other'],
              },
              suggestedTags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              aiSummary: { type: Type.STRING },
              aiKeyTakeaways: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['title', 'description', 'category', 'suggestedTags', 'aiSummary', 'aiKeyTakeaways'],
          },
        },
      });

      if (aiResponse.text) {
        const parsed = JSON.parse(aiResponse.text.trim());
        aiMetadata = {
          title: parsed.title || extractedTitle || domain,
          description: parsed.description || extractedDescription || '',
          category: parsed.category || 'article',
          suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : ['Web'],
          aiSummary: parsed.aiSummary || '',
          aiKeyTakeaways: Array.isArray(parsed.aiKeyTakeaways) ? parsed.aiKeyTakeaways : [],
        };
      }
    } catch (err) {
      console.error('Gemini AI metadata enrichment failed:', err);
    }
  }

  res.json({
    url: normalizedUrl,
    title: aiMetadata.title,
    description: aiMetadata.description,
    favicon: defaultFavicon,
    coverImage: extractedCoverImage || `https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80`,
    category: aiMetadata.category,
    suggestedTags: aiMetadata.suggestedTags,
    aiSummary: aiMetadata.aiSummary,
    aiKeyTakeaways: aiMetadata.aiKeyTakeaways,
    domain,
  });
});

// ---------------- VITE & SERVER BOOTSTRAP ----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 OmniMark Server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;

if (!process.env.VERCEL) {
  startServer();
}
