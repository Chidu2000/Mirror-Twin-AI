import { Calendar, TrendingUp } from 'lucide-react';

interface Entry {
  date: string;
  entry: string;
  progressBefore: number;
}

interface ProgressLoggerProps {
  todayEntry: string;
  setTodayEntry: (v: string) => void;
  journalEntries: Entry[];
  logProgress: () => void;
  onLogEntry: () => void;
  dailyLogCount: number;
  progressLoggedToday: boolean;
}

export default function ProgressLogger({ todayEntry, setTodayEntry, journalEntries, logProgress, onLogEntry, dailyLogCount, progressLoggedToday }: ProgressLoggerProps) {
  const entryLimitReached = dailyLogCount >= 5;
  const remainingLogs = Math.max(0, 5 - dailyLogCount);

  return (
    <div className="panel backdrop-blur-md rounded-3xl px-6 pt-5 pb-6 shadow-[0_20px_45px_-30px_rgba(0,0,0,0.7)] flex flex-col gap-2.25">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-7 text-[var(--accent)]" />
        <h3 className="text-lg font-semibold text-[var(--text)]">Record 5 Key Wins</h3>
      </div>

      <textarea
        id="logProgress"
        value={todayEntry}
        onChange={(e) => setTodayEntry(e.target.value)}
        className="w-full py-5 bg-white/5 border border-[var(--panel-border)] rounded-xl text-[var(--text)] placeholder-[var(--muted)] text-center placeholder:text-center mb-4 focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
        placeholder="What did you do today toward your goal?"
        rows={4}
        disabled={entryLimitReached}
      />
      <p className="text-xs text-[var(--muted)] mb-4">
        {entryLimitReached ? 'Daily limit reached. Come back tomorrow.' : `Remaining logs today: ${remainingLogs}`}
      </p>

       {/* Log Entry Button */}
      <button
        onClick={onLogEntry}
        disabled={entryLimitReached || !todayEntry.trim()}
        className="w-full mb-6 btn-accent font-semibold py-3 rounded-xl transition-all shadow-lg disabled:opacity-50"
      >
        Log Entry
      </button>

      <div className="mt-4">
        <h4 className="text-sm font-semibold text-[var(--muted)] mb-3">Recent Entries</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {journalEntries.slice(-5).reverse().map((entry, idx) => (
            <div key={idx} className="bg-white/5 rounded-xl p-3 text-sm border border-[var(--panel-border)]">
              <p className="text-[var(--muted)] text-xs mb-1">{entry.date}</p>
              <p className="text-[var(--text)]">{entry.entry}</p>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={logProgress}
        disabled={progressLoggedToday}
        className="mt-4 w-full btn-success font-semibold py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
        // disabled={false}
      >
        <TrendingUp className="w-5 h-5" />
        {progressLoggedToday ? 'Progress logged' : 'Log progress'}
      </button>
    </div>
  );
}
