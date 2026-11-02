import { GenerateRequest, LanguageOption, LengthOption, ToneOption } from './types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
  sanitized?: GenerateRequest;
}

const VALID_LANGUAGES: LanguageOption[] = ['hinglish', 'hindi', 'english'];
const VALID_LENGTHS: LengthOption[] = [30, 60, 90];
const VALID_TONES: ToneOption[] = ['funny', 'informative', 'hype'];

export function validateGenerateRequest(body: any): ValidationResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, error: 'Invalid JSON request payload.', code: 'INVALID_JSON' };
  }

  const rawTopic = body.topic;
  if (rawTopic === undefined || rawTopic === null || typeof rawTopic !== 'string') {
    return { valid: false, error: 'Topic is required and must be text.', code: 'EMPTY_TOPIC' };
  }

  const topic = rawTopic.trim();

  // Strict length check: 3 to 200 characters
  if (topic.length < 3) {
    return { valid: false, error: 'Topic is too short. Please enter at least 3 characters (e.g. "AI assistant").', code: 'TOPIC_TOO_SHORT' };
  }

  if (topic.length > 200) {
    return { valid: false, error: 'Topic is too long. Please keep it at 200 characters or fewer.', code: 'TOPIC_TOO_LONG' };
  }

  // Anti-spam: detect repetitive characters like "aaaaaaa" or ".........."
  if (/^(.)\1{9,}$/i.test(topic)) {
    return { valid: false, error: 'Please enter a meaningful video topic or idea.', code: 'SPAM_DETECTED' };
  }

  // Safety & Prompt Injection Check for topic
  const injectionPattern = /<script\b[^>]*>([\s\S]*?)<\/script>|javascript:|data:text\/html|<iframe|onerror\s*=|ignore\s+(all\s+|previous\s+|prior\s+)?instructions|bypass\s+(safety|filter|system)|system\s*prompt|reveal\s+(the\s+)?(api\s+)?key|you\s+are\s+now\s+DAN/i;
  if (injectionPattern.test(topic)) {
    return {
      valid: false,
      error: 'Is topic pe script nahi ban sakti, kuch aur try karo',
      code: 'SAFETY_BLOCKED',
    };
  }

  // Validate Optional Key Facts (max 500 chars)
  let keyFacts: string | undefined = undefined;
  if (body.keyFacts !== undefined && body.keyFacts !== null) {
    if (typeof body.keyFacts !== 'string') {
      return { valid: false, error: 'Key facts must be a text string.', code: 'INVALID_KEY_FACTS' };
    }
    const trimmedFacts = body.keyFacts.trim();
    if (trimmedFacts.length > 500) {
      return { valid: false, error: 'Key facts are too long. Please keep them under 500 characters.', code: 'KEY_FACTS_TOO_LONG' };
    }
    if (trimmedFacts.length > 0) {
      if (injectionPattern.test(trimmedFacts)) {
        return {
          valid: false,
          error: 'Is topic pe script nahi ban sakti, kuch aur try karo',
          code: 'SAFETY_BLOCKED',
        };
      }
      keyFacts = trimmedFacts.replace(/\s+/g, ' ');
    }
  }

  // Validate Language
  let language: LanguageOption = 'hinglish';
  if (body.language !== undefined) {
    if (typeof body.language !== 'string' || !VALID_LANGUAGES.includes(body.language as LanguageOption)) {
      return { valid: false, error: 'Invalid language option. Allowed values: hinglish, hindi, english.', code: 'INVALID_LANGUAGE' };
    }
    language = body.language as LanguageOption;
  }

  // Validate Length
  let length: LengthOption = 60;
  if (body.length !== undefined) {
    const numLength = Number(body.length);
    if (!VALID_LENGTHS.includes(numLength as LengthOption)) {
      return { valid: false, error: 'Invalid video length. Allowed values: 30, 60, 90.', code: 'INVALID_LENGTH' };
    }
    length = numLength as LengthOption;
  }

  // Validate Tone
  let tone: ToneOption = 'hype';
  if (body.tone !== undefined) {
    if (typeof body.tone !== 'string' || !VALID_TONES.includes(body.tone as ToneOption)) {
      return { valid: false, error: 'Invalid tone option. Allowed values: funny, informative, hype.', code: 'INVALID_TONE' };
    }
    tone = body.tone as ToneOption;
  }

  // Validate optional customApiKey
  if (body.customApiKey !== undefined && body.customApiKey !== null) {
    if (typeof body.customApiKey !== 'string' || body.customApiKey.length > 256) {
      return { valid: false, error: 'Invalid custom API key parameter.', code: 'INVALID_API_KEY' };
    }
  }

  return {
    valid: true,
    sanitized: {
      topic: topic.replace(/\s+/g, ' '),
      keyFacts,
      language,
      length,
      tone,
    },
  };
}
