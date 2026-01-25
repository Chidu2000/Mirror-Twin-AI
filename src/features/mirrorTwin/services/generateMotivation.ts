import { createOpikTrace, flushOpik, queueTraceEvaluation } from './opikService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function buildMotivationPrompt(params: {
  resolution: string;
  evolutionStage: string;
}) {
  return `
Write a short message to your past self. 
Resolution: "${params.resolution}"
Stage: "${params.evolutionStage}"

Guidelines:
- Use 2-3 sentences max.
- Speak in a natural, grounded, and slightly casual tone. 
- Avoid "AI-speak" and buzzwords (e.g., avoid "embrace," "journey," "tapestry," "unfolding," "testament").
- Be specific about the friction they are feeling today.
- No emojis and no clichés.
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

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7, // Slightly higher for more "natural" and less repetitive variety
          responseMimeType: 'application/json',
          responseSchema: {
            type: "object",
            properties: {
              summary: { type: "string" }
            },
            required: ["summary"]
          }
        }
      }),
    }
  );
  const result = await response.json();  
  const content = JSON.parse(result.candidates[0]?.content?.parts?.[0]?.text);
  const latencyMs = Math.round(performance.now() - startTime);

  trace?.span({
    name: 'llm.generate_motivation',
    type: 'llm',
    input: { prompt },
    output: { summary: content.summary },
    metadata: { model: 'gemini-3-flash-preview', provider: 'google', latencyMs },
  });
  trace?.update({ output: { summary: content.summary } });
  trace?.end();

  queueTraceEvaluation(trace, {
    input: prompt,
    output: content.summary,
    labelPrefix: 'motivation',
  });
  await flushOpik();
  console.log('response from gemini:', content.summary);
  return content.summary;
}
