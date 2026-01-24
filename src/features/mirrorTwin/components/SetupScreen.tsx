import { Sparkles } from 'lucide-react';

interface SetupProps {
  userName: string;
  resolution: string;
  struggles: string;
  setUserName: (v: string) => void;
  setResolution: (v: string) => void;
  setStruggles: (v: string) => void;
  handleSetup: () => void;
}

export default function SetupScreen({ userName, resolution, struggles, setUserName, setResolution, setStruggles, handleSetup }: SetupProps) {
  return (
    <div className="min-h-screen theme-bg p-6 flex items-center justify-center">
      <div className="max-w-lg w-full panel-strong backdrop-blur-md rounded-3xl shadow-[0_30px_70px_-35px_rgba(0,0,0,0.8)] p-8">
        <div className="text-center mb-8">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-[var(--accent)]" />
          <h1 className="text-3xl font-bold text-white mb-2">Meet Your Mirror Twin</h1>
          <p className="text-[var(--muted)]">Your future self is waiting to inspire you</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">What's your name?</label>
            <input
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              className="w-full px-4 py-3 border border-[var(--panel-border)] rounded-xl bg-white/5 text-[var(--text)] placeholder-[var(--muted)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              placeholder="Alex"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">
              {`What's your ${new Date().getFullYear()} resolution?`}
            </label>
            <textarea
              value={resolution}
              onChange={e => setResolution(e.target.value)}
              className="w-full px-4 py-3 border border-[var(--panel-border)] rounded-xl bg-white/5 text-[var(--text)] placeholder-[var(--muted)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              placeholder="Get fit, learn Spanish, read more..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">What struggles might you face?</label>
            <textarea
              value={struggles}
              onChange={e => setStruggles(e.target.value)}
              className="w-full px-4 py-3 border border-[var(--panel-border)] rounded-xl bg-white/5 text-[var(--text)] placeholder-[var(--muted)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              placeholder="Busy schedule, lack of motivation..."
              rows={3}
            />
          </div>

          <button
            onClick={handleSetup}
            className="w-full btn-accent font-semibold py-4 rounded-xl transition-all shadow-lg"
          >
            Create My Mirror Twin
          </button>
        </div>
      </div>
    </div>
  );
}
