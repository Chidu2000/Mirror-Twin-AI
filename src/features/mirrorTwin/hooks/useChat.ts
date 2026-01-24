import { useState } from 'react';
import { sendToMirrorTwin } from '../services/llmService';
import { storageService } from '../services/storageService';
import type { ChatMessage, LLMArgs } from '../types';

export function useChat() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (args: LLMArgs, baseHistory?: ChatMessage[]) => {
    setIsLoading(true);
    const updated: ChatMessage[] = [...(baseHistory ?? chatHistory)];
    
    const assistantText = await sendToMirrorTwin(args);
    updated.push({ role: 'assistant', content: assistantText });
    setChatHistory(updated);
    await storageService.set('mirror-twin-history', updated);
    setIsLoading(false);
  };

  return { chatHistory, setChatHistory, sendMessage, isLoading };
}
