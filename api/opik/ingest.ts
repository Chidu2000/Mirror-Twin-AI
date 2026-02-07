import { Opik, AnswerRelevance, Usefulness } from 'opik';

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
  output?: Record<string, unknown>;
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

type IngestPayload = {
  traces: TracePayload[];
};

const apiKey = process.env.OPIK_API_KEY || process.env.VITE_OPIK_API_KEY;
const projectName =
  process.env.OPIK_PROJECT_NAME ||
  process.env.VITE_OPIK_PROJECT_NAME ||
  'mirror-twin';

const geminiKey =
  process.env.GOOGLE_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.VITE_GEMINI_API_KEY;

if (geminiKey && !process.env.GOOGLE_API_KEY) {
  process.env.GOOGLE_API_KEY = geminiKey;
}

const evalModel = process.env.OPIK_EVAL_MODEL || 'gemini-1.5-flash';

const opikClient = apiKey
  ? new Opik({ apiKey, projectName })
  : null;

const relevanceMetric = new AnswerRelevance({
  requireContext: false,
  model: evalModel,
});
const usefulnessMetric = new Usefulness({ model: evalModel });

async function runEvals(evals: EvalRequest[], trace: ReturnType<Opik['trace']>) {
  for (const evalItem of evals) {
    try {
      const relevanceScore = await relevanceMetric.score({
        input: evalItem.input,
        output: evalItem.output,
      });
      const usefulnessScore = await usefulnessMetric.score({
        input: evalItem.input,
        output: evalItem.output,
      });

      trace.score({
        name: `${evalItem.labelPrefix}_relevance`,
        value: relevanceScore.value,
        reason: relevanceScore.reason,
      });
      trace.score({
        name: `${evalItem.labelPrefix}_usefulness`,
        value: usefulnessScore.value,
        reason: usefulnessScore.reason,
      });
    } catch (error) {
      console.warn('Opik eval failed', error);
    }
  }
}

export default async function handler(
  req: { method?: string; body?: unknown },
  res: {
    status: (code: number) => { json: (body: unknown) => void; end?: () => void };
    setHeader: (key: string, value: string) => void;
  }
) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.status(404).json({ ok: false, error: 'Not found' });
    return;
  }

  if (!opikClient) {
    res.status(200).json({ ok: false, error: 'OPIK_API_KEY is missing' });
    return;
  }

  let payload: IngestPayload | null = null;
  try {
    payload = req.body as IngestPayload;
  } catch {
    res.status(400).json({ ok: false, error: 'Invalid JSON' });
    return;
  }

  const traces = payload?.traces || [];
  for (const tracePayload of traces) {
    const trace = opikClient.trace({
      name: tracePayload.name,
      input: tracePayload.input,
      output: tracePayload.output,
      metadata: tracePayload.metadata,
      tags: tracePayload.tags,
    });

    for (const spanPayload of tracePayload.spans || []) {
      const span = trace.span({
        name: spanPayload.name,
        type: spanPayload.type || 'general',
        input: spanPayload.input,
        output: spanPayload.output,
        metadata: spanPayload.metadata,
        tags: spanPayload.tags,
      });
      span.end();
    }

    for (const score of tracePayload.scores || []) {
      trace.score({
        name: score.name,
        value: score.value,
        reason: score.reason,
      });
    }

    if (tracePayload.evals?.length) {
      await runEvals(tracePayload.evals, trace);
    }

    trace.end();
  }

  await opikClient.flush();

  res.status(200).json({ ok: true, traces: traces.length });
}
