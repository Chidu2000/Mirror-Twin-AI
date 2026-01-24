import type { ObserverOutput } from './observerAgent';

export function strategyAgent(obs: ObserverOutput): string | null {
  if (obs.consistency === 'high') {
    return "You're on a great streak. Today, keep it easy to win: just show up and do the smallest version of your habit.";
  }

  if (obs.consistency === 'medium') {
    return "You're making progress, but it's a bit uneven. Choose one tiny, non-negotiable action for today and commit to it.";
  }

  return "It's okay that things have been patchy. For today, aim for a 2-minute version of your habit so it's almost impossible to skip.";
}
