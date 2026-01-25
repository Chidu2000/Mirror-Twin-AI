import { generateDailyMotivation } from '../services/generateMotivation';
import type { MirrorTwinUser, JournalEntry } from '../types';
import { observerAgent } from './observerAgent';
import { strategyAgent } from './strategyAgent';
import { createOpikTrace, flushOpik } from '../services/opikService';

export interface AgentContext {
  user: MirrorTwinUser;
  journalEntries: JournalEntry[];
}

export interface AgentOutputs {
  motivationSummary: string;
  strategySuggestion: string | null;
}

export async function runDailyAgents(ctx: AgentContext): Promise<AgentOutputs> {
  const trace = await createOpikTrace({
    name: 'agent.orchestrator',
    input: {
      resolution: ctx.user.resolution,
      progressLevel: ctx.user.progressLevel,
      journalCount: ctx.journalEntries.length,
    },
    metadata: { orchestratorVersion: 'daily-v1' },
    tags: ['agent', 'orchestrator'],
  });

  const observations = observerAgent(ctx);
  trace?.span({
    name: 'agent.observer',
    type: 'general',
    input: { journalCount: ctx.journalEntries.length },
    output: observations,
  });

  const motivationSummary = await generateDailyMotivation({
    resolution: ctx.user.resolution,
    evolutionStage: observations.evolutionStage,
  });

  const strategySuggestion = strategyAgent(observations);
  trace?.span({
    name: 'agent.strategy',
    type: 'general',
    input: { evolutionStage: observations.evolutionStage },
    output: { strategySuggestion },
  });

  trace?.end();
  await flushOpik();

  return { motivationSummary, strategySuggestion };
}
