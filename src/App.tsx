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
        <div className="min-h-screen flex items-center justify-center text-[var(--text)] px-6 theme-bg">
          <div className="text-center max-w-2xl">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl panel shadow-[0_25px_60px_-35px_rgba(0,0,0,0.8)]">
                <img src={logo} alt="Mirror Twin logo" className="w-20 h-20" />
              </div>
              <h1 className="text-5xl font-bold tracking-tight">
                Mirror Twin
              </h1>
            </div>
            <p className="text-lg text-[var(--muted)] mb-8 leading-relaxed">
              Meet your future self. Track progress. Build consistency. Grow daily.
            </p>

            <SignInButton>
              <button className="px-8 py-3 rounded-xl btn-accent transition font-semibold shadow-[0_18px_40px_-20px_rgba(15,23,42,0.45)]">
                Get Started
              </button>
            </SignInButton>
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
