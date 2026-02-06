const MAX_STRING_LENGTH = 200;
const MAX_DEPTH = 3;
const MAX_ARRAY_ITEMS = 5;

const SENSITIVE_KEY_RE = /(pass(word)?|token|secret|api[-_]?key|session|cookie)/i;

const REDACTION_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, replacement: '[redacted-email]' },
  {
    pattern:
      /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    replacement: '[redacted-phone]',
  },
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[redacted-ssn]' },
  { pattern: /\b(?:\d[ -]*?){13,19}\b/g, replacement: '[redacted-cc]' },
  { pattern: /\bAIza[0-9A-Za-z-_]{35}\b/g, replacement: '[redacted-key]' },
  { pattern: /\b(sk|rk|pk)-[A-Za-z0-9_-]{16,}\b/g, replacement: '[redacted-key]' },
];

export function redactSensitiveText(text: string): string {
  let value = text;
  for (const { pattern, replacement } of REDACTION_PATTERNS) {
    value = value.replace(pattern, replacement);
  }
  return value;
}

export function truncateText(text: string, max = MAX_STRING_LENGTH): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

export function sanitizeTelemetryValue(value: unknown, depth = 0): unknown {
  if (value == null) return value;
  if (depth > MAX_DEPTH) return '[truncated]';

  if (typeof value === 'string') {
    return truncateText(redactSensitiveText(value));
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (Array.isArray(value)) {
    const items = value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeTelemetryValue(item, depth + 1));
    if (value.length > MAX_ARRAY_ITEMS) {
      items.push(`[...${value.length - MAX_ARRAY_ITEMS} more]`);
    }
    return items;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    const sanitized: Record<string, unknown> = {};
    for (const [key, entry] of entries) {
      if (SENSITIVE_KEY_RE.test(key)) {
        sanitized[key] = '[redacted]';
        continue;
      }
      sanitized[key] = sanitizeTelemetryValue(entry, depth + 1);
    }
    return sanitized;
  }

  return '[unhandled]';
}

export function summarizeForTelemetry(text: string, max = 160): string {
  return truncateText(redactSensitiveText(text), max);
}
