import { Flame, CalendarCheck, Activity } from 'lucide-react';
import type { JournalEntry } from '../types';

interface StreakInsightsProps {
  journalEntries: JournalEntry[];
  today: string;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDateKey(key: string) {
  return new Date(`${key}T00:00:00`);
}

function getUniqueDateSet(entries: JournalEntry[]) {
  return new Set(entries.map((entry) => entry.date));
}

function getCurrentStreak(dateSet: Set<string>, today: string) {
  let streak = 0;
  let cursor = parseDateKey(today);
  while (dateSet.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function getLongestStreak(dateSet: Set<string>) {
  const dates = Array.from(dateSet)
    .map((key) => parseDateKey(key))
    .sort((a, b) => a.getTime() - b.getTime());

  let longest = 0;
  let current = 0;
  for (let i = 0; i < dates.length; i += 1) {
    if (i === 0) {
      current = 1;
    } else {
      const diffDays = Math.round((dates[i].getTime() - dates[i - 1].getTime()) / 86400000);
      if (diffDays === 1) current += 1;
      else current = 1;
    }
    if (current > longest) longest = current;
  }
  return longest;
}

function getLast7DaysCount(dateSet: Set<string>, today: string) {
  let count = 0;
  const cursor = parseDateKey(today);
  for (let i = 0; i < 7; i += 1) {
    if (dateSet.has(toDateKey(cursor))) count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function getConsistencyLabel(daysLogged: number) {
  if (daysLogged >= 5) return { label: 'High', color: 'text-emerald-300' };
  if (daysLogged >= 2) return { label: 'Medium', color: 'text-amber-300' };
  return { label: 'Low', color: 'text-rose-300' };
}

function getLast7Series(dateSet: Set<string>, today: string) {
  const series: number[] = [];
  const cursor = parseDateKey(today);
  for (let i = 0; i < 7; i += 1) {
    series.unshift(dateSet.has(toDateKey(cursor)) ? 1 : 0);
    cursor.setDate(cursor.getDate() - 1);
  }
  return series;
}

function buildSparkline(series: number[], width = 120, height = 28) {
  const max = Math.max(1, ...series);
  const step = width / (series.length - 1 || 1);
  const points = series
    .map((v, i) => {
      const x = i * step;
      const y = height - (v / max) * height;
      return `${x},${y}`;
    })
    .join(' ');
  return { points, width, height };
}

export default function StreakInsights({ journalEntries, today }: StreakInsightsProps) {
  const dateSet = getUniqueDateSet(journalEntries);
  const currentStreak = getCurrentStreak(dateSet, today);
  const longestStreak = getLongestStreak(dateSet);
  const last7Days = getLast7DaysCount(dateSet, today);
  const consistency = getConsistencyLabel(last7Days);
  const last7Series = getLast7Series(dateSet, today);
  const sparkline = buildSparkline(last7Series);
  const streakPct = Math.min(100, Math.round((currentStreak / 14) * 100));
  const activityPct = Math.round((last7Days / 7) * 100);

  return (
    <div className="mb-6 panel backdrop-blur-md rounded-3xl p-6 shadow-[0_20px_45px_-30px_rgba(0,0,0,0.7)] animate-streak-in">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="text-lg font-semibold text-[var(--text)]">Daily Streak & Consistency</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-[var(--panel-border)] p-4 animate-streak-in" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--muted)] text-xs uppercase tracking-wide">
              <Flame className="w-4 h-4" />
              Current streak
            </div>
            <div className="text-[11px] text-[var(--muted)]">{streakPct}%</div>
          </div>
          <div className="text-3xl font-bold text-[var(--text)] mt-2">{currentStreak} days</div>
          <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent)]/80"
              style={{ width: `${streakPct}%` }}
            />
          </div>
          <p className="text-xs text-[var(--muted)] mt-2">
            {currentStreak === 0 ? 'Log today to start your streak.' : 'Keep it alive today.'}
          </p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-[var(--panel-border)] p-4 animate-streak-in" style={{ animationDelay: '140ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--muted)] text-xs uppercase tracking-wide">
              <CalendarCheck className="w-4 h-4" />
              Longest streak
            </div>
            <div className="text-[11px] text-[var(--muted)]">Personal best</div>
          </div>
          <div className="text-3xl font-bold text-[var(--text)] mt-2">{longestStreak} days</div>
          <p className="text-xs text-[var(--muted)] mt-2">Your best run so far.</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-white/30"
                style={{ width: `${Math.min(100, Math.round((longestStreak / 30) * 100))}%` }}
              />
            </div>
            <span className="text-[10px] text-[var(--muted)]">/30</span>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-[var(--panel-border)] p-4 animate-streak-in" style={{ animationDelay: '220ms' }}>
          <div className="flex items-center justify-between">
            <div className="text-[var(--muted)] text-xs uppercase tracking-wide">Last 7 days</div>
            <div className={`text-[11px] ${consistency.color}`}>{consistency.label}</div>
          </div>
          <div className="text-3xl font-bold text-[var(--text)] mt-2">{last7Days} / 7</div>
          <div className="mt-2 flex items-center gap-3">
            <svg
              width={sparkline.width}
              height={sparkline.height}
              viewBox={`0 0 ${sparkline.width} ${sparkline.height}`}
              className="text-[var(--accent)]"
            >
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                points={sparkline.points}
              />
            </svg>
            <div className="flex-1">
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--accent)]/70"
                  style={{ width: `${activityPct}%` }}
                />
              </div>
              <div className="mt-1 text-[10px] text-[var(--muted)]">{activityPct}% active</div>
            </div>
          </div>
          <p className="text-xs text-[var(--muted)] mt-2">Consistency: {consistency.label}</p>
        </div>
      </div>
    </div>
  );
}
