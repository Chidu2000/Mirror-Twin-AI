import { redactSensitiveText, truncateText } from './privacy';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

type ResponseShape = {
  maxSentences?: number;
  maxChars?: number;
  stripEmoji?: boolean;
};

type Guardrails = {
  tone?: 'supportive' | 'neutral';
  responseShape?: ResponseShape;
};

type RetryConfig = {
  maxAttempts?: number;
  baseDelayMs?: number;
};

type GeminiTextPart = {
  text?: string;
};

type GeminiContent = {
  parts?: GeminiTextPart[];
};

type GeminiCandidate = {
  content?: GeminiContent;
};

type GeminiGenerateResponse = {
  candidates?: GeminiCandidate[];
};

const SAFE_FALLBACK = 'Sorry, I cannot help with that request.';

const UNSAFE_PATTERNS: RegExp[] = [
  /\b(suicide|self-harm|kill myself|end my life)\b/i,
  /\b(bomb|explosive|weapon|pipe bomb)\b/i,
  /\b(hate crime|genocide|ethnic cleansing)\b/i,
];

const EMOJI_RE = /[\u{1F300}-\u{1FAFF}]/gu;

function buildGuardrailPreamble(tone: Guardrails['tone']) {
  const toneLine =
    tone === 'supportive'
      ? 'Tone: warm, grounded, and encouraging without being preachy.'
      : 'Tone: neutral and concise.';

  return `Safety and tone constraints:
- Refuse harmful, illegal, or self-harm content. Offer safe alternatives.
- Avoid medical, legal, or financial instructions.
- Do not include personal data or ask for sensitive info.
- Keep the response concise and respectful.
- ${toneLine}`;
}

function buildPrompt(prompt: string, guardrails?: Guardrails) {
  if (!guardrails) return prompt;
  const preamble = buildGuardrailPreamble(guardrails.tone);
  return `${preamble}\n\n${prompt}`.trim();
}

export function isUnsafeContent(text: string) {
  return UNSAFE_PATTERNS.some((pattern) => pattern.test(text));
}

function stripEmojis(text: string) {
  return text.replace(EMOJI_RE, '');
}

function limitSentences(text: string, maxSentences: number) {
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  if (sentences.length <= maxSentences) return text.trim();
  return sentences.slice(0, maxSentences).join(' ').trim();
}

function shapeText(text: string, shape?: ResponseShape) {
  let value = text.trim();
  if (!value) return value;
  if (shape?.stripEmoji) value = stripEmojis(value);
  if (shape?.maxSentences) value = limitSentences(value, shape.maxSentences);
  if (shape?.maxChars) value = truncateText(value, shape.maxChars);
  return value.trim();
}

function jitterDelay(attempt: number, baseDelayMs: number) {
  const base = baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.round(base * (0.2 + Math.random() * 0.3));
  return base + jitter;
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retry: RetryConfig = {}
): Promise<Response> {
  const maxAttempts = retry.maxAttempts ?? 3;
  const baseDelayMs = retry.baseDelayMs ?? 300;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (![408, 429, 500, 502, 503, 504].includes(response.status)) {
        return response;
      }
    } catch {
      // continue to retry
    }

    if (attempt < maxAttempts - 1) {
      const delay = jitterDelay(attempt, baseDelayMs);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('LLM request failed after retries.');
}

async function fetchGemini(
  prompt: string,
  generationConfig: Record<string, unknown>,
  retry?: RetryConfig
) {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing GEMINI API key.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig,
        }),
        signal: controller.signal,
      },
      retry
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LLM request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function extractTextPayload(data: GeminiGenerateResponse): string {
  const candidate = data.candidates?.[0]?.content?.parts ?? [];
  return candidate.map((part: { text?: string }) => part.text ?? '').join('');
}

function safeJsonParse<T>(raw: string, fallback: T): T {
  const cleaned = raw.match(/\{[\s\S]*\}/)?.[0] ?? '';
  if (!cleaned) return fallback;
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

export async function requestGeminiText(options: {
  prompt: string;
  generationConfig: Record<string, unknown>;
  guardrails?: Guardrails;
  responseShape?: ResponseShape;
  fallbackText: string;
  retry?: RetryConfig;
}) {
  const guardedPrompt = buildPrompt(options.prompt, options.guardrails);

  try {
    const data = await fetchGemini(guardedPrompt, options.generationConfig, options.retry);
    const rawText = extractTextPayload(data);
    const cleaned = shapeText(rawText, options.responseShape ?? options.guardrails?.responseShape);

    if (!cleaned) return options.fallbackText;
    if (isUnsafeContent(cleaned)) return SAFE_FALLBACK;

    return redactSensitiveText(cleaned);
  } catch {
    return options.fallbackText;
  }
}

export async function requestGeminiJson<T>(options: {
  prompt: string;
  generationConfig: Record<string, unknown>;
  responseSchema?: Record<string, unknown>;
  guardrails?: Guardrails;
  fallback: T;
  retry?: RetryConfig;
}) {
  const guardedPrompt = buildPrompt(options.prompt, options.guardrails);
  const config = {
    ...options.generationConfig,
    responseMimeType: 'application/json',
    responseSchema: options.responseSchema,
  };

  try {
    const data = await fetchGemini(guardedPrompt, config, options.retry);
    const rawText = extractTextPayload(data);
    return safeJsonParse<T>(rawText, options.fallback);
  } catch {
    return options.fallback;
  }
}
