import { createOpikTrace, flushOpik, queueTraceEvaluation } from './opikService';
import { requestGeminiJson } from './llmClient';
import { summarizeForTelemetry } from './privacy';

function buildMotivationPrompt(params: { resolution: string; evolutionStage: string }) {
  return `
Write a short message to your past self.
Resolution: "${params.resolution}"
Stage: "${params.evolutionStage}"

Guidelines:
- Use 2-3 sentences max.
- Speak in a natural, grounded, and slightly casual tone.
- Avoid "AI-speak" and buzzwords (e.g., avoid "embrace," "journey," "tapestry," "unfolding," "testament").
- Be specific about the friction they are feeling today.
- No emojis and no cliches.
`;
}

export async function generateDailyMotivation(params: {
  resolution: string;
  evolutionStage: string;
}) {
  const prompt = buildMotivationPrompt(params);
  const trace = await createOpikTrace({
    name: 'agent.motivation',
    input: { resolution: params.resolution, evolutionStage: params.evolutionStage },
    metadata: { model: 'gemini-3-flash-preview', promptVersion: 'motivation-v1' },
    tags: ['agent', 'motivation'],
  });
  const startTime = performance.now();

  const result = await requestGeminiJson<{ summary: string }>({
    prompt,
    generationConfig: {
      temperature: 0.7,
    },
    responseSchema: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
      },
      required: ['summary'],
    },
    guardrails: { tone: 'supportive', responseShape: { maxSentences: 3, stripEmoji: true } },
    fallback: { summary: "I'm proud of the effort you put in today. Keep it simple and keep going." },
    retry: { maxAttempts: 3, baseDelayMs: 350 },
  });

  const latencyMs = Math.round(performance.now() - startTime);

  trace?.span({
    name: 'llm.generate_motivation',
    type: 'llm',
    input: { promptSummary: summarizeForTelemetry(prompt) },
    output: { summary: summarizeForTelemetry(result.summary) },
    metadata: { model: 'gemini-3-flash-preview', provider: 'google', latencyMs },
  });
  trace?.update({ output: { summary: summarizeForTelemetry(result.summary) } });
  trace?.end();

  queueTraceEvaluation(trace, {
    input: summarizeForTelemetry(prompt),
    output: summarizeForTelemetry(result.summary),
    labelPrefix: 'motivation',
  });
  await flushOpik();

  return result.summary;
}
