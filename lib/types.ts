export type LanguageOption = 'hinglish' | 'hindi' | 'english';
export type LengthOption = 30 | 60 | 90;
export type ToneOption = 'funny' | 'informative' | 'hype';
export type AIProvider = 'gemini' | 'groq' | 'openrouter';

export interface GenerateRequest {
  topic: string;
  language: LanguageOption;
  length: LengthOption;
  tone: ToneOption;
  customApiKey?: string;
}

export interface ScriptScene {
  time: string;
  line: string;
  visual: string;
}

export interface GenerateResponse {
  hooks: string[];
  script: ScriptScene[];
  caption: string;
  hashtags: string[];
  coverText: string;
  provider?: AIProvider;
}

export interface HistoryItem {
  id: string;
  createdAt: number;
  request: GenerateRequest;
  response: GenerateResponse;
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
  code?: 'MISSING_API_KEY' | 'EMPTY_TOPIC' | 'GEMINI_ERROR' | 'INVALID_JSON' | 'RATE_LIMITED' | 'ALL_PROVIDERS_FAILED';
}
