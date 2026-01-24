import { Sparkles } from 'lucide-react';

interface StrategyChecklistProps {
  evolutionStage: string;
  strategies: string[];
}

export default function StrategyChecklist({
  evolutionStage,
  strategies,
}: StrategyChecklistProps) {
  return (
    <div className="panel backdrop-blur-md rounded-3xl p-6 pb-10 shadow-[0_20px_45px_-30px_rgba(0,0,0,0.7)]">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[var(--accent)]" />
        <div>
          <h3 className="text-lg font-semibold text-[var(--text)]">Winning Strategies</h3>
          <p className="text-xs text-[var(--muted)]">Based on your {evolutionStage} level</p>
        </div>
      </div>

      <ol className="space-y-3 text-sm text-[var(--text)] list-decimal pl-5">
        {strategies.map((strategy) => (
          <li key={strategy} className="leading-relaxed">
            {strategy}
          </li>
        ))}
      </ol>

      <p className="mt-4 text-xs text-[var(--muted)]">Optional: pick any that fits and log what you did.</p>
    </div>
  );
}
