import { generateDailyMotivation } from '../services/generateMotivation';
import type { MirrorTwinUser, JournalEntry } from '../types';
import { observerAgent } from './observerAgent';
import { strategyAgent } from './strategyAgent';

export interface AgentContext {
  user: MirrorTwinUser;
  journalEntries: JournalEntry[];
}

export interface AgentOutputs {
  motivationSummary: string;
  strategySuggestion: string | null;
}

export async function runDailyAgents(ctx: AgentContext): Promise<AgentOutputs> {
  const observations = observerAgent(ctx);

  const motivationSummary = await generateDailyMotivation({
    resolution: ctx.user.resolution,
    evolutionStage: observations.evolutionStage,
  });

  const strategySuggestion = strategyAgent(observations);

  return { motivationSummary, strategySuggestion };
}
