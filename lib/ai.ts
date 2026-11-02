import { GoogleGenAI } from '@google/genai';
import { GenerateRequest, GenerateResponse, AIProvider, ScriptScene } from './types';
import { buildSystemInstruction, buildUserPrompt } from './prompt';

function sanitizeJsonText(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/```\s*$/i, '');
  }
  return cleaned.trim();
}

export function validateScriptJson(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.hooks) || data.hooks.length === 0) return false;
  if (!Array.isArray(data.script) && typeof data.script !== 'string') return false;
  if (Array.isArray(data.script) && data.script.length === 0) return false;
  return true;
}

export function normalizeResult(raw: any, fallbackTopic: string, provider: AIProvider): GenerateResponse {
  const hooks = Array.isArray(raw?.hooks) && raw.hooks.length > 0
    ? raw.hooks.map((h: any) => String(h).trim())
    : [
        `Yeh secret trick 99% creators ko nahi pata!`,
        `Agar ${fallbackTopic} pe views chahiye toh yeh video abhi save kar lo.`,
        `Maine ${fallbackTopic} try kiya aur results dekh ke dimaag hil gaya!`
      ];

  let script: ScriptScene[] = [];
  if (Array.isArray(raw?.script) && raw.script.length > 0) {
    script = raw.script.map((scene: any, idx: number) => {
      if (typeof scene === 'string') {
        return {
          time: idx === 0 ? '0-3s' : `${idx * 10}-${(idx + 1) * 10}s`,
          line: scene.trim(),
          visual: 'Fast zoom-in to camera with dynamic captions overlay',
        };
      }
      return {
        time: scene?.time || (idx === 0 ? '0-3s' : `${idx * 10}-${(idx + 1) * 10}s`),
        line: String(scene?.line || '').trim(),
        visual: String(scene?.visual || 'Camera zoom in with kinetic text').trim(),
      };
    });
  } else if (typeof raw?.script === 'string') {
    const sentences = raw.script.split(/(?<=[.?!])\s+/).filter(Boolean);
    script = sentences.map((sent: string, idx: number) => ({
      time: idx === 0 ? '0-3s' : `${idx * 12}-${(idx + 1) * 12}s`,
      line: sent.trim(),
      visual: idx === 0 ? 'Face to camera, shocked expression holding phone' : 'Screen recording showing tutorial steps',
    }));
  }

  if (script.length === 0) {
    script = [
      {
        time: '0-3s',
        line: `Bhai suno! Agar tum ${fallbackTopic} ke bare mein nahi jaante toh bohot peeche reh jaoge!`,
        visual: 'Fast zoom-in to camera, holding phone with shocked expression.',
      },
      {
        time: '3-15s',
        line: `Aaj main tumhe batane wala hoon exactly kaise yeh kaam karta hai bina kisi tension ke.`,
        visual: 'Screen recording showing quick step-by-step UI with arrow pointers.',
      },
      {
        time: '15-30s',
        line: `Bas 2 simple steps follow karo aur result tumhare saamne hai. Try karke dekhna pakka!`,
        visual: 'Result screen highlight with bright neon overlay and thumbs up.',
      },
      {
        time: '30-45s',
        line: `Aisi aur secret AI tools aur tech hacks ke liye abhi follow karo aur dosto ke sath share karo!`,
        visual: 'Creator pointing down to follow button with animated pop sound.',
      },
    ];
  }

  const caption = typeof raw?.caption === 'string' && raw.caption.trim().length > 0
    ? raw.caption.trim()
    : `Try this crazy viral trick for ${fallbackTopic}!\n\nSave this reel for later and share it with someone who needs this right now! 🔥`;

  let hashtags: string[] = [];
  if (Array.isArray(raw?.hashtags) && raw.hashtags.length > 0) {
    hashtags = raw.hashtags
      .map((tag: any) => {
        const str = String(tag).trim();
        return str.startsWith('#') ? str : `#${str}`;
      })
      .filter((tag: string) => tag.length > 1);
  }
  if (hashtags.length === 0) {
    hashtags = ['#aitools', '#reelsindia', '#techhacks', '#viralshorts', '#creators', '#growth', '#scriptkaro'];
  }

  const coverText = typeof raw?.coverText === 'string' && raw.coverText.trim().length > 0
    ? raw.coverText.trim()
    : 'VIRAL SECRET REVEALED';

  return {
    hooks: hooks.slice(0, 3),
    script,
    caption,
    hashtags: hashtags.slice(0, 15),
    coverText,
    provider,
  };
}

/**
 * 1. Google Gemini Provider
 */
async function callGemini(
  req: GenerateRequest,
  apiKey: string,
  isRetry = false
): Promise<GenerateResponse> {
  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = buildSystemInstruction();
  let prompt = buildUserPrompt(req);

  if (isRetry) {
    prompt += '\n\nCRITICAL: Return ONLY valid JSON adhering strictly to the schema. No markdown fences, no conversational text.';
  }

  const candidateModels = [
    'gemini-3-flash-preview',
    'gemini-3.8-flash',
    'gemini-2.5-flash',
    'gemini-flash-latest',
  ];

  let rawText = '';
  let lastErr: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.75,
          httpOptions: { timeout: 20000 },
        },
      });

      if (response.text) {
        rawText = response.text;
        break;
      }
    } catch (err: any) {
      lastErr = err;
      const msg = String(err?.message || '');
      if (msg.includes('404') || msg.includes('no longer available') || msg.includes('NOT_FOUND')) {
        continue;
      }
      throw err;
    }
  }

  if (!rawText) {
    throw lastErr || new Error('Gemini returned an empty response.');
  }

  const cleaned = sanitizeJsonText(rawText);
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    if (!isRetry) {
      return callGemini(req, apiKey, true);
    }
    throw new Error('Gemini returned malformed JSON.');
  }

  if (!validateScriptJson(parsed) && !isRetry) {
    return callGemini(req, apiKey, true);
  }

  return normalizeResult(parsed, req.topic, 'gemini');
}

/**
 * 2. Groq Provider (model: llama-3.3-70b-versatile)
 */
async function callGroq(
  req: GenerateRequest,
  apiKey: string,
  isRetry = false
): Promise<GenerateResponse> {
  const systemInstruction = buildSystemInstruction() + '\nYou MUST return a JSON object with keys: hooks, script, caption, hashtags, coverText.';
  let prompt = buildUserPrompt(req);

  if (isRetry) {
    prompt += '\n\nIMPORTANT: Previous response was not valid JSON. Return ONLY a single raw JSON object.';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Groq API returned ${res.status}: ${errBody}`);
    }

    const data = await res.json();
    const rawText = data?.choices?.[0]?.message?.content;

    if (!rawText) {
      throw new Error('Groq returned empty content.');
    }

    const cleaned = sanitizeJsonText(rawText);
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      if (!isRetry) {
        return callGroq(req, apiKey, true);
      }
      throw new Error('Groq returned malformed JSON.');
    }

    if (!validateScriptJson(parsed) && !isRetry) {
      return callGroq(req, apiKey, true);
    }

    return normalizeResult(parsed, req.topic, 'groq');
  } catch (e: any) {
    clearTimeout(timeoutId);
    throw e;
  }
}

/**
 * 3. OpenRouter Provider (Free Models)
 */
async function callOpenRouter(
  req: GenerateRequest,
  apiKey: string,
  isRetry = false
): Promise<GenerateResponse> {
  const systemInstruction = buildSystemInstruction() + '\nYou MUST return a JSON object with keys: hooks, script, caption, hashtags, coverText.';
  let prompt = buildUserPrompt(req);

  if (isRetry) {
    prompt += '\n\nIMPORTANT: Output valid JSON only.';
  }

  const freeModels = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'qwen/qwen-2.5-72b-instruct:free',
  ];

  let lastErr: any = null;

  for (const model of freeModels) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://scriptkaro.com',
          'X-Title': 'ScriptKaro',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenRouter returned ${res.status}: ${errText.slice(0, 150)}`);
      }

      const data = await res.json();
      const rawText = data?.choices?.[0]?.message?.content;
      if (!rawText) throw new Error('Empty message content from OpenRouter.');

      const cleaned = sanitizeJsonText(rawText);
      let parsed: any;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        if (!isRetry) {
          return callOpenRouter(req, apiKey, true);
        }
        throw new Error('OpenRouter returned malformed JSON.');
      }

      if (!validateScriptJson(parsed) && !isRetry) {
        return callOpenRouter(req, apiKey, true);
      }

      return normalizeResult(parsed, req.topic, 'openrouter');
    } catch (e: any) {
      clearTimeout(timeoutId);
      lastErr = e;
      continue;
    }
  }

  throw lastErr || new Error('All OpenRouter free models failed.');
}

function sanitizeLogMessage(msg: string): string {
  return String(msg || '')
    .replace(/(?:key|apiKey|authorization|token)=[^&\s]+/gi, '$1=[REDACTED]')
    .replace(/Bearer\s+[a-zA-Z0-9_\-\.]+/gi, 'Bearer [REDACTED]')
    .replace(/AQ\.[a-zA-Z0-9_\-]{15,}/g, '[REDACTED_GEMINI_KEY]')
    .replace(/AIza[a-zA-Z0-9_\-]{25,}/g, '[REDACTED_GOOGLE_KEY]')
    .replace(/gsk_[a-zA-Z0-9_\-]{20,}/g, '[REDACTED_GROQ_KEY]')
    .replace(/sk-or-[a-zA-Z0-9_\-]{20,}/g, '[REDACTED_OPENROUTER_KEY]');
}

export interface GenerateScriptResult {
  data: GenerateResponse;
  provider: AIProvider;
}

/**
 * Master multi-provider fallback runner:
 * Order: Google Gemini -> Groq (Llama 3.3 70B) -> OpenRouter (Free models)
 */
export async function generateScript(
  req: GenerateRequest,
  customGeminiKey?: string
): Promise<GenerateScriptResult> {
  // Use custom key if supplied by user, otherwise fallback to server environment
  const geminiKey = customGeminiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();

  const providerFailures: string[] = [];

  // 1. Try Google Gemini
  if (geminiKey) {
    try {
      const data = await callGemini(req, geminiKey);
      return { data, provider: 'gemini' };
    } catch (err: any) {
      const rawMsg = err?.message || 'Unknown error';
      const cleanMsg = sanitizeLogMessage(rawMsg);
      console.warn(`[Fallback] Gemini provider failed (${cleanMsg.slice(0, 100)}). Falling back...`);
      providerFailures.push('Google Gemini');
    }
  } else {
    providerFailures.push('Google Gemini (No key configured)');
  }

  // 2. Try Groq (Llama 3.3 70B)
  if (groqKey) {
    try {
      const data = await callGroq(req, groqKey);
      return { data, provider: 'groq' };
    } catch (err: any) {
      const rawMsg = err?.message || 'Unknown error';
      const cleanMsg = sanitizeLogMessage(rawMsg);
      console.warn(`[Fallback] Groq provider failed (${cleanMsg.slice(0, 100)}). Falling back...`);
      providerFailures.push('Groq (Llama 3.3)');
    }
  } else {
    providerFailures.push('Groq (No key configured)');
  }

  // 3. Try OpenRouter (Free Models)
  if (openRouterKey) {
    try {
      const data = await callOpenRouter(req, openRouterKey);
      return { data, provider: 'openrouter' };
    } catch (err: any) {
      const rawMsg = err?.message || 'Unknown error';
      const cleanMsg = sanitizeLogMessage(rawMsg);
      console.warn(`[Fallback] OpenRouter provider failed (${cleanMsg.slice(0, 100)}).`);
      providerFailures.push('OpenRouter');
    }
  } else {
    providerFailures.push('OpenRouter (No key configured)');
  }

  // If all providers failed
  throw new Error(`All AI providers failed: ${providerFailures.join(', ')}`);
}
