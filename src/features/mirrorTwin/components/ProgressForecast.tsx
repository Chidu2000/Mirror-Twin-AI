import { TrendingUp } from 'lucide-react';
import type { JournalEntry } from '../types';

interface ProgressForecastProps {
  progressLevel: number;
  journalEntries: JournalEntry[];
}

function getRecentProgressDeltas(entries: JournalEntry[], days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffKey = cutoff.toISOString().slice(0, 10);
  return entries.filter((entry) => entry.date >= cutoffKey && typeof entry.progressDelta === 'number');
}

function formatEstimate(daysLeft: number) {
  if (!Number.isFinite(daysLeft) || daysLeft <= 0) return 'Soon';
  if (daysLeft <= 7) return `${Math.ceil(daysLeft)} days`;
  if (daysLeft <= 30) return `${Math.ceil(daysLeft / 7)} weeks`;
  return `${Math.ceil(daysLeft / 30)} months`;
}

export default function ProgressForecast({ progressLevel, journalEntries }: ProgressForecastProps) {
  const remaining = Math.max(0, 100 - progressLevel);
  const recent = getRecentProgressDeltas(journalEntries, 14);
  const rate = recent.length > 0
    ? recent.reduce((sum, entry) => sum + (entry.progressDelta ?? 0), 0) / recent.length
    : 0;
  const estimateDays = rate > 0 ? remaining / rate : 0;
  const estimateLabel = rate > 0 ? formatEstimate(estimateDays) : 'Not enough data yet';

  const forecastDetail = rate > 0
    ? `At your recent pace (~${rate.toFixed(1)}% per logged day), you could reach 100% in about ${formatEstimate(estimateDays)}.`
    : 'Log progress at least once so I can estimate your pace.';

  return (
    <div className="rounded-2xl p-[1px] header-shell shadow-[0_18px_45px_-25px_rgba(15,23,42,0.6)]">
      <div className="rounded-2xl panel p-4">
        <div className="flex items-center gap-2 text-[var(--muted)] text-xs uppercase tracking-wide">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[var(--accent)]">
            <TrendingUp className="w-4 h-4" />
          </span>
          Progress forecast
        </div>
        <div className="text-lg font-semibold text-[var(--text)] mt-2">{estimateLabel}</div>
        <p className="text-xs text-[var(--muted)] mt-1">{forecastDetail}</p>
      </div>
    </div>
  );
}
