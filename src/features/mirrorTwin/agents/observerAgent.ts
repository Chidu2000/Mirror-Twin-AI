import { getTwinEvolution } from '../../../utils/evolution';
import type { MirrorTwinUser, JournalEntry } from '../types';
import { getNDaysAgo } from './utils';

export interface AgentContext {
  user: MirrorTwinUser;
  journalEntries: JournalEntry[];
}

export interface ObserverOutput {
  totalEntries: number;
  recentCount: number;
  consistency: 'low' | 'medium' | 'high';
  evolutionStage: string;
}

export function observerAgent(ctx: AgentContext): ObserverOutput {
  const totalEntries = ctx.journalEntries.length;

  const lastWeekDate = getNDaysAgo(7);
  const recentEntries = ctx.journalEntries.filter((e) => e.date >= lastWeekDate);
  const recentCount = recentEntries.length;

  let consistency: 'low' | 'medium' | 'high' = 'low';
  if (recentCount >= 5) consistency = 'high';
  else if (recentCount >= 2) consistency = 'medium';

  const evolution = getTwinEvolution(ctx.user.progressLevel);

  return {
    totalEntries,
    recentCount,
    consistency,
    evolutionStage: evolution.stage,
  };
}
