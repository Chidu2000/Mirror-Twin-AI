export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface JournalEntry {
  date: string;
  entry: string;
  progressBefore: number;
  progressDelta?: number;
  aiReason?: string;
}

export interface DailyMotivation {
  date: string;
  summary: string;
}

export interface MirrorTwinUser {
  userName: string;
  resolution: string;
  struggles: string;
  progressLevel: number;
}

export interface LLMArgs {
  userName: string;
  resolution: string;
  struggles: string;
  progressLevel: number;
  journalEntries: string[];
  messages: ChatMessage[];
}

export interface DailyProgress{
  date: string;
  logCount: number;
  progressLogged: boolean;
};

