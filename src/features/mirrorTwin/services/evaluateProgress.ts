import { createOpikTrace, flushOpik, queueTraceEvaluation } from './opikService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function buildProgressEvaluationPrompt(entry: string, resolution: string) {
  return `Act as a precise data evaluator. 
Resolution: "${resolution}" 
User Entry: "${entry}"

Task: Assign a progressDelta (0-7) based on effort.
Scoring: 0=none, 1-2=small, 3-4=moderate, 5-6=strong, 7=exceptional.

Output must be a single JSON object. Do not include any conversational text or explanations.`;
}

export async function evaluateProgress(entry: string, resolution: string) {
  const evaluatePrompt = buildProgressEvaluationPrompt(entry, resolution);
  const trace = await createOpikTrace({
    name: 'agent.progress_evaluator',
    input: { resolution, entry },
    metadata: { model: 'gemini-3-flash-preview', promptVersion: 'progress-eval-v1' },
    tags: ['agent', 'progress', 'evaluation'],
  });
  const startTime = performance.now();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: evaluatePrompt }]
        }],
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              progressDelta: { type: "number" },
              reason: { type: "string" }
            },
            required: ["progressDelta", "reason"]
          }
        }
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error("Google API error response:", text);
    throw new Error(`Progress evaluation failed: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const cleanJson = jsonMatch ? jsonMatch[0] : "{}";

  try {
    const parsed = JSON.parse(cleanJson);
    const latencyMs = Math.round(performance.now() - startTime);

    trace?.span({
      name: 'llm.evaluate_progress',
      type: 'llm',
      input: { prompt: evaluatePrompt },
      output: parsed,
      metadata: { model: 'gemini-3-flash-preview', provider: 'google', latencyMs },
    });
    trace?.update({ output: parsed });
    trace?.end();

    queueTraceEvaluation(trace, {
      input: evaluatePrompt,
      output: JSON.stringify(parsed),
      labelPrefix: 'progress_eval',
    });
    await flushOpik();

    return parsed;
  } catch (e) {
    console.error("Failed to parse JSON"); // Log this to see what actually came back
    throw e;
  }
}
