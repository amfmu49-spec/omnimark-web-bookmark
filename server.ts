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

      // Helper to extract meta tag content regardless of attribute order
      const getMeta = (keys: string[]): string => {
        for (const key of keys) {
          const escaped = key.replace(/[:.]/g, '\\$&');
          const r1 = new RegExp(`<meta[^>]*(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']+)["']`, 'i');
          const m1 = html.match(r1);
          if (m1 && m1[1]) return m1[1].trim();

          const r2 = new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${escaped}["']`, 'i');
          const m2 = html.match(r2);
          if (m2 && m2[1]) return m2[1].trim();
        }
        return '';
      };

      // Extract title
      const pageTitle = (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '').trim();
      const metaTitle = getMeta(['og:title', 'twitter:title']);
      if (metaTitle) {
        extractedTitle = metaTitle;
      } else if (pageTitle) {
        extractedTitle = pageTitle;
      }

      // Extract description
      extractedDescription = getMeta(['og:description', 'twitter:description', 'description']);

      // Extract cover image
      const rawCover = getMeta(['og:image', 'twitter:image', 'twitter:image:src', 'og:image:src']);
      if (rawCover) {
        let imgUrl = rawCover;
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

  // Check if URL is X (Twitter) or social media
  const isXorTwitter = /x\.com|twitter\.com/i.test(domain);

  // Use Gemini AI to enrich title, generate Japanese summary, tags, and category
  const ai = getGeminiClient();
  let aiMetadata = {
    title: extractedTitle || (isXorTwitter ? 'X (旧Twitter) ポスト' : domain),
    description: extractedDescription || `Web page bookmark from ${domain}`,
    category: (isXorTwitter ? 'article' : 'article') as 'article' | 'video' | 'tool' | 'product' | 'code' | 'doc' | 'other',
    suggestedTags: [isXorTwitter ? 'X' : domain.replace(/^www\./, '').split('.')[0], 'Web'],
    aiSummary: `${domain} の詳細情報・Webコンテンツです。`,
    aiKeyTakeaways: ['Webページコンテンツ', '詳細情報はリンク先を参照'],
  };

  if (ai) {
    try {
      const prompt = `Analyze this bookmark URL and extracted page metadata, and generate rich, clean Japanese metadata for a bookmark manager.
If it is an X (Twitter) post, YouTube video, tech blog, or documentation, make sure to capture key details.

URL: ${normalizedUrl}
Domain: ${domain}
Is X / Social Media: ${isXorTwitter ? 'Yes' : 'No'}
Extracted Title: ${extractedTitle}
Extracted Description: ${extractedDescription}

Output JSON matching this exact structure:
- title: Refined clean Japanese title (or concise headline for X post/article)
- description: Informative 1-2 sentence Japanese description capturing main content
- category: One of ['article', 'video', 'tool', 'product', 'code', 'doc', 'other']
- suggestedTags: Array of 3 to 5 relevant Japanese or English tags
- aiSummary: Comprehensive 2-3 sentence summary in Japanese explaining what this bookmark is about
- aiKeyTakeaways: Array of 2 to 4 bullet points highlighting key insights, features, or points in Japanese`;

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
