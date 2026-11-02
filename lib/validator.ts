import { GenerateRequest, LanguageOption, LengthOption, ToneOption } from './types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: GenerateRequest;
}

const VALID_LANGUAGES: LanguageOption[] = ['hinglish', 'hindi', 'english'];
const VALID_LENGTHS: LengthOption[] = [30, 60, 90];
const VALID_TONES: ToneOption[] = ['funny', 'informative', 'hype'];

export function validateGenerateRequest(body: any): ValidationResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, error: 'Invalid JSON request payload.' };
  }

  const rawTopic = body.topic;
  if (rawTopic === undefined || rawTopic === null || typeof rawTopic !== 'string') {
    return { valid: false, error: 'Topic is required and must be text.' };
  }

  const topic = rawTopic.trim();

  // Strict length check: 3 to 200 characters
  if (topic.length < 3) {
    return { valid: false, error: 'Topic is too short. Please enter at least 3 characters (e.g. "AI assistant").' };
  }

  if (topic.length > 200) {
    return { valid: false, error: 'Topic is too long. Please keep it at 200 characters or fewer.' };
  }

  // Anti-spam: detect repetitive characters like "aaaaaaa" or ".........."
  if (/^(.)\1{9,}$/i.test(topic)) {
    return { valid: false, error: 'Please enter a meaningful video topic or idea.' };
  }

  // Anti-spam: check for obvious malicious injection attempts
  const suspiciousPattern = /<script\b[^>]*>([\s\S]*?)<\/script>|javascript:|data:text\/html|<iframe|onerror\s*=/i;
  if (suspiciousPattern.test(topic)) {
    return { valid: false, error: 'Invalid characters or scripts detected in topic.' };
  }

  // Validate Language
  let language: LanguageOption = 'hinglish';
  if (body.language !== undefined) {
    if (typeof body.language !== 'string' || !VALID_LANGUAGES.includes(body.language as LanguageOption)) {
      return { valid: false, error: 'Invalid language option. Allowed values: hinglish, hindi, english.' };
    }
    language = body.language as LanguageOption;
  }

  // Validate Length
  let length: LengthOption = 60;
  if (body.length !== undefined) {
    const numLength = Number(body.length);
    if (!VALID_LENGTHS.includes(numLength as LengthOption)) {
      return { valid: false, error: 'Invalid video length. Allowed values: 30, 60, 90.' };
    }
    length = numLength as LengthOption;
  }

  // Validate Tone
  let tone: ToneOption = 'hype';
  if (body.tone !== undefined) {
    if (typeof body.tone !== 'string' || !VALID_TONES.includes(body.tone as ToneOption)) {
      return { valid: false, error: 'Invalid tone option. Allowed values: funny, informative, hype.' };
    }
    tone = body.tone as ToneOption;
  }

  // Validate optional customApiKey
  if (body.customApiKey !== undefined && body.customApiKey !== null) {
    if (typeof body.customApiKey !== 'string' || body.customApiKey.length > 256) {
      return { valid: false, error: 'Invalid custom API key parameter.' };
    }
  }

  return {
    valid: true,
    sanitized: {
      topic: topic.replace(/\s+/g, ' '),
      language,
      length,
      tone,
    },
  };
}
