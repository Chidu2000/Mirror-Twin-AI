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

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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

  // 2. CHANGE: Remove regex. The API now guarantees pure JSON.
  try {
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse JSON"); // Log this to see what actually came back
    throw e;
  }
}
