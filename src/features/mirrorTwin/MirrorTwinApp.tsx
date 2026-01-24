import { useState, useEffect } from 'react';
import SetupScreen from './components/SetupScreen';
import Header from './components/Header';
import ProgressLogger from './components/ProgressLogger';
import ChatWindow from './components/ChatWindow';
import ResolutionCard from './components/ResolutionCard';
import StrategyChecklist from './components/StrategyChecklist';
import StreakInsights from './components/StreakInsights';
import StrategyFeedback from './components/StrategyFeedback';
import { useChat } from './hooks/useChat';
import { storageService } from './services/storageService';
import { getTwinEvolution } from '../../utils/evolution';
import { getStrategiesForResolution } from './data/strategies';
import type { MirrorTwinUser, JournalEntry, ChatMessage, DailyProgress, DailyMotivation } from './types';
import { evaluateProgress } from './services/evaluateProgress';
import { runDailyAgents } from './agents/orchestrator';


const TODAY = new Date().toISOString().slice(0, 10);

export default function MirrorTwinApp() {
  const [stage, setStage] = useState<'setup' | 'main'>('setup');
  const [userName, setUserName] = useState('');
  const [resolution, setResolution] = useState('');
  const [struggles, setStruggles] = useState('');
  const [progressLevel, setProgressLevel] = useState(0);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const { chatHistory, setChatHistory, sendMessage, isLoading } = useChat();
  const [dailyLogCount, setDailyLogCount] = useState(0);
  const [progressLoggedToday, setProgressLoggedToday] = useState(false);
  const [dailyMotivation, setDailyMotivation] = useState<DailyMotivation | null>(null);

  useEffect(() => {
  (async () => {
    const user = await storageService.get<MirrorTwinUser>('mirror-twin-user');
    const journal = (await storageService.get<JournalEntry[]>('mirror-twin-journal')) || [];
    const history = await storageService.get<ChatMessage[]>('mirror-twin-history');
    const daily = await storageService.get<DailyProgress>('mirror-twin-daily');

    if (user) {
      setUserName(user.userName);
      setResolution(user.resolution);
      setStruggles(user.struggles);
      setProgressLevel(user.progressLevel);
      setStage('main');
    }

    if (history) setChatHistory(history);
    if (journal) setJournalEntries(journal);

    if (!daily || daily.date !== TODAY) {
      const fresh = { date: TODAY, logCount: 0, progressLogged: false };
      await storageService.set('mirror-twin-daily', fresh);
      setDailyLogCount(0);
      setProgressLoggedToday(false);
    } else {
      setDailyLogCount(daily.logCount);
      setProgressLoggedToday(daily.progressLogged);
    }

    // 🔥 Run agents once we have user + journal
    if (user) {
      try {
        const agentResult = await runDailyAgents({
          user,
          journalEntries: journal,
        });

        const motivation: DailyMotivation = {
          date: TODAY,
          summary: agentResult.motivationSummary,
        };

        setDailyMotivation(motivation);

        await storageService.set('mirror-twin-motivation', motivation);
      } catch (err) {
        console.error('Agent orchestration failed', err);
      }
    }
  })();
}, [setChatHistory]);


  const handleSetup = async () => {
    if (!userName || !resolution) return;

    await storageService.set('mirror-twin-user', { userName, resolution, struggles, progressLevel });

    const welcomeMsg: ChatMessage = {
      role: 'assistant',
      content: `Hey ${userName}! I'm your mirror twin - the future version of you. Let's do this together! 🌟`
    };

    setChatHistory([welcomeMsg]);
    await storageService.set('mirror-twin-history', [welcomeMsg]);
    setStage('main');
  };

  const handleLogEntry = async (entryOverride?: string) => {
    const entryText = (entryOverride ?? todayEntry).trim();
    if (!entryText) return;

    const entry: JournalEntry = { date: TODAY, entry: entryText, progressBefore: progressLevel };
    const updated = [...journalEntries, entry];
    setJournalEntries(updated);
    if (!entryOverride) setTodayEntry('');

    const newCount = dailyLogCount + 1;
    setDailyLogCount(newCount);

    await storageService.set('mirror-twin-journal', updated);
    await storageService.set('mirror-twin-daily', {
      date: TODAY,
      logCount: newCount,
      progressLogged: progressLoggedToday,
    });
  };

  const handleLogProgress = async () => {
    try {
      if (progressLoggedToday) return;

      // 1️⃣ Use ALL journal entries from today
      const todaysEntries = journalEntries.filter(e => e.date === TODAY);

      if (todaysEntries.length === 0) {
        alert('Log at least one entry before logging progress.');
        return;
      }

      const combinedText = todaysEntries.map(e => e.entry).join('\n');
      const { progressDelta, reason } = await evaluateProgress(combinedText, resolution);
      // 0–7 clamp
      const safeDelta = Math.max(0, Math.min(progressDelta, 7));
      const newProgress = Math.min(100, progressLevel + safeDelta);

      // 2️⃣ Update evolution-driving state
      setProgressLevel(newProgress);
      setProgressLoggedToday(true);

      // 3️⃣ Add AI reasoning to the *last* entry for today (optional)
      const updatedJournal = journalEntries.map(entry => {
        if (entry.date === TODAY) {
          return {
            ...entry,
            progressDelta: safeDelta,
            aiReason: reason,
          };
        }
        return entry;
      });

      setJournalEntries(updatedJournal);

      // 4️⃣ Persist to storage
      await storageService.set('mirror-twin-journal', updatedJournal);
      await storageService.set('mirror-twin-user', {
        userName,
        resolution,
        struggles,
        progressLevel: newProgress,
      });

      // we don't touch todayEntry here – that's just the textarea buffer
    } catch (err) {
      console.error('Error logging progress:', err);
      alert('Failed to log progress. Try again.');
    }
  };



  const handleMessagesend = async () => {
    if (!userMessage.trim()) return;

    const updatedHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(updatedHistory);

    await sendMessage({
      userName,
      resolution,
      struggles,
      progressLevel,
      journalEntries: journalEntries.map(j => j.entry),
      messages: updatedHistory
    }, updatedHistory);

    setUserMessage('');
  }  

  const evolution = getTwinEvolution(progressLevel);
  const strategies = getStrategiesForResolution(resolution, evolution.stage);

  return stage === 'setup' ? (
    <SetupScreen
      userName={userName}
      resolution={resolution}
      struggles={struggles}
      setUserName={setUserName}
      setResolution={setResolution}
      setStruggles={setStruggles}
      handleSetup={handleSetup}
    />
  ) : (
    <div className="min-h-screen px-4 py-6 md:px-8 lg:px-10 theme-bg">
      <div className="max-w-7xl mx-auto">
        <Header evolution={evolution} progressLevel={progressLevel} journalEntries={journalEntries} />

        {/* 🌅 Motivation + Resolution */}
        <div className="grid gap-6 lg:grid-cols-12 mb-6 items-start">
          <div className="lg:col-span-8">
            {dailyMotivation && dailyMotivation.date === TODAY ? (
              <div className="p-6 rounded-3xl motivation-banner text-[var(--motivation-text)] shadow-[0_25px_60px_-30px_rgba(15,23,42,0.5)] border border-[var(--panel-border)]">
                <h2 className="text-lg font-semibold mb-2">🌅 Your Motivation for Today</h2>
                <p className="opacity-95 whitespace-pre-line leading-relaxed text-[var(--motivation-text)]">{dailyMotivation.summary}</p>
              </div>
            ) : (
              <div className="p-6 rounded-3xl panel-strong text-[var(--text)] shadow-[0_25px_60px_-30px_rgba(15,23,42,0.35)] border border-[var(--panel-border)]">
                <h2 className="text-lg font-semibold mb-2">🌅 Your Motivation for Today</h2>
                <p className="text-sm text-[var(--muted)]">
                  Generating today’s motivation. Log a quick entry if you haven’t yet.
                </p>
              </div>
            )}
          </div>
          <div className="lg:col-span-4">
            <ResolutionCard resolution={resolution} />
          </div>
        </div>
        <StreakInsights journalEntries={journalEntries} today={TODAY} />

        <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
          <div className="lg:col-span-4 h-full">
            <ProgressLogger
              todayEntry={todayEntry}
              setTodayEntry={setTodayEntry}
              journalEntries={journalEntries}
              logProgress={handleLogProgress}
              onLogEntry={() => handleLogEntry()}
              dailyLogCount={dailyLogCount}
              progressLoggedToday={progressLoggedToday}
            />
          </div>

          <div className="lg:col-span-5 h-full">
            <ChatWindow
              chatHistory={chatHistory}
              userMessage={userMessage}
              setUserMessage={setUserMessage}
              sendMessage={handleMessagesend}
              isLoading={isLoading}
            />
          </div>

          <div className="lg:col-span-3 h-full flex flex-col gap-6">
            <div className="flex-1">
              <StrategyChecklist
                evolutionStage={evolution.stage}
                strategies={strategies}
              />
            </div>
            <div>
              <StrategyFeedback />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




