import type { LLMArgs } from '../types'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

function buildSystemPrompt(args: LLMArgs): string {
  const recentJournal = args.journalEntries.slice(-3).join('; ')

  return `
You are ${args.userName}'s mirror twin — the future version of them who has already achieved:
"${args.resolution}"

Your personality:
- Casual, warm, and encouraging like a close friend
- Speak as if you've already achieved the goal
- Reference concrete wins related to their resolution
- Remember their struggles: ${args.struggles}
- Be empathetic and optimistic

Current progress: ${args.progressLevel}%
Recent journal entries: ${recentJournal}

Guidelines:
- Keep replies under 3 sentences
- Use "we" language
- Be encouraging, not preachy
`
}

export async function sendToMirrorTwin(args: LLMArgs): Promise<string> {
  const systemPrompt = buildSystemPrompt(args);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // 1. Structure must be 'contents' -> 'parts' -> 'text'
        contents: [{
          parts: [{ text: systemPrompt }]
        }],
        // 2. Settings must be wrapped in 'generationConfig'
        generationConfig: {
          temperature: 0.7,
          candidateCount: 1,
          maxOutputTokens: 500,
        }
      }),
    }
  )

  if (!response.ok) {
    // It's helpful to log the error text to debug specific API refusals
    const errorText = await response.text(); 
    throw new Error(
      `LLM request failed: ${response.status} ${response.statusText} - ${errorText}`
    )
  }

  const data = await response.json()

  // 3. Response parsing matches the new structure
  const assistantText =
    data.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text)
      .join('') ?? null

  return assistantText || "Sorry, I didn't get a response from the LLM."
}