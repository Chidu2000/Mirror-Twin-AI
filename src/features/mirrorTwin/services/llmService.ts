import type { LLMArgs } from '../types';
import { createOpikTrace, flushOpik, queueTraceEvaluation } from './opikService';
import { isUnsafeContent, requestGeminiText } from './llmClient';
import { summarizeForTelemetry } from './privacy';

function buildSystemPrompt(args: LLMArgs): string {
  const recentJournal = args.journalEntries.slice(-3).join('; ');

  return `
You are ${args.userName}'s mirror twin - the future version of them who has already achieved:
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
`;
}

function buildConversationPrompt(args: LLMArgs) {
  const recentMessages = args.messages.slice(-6);
  const formatted = recentMessages
    .map((message) => `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}`)
    .join('\n');

  return `${buildSystemPrompt(args)}

Conversation so far:
${formatted}

Reply to the user's latest message.`;
}

export async function sendToMirrorTwin(args: LLMArgs): Promise<string> {
  const latestUserMessage = [...args.messages]
    .reverse()
    .find((message) => message.role === 'user')?.content?.trim();

  if (latestUserMessage && isUnsafeContent(latestUserMessage)) {
    return 'Sorry, I cannot help with that request.';
  }

  const chatPrompt = buildConversationPrompt(args);
  const trace = await createOpikTrace({
    name: 'agent.chat_twin',
    input: {
      userNamePresent: Boolean(args.userName),
      resolution: args.resolution,
      strugglesPresent: Boolean(args.struggles),
      progressLevel: args.progressLevel,
      recentJournalCount: args.journalEntries.length,
      messageCount: args.messages.length,
    },
    metadata: { model: 'gemini-3-flash-preview', promptVersion: 'chat-v1' },
    tags: ['agent', 'chat'],
  });
  const startTime = performance.now();

  const assistantText = await requestGeminiText({
    prompt: chatPrompt,
    generationConfig: {
      temperature: 0.7,
      candidateCount: 1,
      maxOutputTokens: 500,
    },
    guardrails: {
      tone: 'supportive',
      responseShape: { maxSentences: 3, stripEmoji: true },
    },
    responseShape: { maxSentences: 3, stripEmoji: true },
    fallbackText: "Sorry, I'm having trouble responding right now.",
    retry: { maxAttempts: 3, baseDelayMs: 350 },
  });

  if (assistantText) {
    const latencyMs = Math.round(performance.now() - startTime);

    trace?.span({
      name: 'llm.generate_chat',
      type: 'llm',
      input: { promptSummary: summarizeForTelemetry(chatPrompt) },
      output: { response: summarizeForTelemetry(assistantText) },
      metadata: { model: 'gemini-3-flash-preview', provider: 'google', latencyMs },
    });
    trace?.update({ output: { response: summarizeForTelemetry(assistantText) } });
    trace?.end();

    queueTraceEvaluation(trace, {
      input: summarizeForTelemetry(chatPrompt),
      output: summarizeForTelemetry(assistantText),
      labelPrefix: 'chat_twin',
    });
    await flushOpik();
  }

  return assistantText || "Sorry, I didn't get a response from the LLM.";
}
