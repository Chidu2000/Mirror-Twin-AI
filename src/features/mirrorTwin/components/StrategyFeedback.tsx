import { useState } from 'react';
import { Sparkles } from 'lucide-react';

type FeedbackKey = 'happy' | 'neutral' | 'sad';

export default function StrategyFeedback() {
  const [selected, setSelected] = useState<FeedbackKey | null>(null);

  const options: { key: FeedbackKey; emoji: string }[] = [
    { key: 'happy', emoji: '😊' },
    { key: 'neutral', emoji: '😐' },
    { key: 'sad', emoji: '🙁' },
  ];

  return (
    <div className="mt-4 rounded-3xl p-[1.5px] header-shell shadow-[0_24px_50px_-30px_rgba(15,23,42,0.65)]">
      <div className="panel-strong backdrop-blur-md rounded-3xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[var(--accent)]" />
          <h4 className="text-sm font-semibold text-[var(--text)]">Found the suggestions helpful? Please leave a rating.</h4>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSelected(option.key)}
              className={`rounded-2xl border px-3 py-4 text-center transition ${
                selected === option.key
                  ? 'border-[var(--accent)] bg-white/15 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.6)]'
                  : 'border-[var(--panel-border)] bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="text-4xl leading-none">{option.emoji}</div>
            </button>
          ))}
        </div>
        {selected && (
          <div className="mt-3 text-xs text-[var(--muted)]">
            Thanks — we’ll tune future suggestions based on this.
          </div>
        )}
      </div>
    </div>
  );
}
