import './App.css'
import { useEffect, useMemo, useState } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { Palette } from 'lucide-react'
import logo from './assets/mirror-twin-logo.svg'
import MirrorTwinApp from './features/mirrorTwin/MirrorTwinApp'

type ThemeMode = 'dark' | 'light' | 'aurora'
const THEME_ORDER: ThemeMode[] = ['dark', 'light', 'aurora']

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('mirror-twin-theme') as ThemeMode | null
    return stored && THEME_ORDER.includes(stored) ? stored : 'dark'
  })

  useEffect(() => {
    localStorage.setItem('mirror-twin-theme', theme)
  }, [theme])

  const nextTheme = useMemo(() => {
    const currentIndex = THEME_ORDER.indexOf(theme)
    return THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length]
  }, [theme])

  return (
    <div className={`theme-${theme} text-[var(--text)]`}>
      <SignedOut>
        <div className="min-h-screen text-[var(--text)] px-6 py-12 theme-bg landing-hero">
          <div className="landing-grid" />
          <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full panel text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Future-you accountability
              </div>
              <h1 className="mt-4 text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-rose-400 via-orange-300 to-amber-300 bg-clip-text text-transparent">
                  Mirror Twin
                </span>
                <span className="block text-[var(--muted)] text-2xl md:text-3xl font-semibold mt-3">
                  A future-you mirror that keeps your goals honest.
                </span>
              </h1>
              <p className="mt-6 text-lg text-[var(--muted)] leading-relaxed max-w-xl">
                Log your daily progress. Your future self replies with the push you actually need,
                then keeps you consistent with streaks, strategy nudges, and real progress.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 items-center">
                <SignInButton>
                  <button className="px-8 py-3 rounded-xl btn-accent transition font-semibold shadow-[0_18px_40px_-20px_rgba(15,23,42,0.45)]">
                    Get Started
                  </button>
                </SignInButton>
                <div className="text-sm text-[var(--muted)]">
                  Built for "Commit to Change" Hackathon. Powered by Gemini 2.5 Flash &amp; Opik Observability.
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="panel-strong rounded-3xl p-6 shadow-[0_24px_60px_-35px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl panel shadow-[0_20px_50px_-30px_rgba(0,0,0,0.8)]">
                    <img src={logo} alt="Mirror Twin logo" className="w-16 h-16" />
                  </div>
                  <div>
                    <div className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Daily loop</div>
                    <div className="text-2xl font-semibold">Log. Reflect. Advance.</div>
                  </div>
                </div>
                <div className="mt-6 grid gap-3">
                  <div className="rounded-2xl border border-[var(--panel-border)] bg-white/5 px-4 py-3">
                    <div className="text-sm text-[var(--muted)]">Mirror Twin Reply</div>
                    <div className="text-base">“We’re steady at 33%. Let’s keep the next win small and repeatable.”</div>
                  </div>
                  <div className="rounded-2xl border border-[var(--panel-border)] bg-white/5 px-4 py-3">
                    <div className="text-sm text-[var(--muted)]">Today’s Focus</div>
                    <div className="text-base">One small milestone + one deliberate practice session.</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="panel-strong rounded-3xl p-5 border border-[var(--panel-border)]">
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Progress</div>
                  <div className="text-2xl font-semibold mt-2">Momentum</div>
                  <div className="text-sm text-[var(--muted)] mt-2">Effort-based scoring keeps it fair.</div>
                </div>
                <div className="panel-strong rounded-3xl p-5 border border-[var(--panel-border)]">
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Trust</div>
                  <div className="text-2xl font-semibold mt-2">Private</div>
                  <div className="text-sm text-[var(--muted)] mt-2">Redacted telemetry, safety by default.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <header className="fixed top-0 right-0 p-4 z-50 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTheme(nextTheme)}
            className="h-11 px-3 rounded-xl panel text-[var(--muted)] hover:text-[var(--text)] transition flex items-center gap-2 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.6)]"
          >
            <Palette className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">{theme}</span>
          </button>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: 'w-12 h-12',
              },
            }}
          />
        </header>
        <MirrorTwinApp />
      </SignedIn>
    </div>
  )
}
