import logo from '../../../assets/mirror-twin-logo.svg';
import ProgressForecast from './ProgressForecast';
import type { JournalEntry } from '../types';

interface HeaderProps {
  evolution: { stage: string; color: string };
  progressLevel: number;
  journalEntries: JournalEntry[];
}

export default function Header({ evolution, progressLevel, journalEntries }: HeaderProps) {
  return (
    <div className="rounded-3xl p-[1.5px] mb-6 header-shell shadow-[0_25px_55px_-30px_rgba(15,23,42,0.6)]">
      <div className="panel-strong backdrop-blur-md rounded-3xl p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${evolution.color} p-1 shadow-lg`}>
            <div className="w-full h-full rounded-2xl bg-black/40 flex items-center justify-center ring-1 ring-[var(--panel-border)]">
              <img src={logo} alt="Mirror Twin logo" className="w-12 h-12" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-1">Your Mirror Twin</h2>
            <p className="text-[var(--muted)]">Stage: {evolution.stage}</p>
          </div>
        </div>

          <div className="w-full max-w-xs justify-self-center">
            <ProgressForecast progressLevel={progressLevel} journalEntries={journalEntries} />
          </div>

          <div className="flex-1 max-w-md w-full justify-self-end">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--muted)]">Evolution Progress</span>
              <span className="text-sm font-bold text-[var(--text)]">{progressLevel}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 ring-1 ring-[var(--panel-border)]">
              <div
                className={`h-3 rounded-full bg-gradient-to-r ${evolution.color} transition-all duration-500`}
                style={{ width: `${progressLevel}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
