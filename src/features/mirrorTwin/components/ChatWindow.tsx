import { useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import type { ChatMessage } from '../types';

interface Props {
  chatHistory: ChatMessage[];
  userMessage: string;
  setUserMessage: (msg: string) => void;
  sendMessage: () => void;
  isLoading: boolean;
}

export default function ChatWindow({
  chatHistory,
  userMessage,
  setUserMessage,
  sendMessage,
  isLoading,
}: Props) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever chat updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  return (
    <div className="flex flex-col panel backdrop-blur-md rounded-3xl px-6 pt-5 pb-6 shadow-[0_20px_45px_-30px_rgba(0,0,0,0.7)]">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="text-lg font-semibold text-[var(--text)]">Chat with Your Twin</h3>
      </div>

      {/* Chat messages */}
      <div className="flex-1 min-h-0 overflow-y-auto mb-4 space-y-4 pr-1">
        {chatHistory.length === 0 && !isLoading && (
          <div className="text-sm text-[var(--muted)] bg-white/5 border border-[var(--panel-border)] rounded-2xl p-4">
            Start the conversation — your future self is listening.
          </div>
        )}
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
              msg.role === 'user'
                ? 'bg-[var(--accent)] text-white shadow-md'
                : 'bg-white/5 text-[var(--text)] border border-[var(--panel-border)]'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 text-[var(--text)] px-4 py-3 rounded-2xl border border-[var(--panel-border)]">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input + Send */}
      <div className="flex gap-2">
        <input
          type="text"
          id="userMessage"
          name="userMessage"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && userMessage.trim()) {
              e.preventDefault()
              sendMessage()
            }
          }}
          className="flex-1 px-4 py-2.5 bg-white/5 border border-[var(--panel-border)] rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
          placeholder="Talk to your future self..."
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={isLoading || !userMessage.trim()}
          className="btn-accent px-6 py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  );
}
