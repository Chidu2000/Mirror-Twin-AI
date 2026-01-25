import type { LLMArgs } from '../types'
import { createOpikTrace, flushOpik, queueTraceEvaluation } from './opikService'

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
  const trace = await createOpikTrace({
    name: 'agent.chat_twin',
    input: {
      userName: args.userName,
      resolution: args.resolution,
      struggles: args.struggles,
      progressLevel: args.progressLevel,
      recentJournal: args.journalEntries.slice(-3),
    },
    metadata: { model: 'gemini-3-flash-preview', promptVersion: 'chat-v1' },
    tags: ['agent', 'chat'],
  });
  const startTime = performance.now();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
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
    const errorText = await response.text(); 
    throw new Error(
      `LLM request failed: ${response.status} ${response.statusText} - ${errorText}`
    )
  }

  const data = await response.json()

  const assistantText =
    data.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text)
      .join('') ?? null

  if (assistantText) {
    const latencyMs = Math.round(performance.now() - startTime);

    trace?.span({
      name: 'llm.generate_chat',
      type: 'llm',
      input: { prompt: systemPrompt },
      output: { response: assistantText },
      metadata: { model: 'gemini-3-flash-preview', provider: 'google', latencyMs },
    });
    trace?.update({ output: { response: assistantText } });
    trace?.end();

    queueTraceEvaluation(trace, {
      input: systemPrompt,
      output: assistantText,
      labelPrefix: 'chat_twin',
    });
    await flushOpik();
  }

  return assistantText || "Sorry, I didn't get a response from the LLM."
}
