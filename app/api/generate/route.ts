import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { createCacheKey, getCachedResponse, setCachedResponse } from '@/lib/cache';
import { validateGenerateRequest } from '@/lib/validator';
import { generateScript, AllProvidersRateLimitedError } from '@/lib/ai';
import { GenerateResponse } from '@/lib/types';

export const runtime = 'nodejs';

/**
 * Same-Origin Security Verification:
 * Protect against CSRF and cross-site scraping.
 */
function isSameOriginRequest(req: NextRequest): boolean {
  // 1. Check Sec-Fetch-Site (modern browsers)
  const secFetchSite = req.headers.get('sec-fetch-site');
  if (secFetchSite && secFetchSite === 'cross-site') {
    return false;
  }

  // 2. Check Origin header against Host
  const origin = req.headers.get('origin');
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const host = req.headers.get('host') || '';
      const hostWithoutPort = host.split(':')[0];
      const originHostname = originUrl.hostname;

      // Allow localhost / 127.0.0.1 in development
      if (
        (originHostname === 'localhost' || originHostname === '127.0.0.1') &&
        (hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1')
      ) {
        return true;
      }

      // Check production domain match
      if (originHostname !== hostWithoutPort && !origin.includes(host)) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}

/**
 * Filter out sensitive or dev-only fields in production
 */
function formatResponsePayload(data: GenerateResponse): Partial<GenerateResponse> {
  const payload: Partial<GenerateResponse> = { ...data };
  if (process.env.NODE_ENV === 'production') {
    delete payload.provider;
  }
  return payload;
}

export async function POST(req: NextRequest) {
  // 1. Method and Origin Enforcement
  if (!isSameOriginRequest(req)) {
    return NextResponse.json(
      { error: 'Cross-origin requests are forbidden.', code: 'FORBIDDEN_CORS' },
      { status: 403 }
    );
  }

  try {
    // 2. Per-IP Rate Limiting (Upstash Redis with in-memory fallback)
    const clientIp = getClientIp(req);
    const rateCheck = await checkRateLimit(clientIp, 10, 60 * 1000);

    const rateHeaders = {
      'X-RateLimit-Limit': String(rateCheck.limit),
      'X-RateLimit-Remaining': String(rateCheck.remaining),
      'X-RateLimit-Reset': String(rateCheck.resetInSeconds),
      'Vary': 'Origin',
    };

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: 'Bahut log use kar rahe hain, thodi der baad try karo',
          details: `Aapne limit exceed kar di hai. Please ${rateCheck.resetInSeconds} seconds wait karke dubara generate karo.`,
          code: 'RATE_LIMITED',
        },
        {
          status: 429,
          headers: {
            ...rateHeaders,
            'Retry-After': String(rateCheck.resetInSeconds),
          },
        }
      );
    }

    // 3. Strict Input Validation (Type, Length, Whitelist, Safety)
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request payload.', code: 'INVALID_JSON' },
        { status: 400, headers: rateHeaders }
      );
    }

    const validation = validateGenerateRequest(body);
    if (!validation.valid || !validation.sanitized) {
      const isSafety = validation.code === 'SAFETY_BLOCKED';
      return NextResponse.json(
        {
          error: isSafety
            ? 'Is topic pe script nahi ban sakti, kuch aur try karo'
            : (validation.error || 'Invalid request inputs.'),
          code: validation.code || 'INVALID_INPUT',
        },
        { status: 400, headers: rateHeaders }
      );
    }

    const sanitizedReq = validation.sanitized;

    // Optional user custom Gemini key from header or body (never stored on server or logged)
    const rawCustomKey =
      req.headers.get('x-custom-gemini-key') ||
      (typeof body.customApiKey === 'string' ? body.customApiKey : undefined);
    const customGeminiKey = rawCustomKey ? rawCustomKey.trim() : undefined;

    // 4. Redis Cache Check (with in-memory fallback)
    const cacheKey = createCacheKey(
      sanitizedReq.topic,
      sanitizedReq.language,
      sanitizedReq.length,
      sanitizedReq.tone,
      sanitizedReq.keyFacts
    );

    const cachedData = await getCachedResponse(cacheKey);
    if (cachedData) {
      const cachedPayload = formatResponsePayload(cachedData);
      return NextResponse.json(cachedPayload, {
        status: 200,
        headers: {
          ...rateHeaders,
          'X-Cache': 'HIT',
          ...(process.env.NODE_ENV !== 'production' && cachedData.provider
            ? { 'X-Provider': cachedData.provider }
            : {}),
        },
      });
    }

    // 5. Generate with Multi-Provider Fallback: Gemini -> Groq -> OpenRouter
    const result = await generateScript(sanitizedReq, customGeminiKey);

    // 6. Save to Redis Cache (with in-memory fallback)
    await setCachedResponse(cacheKey, result.data);

    const responsePayload = formatResponsePayload(result.data);

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        ...rateHeaders,
        'X-Cache': 'MISS',
        ...(process.env.NODE_ENV !== 'production'
          ? { 'X-Provider': result.provider }
          : {}),
      },
    });
  } catch (err: any) {
    const rawError = String(err?.message || '');
    
    // Server logs internal info with any key or secret redacted
    console.error('[API /api/generate Error]:', rawError.replace(/(key|token)=[^\s&]+/gi, '$1=[REDACTED]'));

    // Safety or Prompt Injection rejection from AI providers
    const isSafetyBlocked =
      rawError.toLowerCase().includes('safety') ||
      rawError.toLowerCase().includes('harm_category') ||
      rawError.toLowerCase().includes('blocked') ||
      rawError.toLowerCase().includes('content filter') ||
      rawError.toLowerCase().includes('violat') ||
      rawError.toLowerCase().includes('prohibited');

    if (isSafetyBlocked) {
      return NextResponse.json(
        {
          error: 'Is topic pe script nahi ban sakti, kuch aur try karo',
          details: 'Topic was filtered by safety policies.',
          code: 'SAFETY_BLOCKED',
        },
        { status: 400 }
      );
    }

    const isRateLimit =
      err instanceof AllProvidersRateLimitedError ||
      rawError.includes('AllProvidersRateLimitedError') ||
      rawError.includes('429') ||
      rawError.toLowerCase().includes('quota') ||
      rawError.toLowerCase().includes('resource has been exhausted') ||
      rawError.toLowerCase().includes('rate limit');

    if (isRateLimit) {
      return NextResponse.json(
        {
          error: 'Bahut log use kar rahe hain, thodi der baad try karo',
          details: 'All AI models are currently experiencing peak traffic or quota limits. Please try again shortly.',
          code: 'RATE_LIMITED',
        },
        { status: 429, headers: { 'Retry-After': '10' } }
      );
    }

    // Security check: Mask internal details, stack traces, and keys from user responses
    return NextResponse.json(
      {
        error: 'Failed to generate script.',
        details: 'AI service is temporarily busy or unable to generate the script. Please check your topic and try again.',
        code: 'GENERATION_FAILED',
      },
      { status: 500 }
    );
  }
}

// Strictly disallow all other HTTP methods on /api/generate
export async function GET() {
  return new NextResponse('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST', 'Content-Type': 'text/plain' },
  });
}

export async function PUT() {
  return new NextResponse('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST', 'Content-Type': 'text/plain' },
  });
}

export async function DELETE() {
  return new NextResponse('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST', 'Content-Type': 'text/plain' },
  });
}

export async function PATCH() {
  return new NextResponse('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST', 'Content-Type': 'text/plain' },
  });
}
