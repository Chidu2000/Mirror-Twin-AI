import { sanitizeTelemetryValue, summarizeForTelemetry } from './privacy';

type FeedbackScore = {
  name: string;
  value: number;
  reason?: string;
};

type EvalRequest = {
  labelPrefix: string;
  input: string;
  output: string;
};

type SpanPayload = {
  name: string;
  type?: string;
  input?: Record<string, unknown>;
  output?: unknown;
  metadata?: Record<string, unknown>;
  tags?: string[];
};

type TracePayload = {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  tags?: string[];
  spans: SpanPayload[];
  scores: FeedbackScore[];
  evals: EvalRequest[];
  ended: boolean;
};

type TraceHandle = {
  id: string;
  update: (updates: { output?: Record<string, unknown> }) => void;
  span: (span: SpanPayload) => { end: () => void };
  end: () => TraceHandle;
  score: (score: FeedbackScore) => void;
};

const pendingTraces = new Map<string, TracePayload>();
const ingestUrl = '/api/opik/ingest';
const runIdKey = 'mirror-twin-opik-run-id';

function isEnabled() {
  return Boolean(import.meta.env.VITE_OPIK_API_KEY);
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `trace_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getRunId() {
  if (typeof window === 'undefined') return createId();
  try {
    const existing = localStorage.getItem(runIdKey);
    if (existing) return existing;
    const fresh = createId();
    localStorage.setItem(runIdKey, fresh);
    return fresh;
  } catch {
    return createId();
  }
}

export async function createOpikTrace(params: {
  name: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  tags?: string[];
}) {
  if (!isEnabled()) return null;

  const id = createId();
  const runId = getRunId();
  const trace: TracePayload = {
    id,
    name: params.name,
    input: sanitizeTelemetryValue(params.input) as Record<string, unknown>,
    output: sanitizeTelemetryValue(params.output ?? {}) as Record<string, unknown>,
    metadata: sanitizeTelemetryValue({ runId, app: 'mirror-twin', ...params.metadata }) as Record<
      string,
      unknown
    >,
    tags: params.tags,
    spans: [],
    scores: [],
    evals: [],
    ended: false,
  };

  pendingTraces.set(id, trace);

  const handle: TraceHandle = {
    id,
    update: (updates) => {
      if (updates.output) {
        trace.output = sanitizeTelemetryValue(updates.output) as Record<string, unknown>;
      }
    },
    span: (span) => {
      trace.spans.push({
        ...span,
        input: span.input ? (sanitizeTelemetryValue(span.input) as Record<string, unknown>) : undefined,
        output: sanitizeTelemetryValue(span.output),
        metadata: span.metadata
          ? (sanitizeTelemetryValue(span.metadata) as Record<string, unknown>)
          : undefined,
      });
      return { end: () => {} };
    },
    end: () => {
      trace.ended = true;
      return handle;
    },
    score: (score) => {
      trace.scores.push({
        ...score,
        reason: score.reason ? summarizeForTelemetry(score.reason) : undefined,
      });
    },
  };

  return handle;
}

export function logTraceScores(trace: TraceHandle | null, scores: FeedbackScore[]) {
  if (!trace || scores.length === 0) return;

  scores.forEach((score) => {
    trace.score(score);
  });
}

export function queueTraceEvaluation(trace: TraceHandle | null, evalRequest: EvalRequest) {
  if (!trace) return;
  const entry = pendingTraces.get(trace.id);
  if (!entry) return;
  entry.evals.push({
    ...evalRequest,
    input: summarizeForTelemetry(evalRequest.input),
    output: summarizeForTelemetry(evalRequest.output),
  });
}

export async function flushOpik() {
  if (!pendingTraces.size) return;

  const traces = Array.from(pendingTraces.values());

  try {
    const response = await fetch(ingestUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ traces }),
    });

    if (!response.ok) {
      console.warn('Opik ingest failed', await response.text());
      return;
    }

    pendingTraces.clear();
  } catch (error) {
    console.warn('Opik ingest error', error);
  }
}
