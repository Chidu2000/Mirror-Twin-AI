const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function buildMotivationPrompt(params: {
  resolution: string;
  evolutionStage: string;
}) {
  // We move the "Identity" to a system-style instruction and use grounded language
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

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
  // Parse the text part which is now guaranteed to be a valid JSON string
  const content = JSON.parse(result.candidates[0]?.content?.parts?.[0]?.text);
  console.log('response from gemini:', content.summary);
  return content.summary;
}
