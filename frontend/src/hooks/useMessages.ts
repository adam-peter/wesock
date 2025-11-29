import { useState, useCallback } from 'react';
import { useSocketEvent } from './useSocketEvent';
import type { SerializedMessage } from 'shared';

export function useMessages(): {
  messages: SerializedMessage[];
  clearMessages: () => void;
} {
  const [messages, setMessages] = useState<SerializedMessage[]>([]);

  const handleReceiveMessage = useCallback((message: SerializedMessage): void => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleLoadHistory = useCallback((history: SerializedMessage[]): void => {
    setMessages(history);
  }, []);

  const clearMessages = useCallback((): void => {
    setMessages([]);
  }, []);

  useSocketEvent('receive_message', handleReceiveMessage);
  useSocketEvent('load_history', handleLoadHistory);

  return { messages, clearMessages };
}
