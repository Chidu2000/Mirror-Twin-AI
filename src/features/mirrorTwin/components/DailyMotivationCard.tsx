export default function DailyMotivationCard({ summary }: { summary: string }) {
  return (
    <div className="rounded-2xl p-5 panel backdrop-blur">
      <h3 className="text-sm font-semibold text-[var(--accent)] mb-2">
        AI Motivation Summary
      </h3>
      <p className="text-sm text-[var(--muted)] leading-relaxed">
        {summary}
      </p>
    </div>
  );
}
