import { Target } from 'lucide-react';

interface ResolutionCardProps {
  resolution: string;
}

export default function ResolutionCard({ resolution }: ResolutionCardProps) {
  return (
    <div className="panel backdrop-blur-md rounded-3xl p-6 shadow-[0_20px_45px_-30px_rgba(0,0,0,0.7)] h-full">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-5 h-8 text-[var(--accent)]" />
        <h3 className="text-lg font-semibold text-[var(--text)]">Your {new Date().getFullYear()} Resolution</h3>
      </div>
      <p className="text-[var(--muted)] leading-relaxed">{resolution}</p>
    </div>
  );
}
