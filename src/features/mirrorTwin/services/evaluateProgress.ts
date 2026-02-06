import { createOpikTrace, flushOpik, queueTraceEvaluation } from './opikService';
import { requestGeminiJson } from './llmClient';
import { summarizeForTelemetry } from './privacy';

function buildProgressEvaluationPrompt(entry: string, resolution: string) {
  return `Act as a precise data evaluator.
Resolution: "${resolution}"
User Entry: "${entry}"

Task: Assign a progressDelta (0-7) based on effort.
Scoring: 0=none, 1-2=small, 3-4=moderate, 5-6=strong, 7=exceptional.

Output must be a single JSON object. Do not include any conversational text or explanations.`;
}

type ProgressResult = {
  progressDelta: number;
  reason: string;
};

export async function evaluateProgress(entry: string, resolution: string): Promise<ProgressResult> {
  const evaluatePrompt = buildProgressEvaluationPrompt(entry, resolution);
  const trace = await createOpikTrace({
    name: 'agent.progress_evaluator',
    input: { resolution, entryPreview: summarizeForTelemetry(entry) },
    metadata: { model: 'gemini-3-flash-preview', promptVersion: 'progress-eval-v1' },
    tags: ['agent', 'progress', 'evaluation'],
  });
  const startTime = performance.now();

  const result = await requestGeminiJson<ProgressResult>({
    prompt: evaluatePrompt,
    generationConfig: {
      temperature: 0,
    },
    responseSchema: {
      type: 'object',
      properties: {
        progressDelta: { type: 'number' },
        reason: { type: 'string' },
      },
      required: ['progressDelta', 'reason'],
    },
    guardrails: { tone: 'neutral' },
    fallback: {
      progressDelta: 0,
      reason: 'Unable to evaluate progress right now.',
    },
    retry: { maxAttempts: 3, baseDelayMs: 350 },
  });

  const latencyMs = Math.round(performance.now() - startTime);

  trace?.span({
    name: 'llm.evaluate_progress',
    type: 'llm',
    input: { promptSummary: summarizeForTelemetry(evaluatePrompt) },
    output: {
      progressDelta: result.progressDelta,
      reason: summarizeForTelemetry(result.reason),
    },
    metadata: { model: 'gemini-3-flash-preview', provider: 'google', latencyMs },
  });
  trace?.update({
    output: {
      progressDelta: result.progressDelta,
      reason: summarizeForTelemetry(result.reason),
    },
  });
  trace?.end();

  queueTraceEvaluation(trace, {
    input: summarizeForTelemetry(evaluatePrompt),
    output: summarizeForTelemetry(JSON.stringify(result)),
    labelPrefix: 'progress_eval',
  });
  await flushOpik();

  const bounded = Math.max(0, Math.min(7, Number(result.progressDelta) || 0));
  if (bounded !== result.progressDelta) {
    return { progressDelta: bounded, reason: result.reason };
  }
  return result;
}
