import { useState, useCallback } from 'react';
import { useSocketEvent } from './useSocketEvent';
import type { AnySerializedMessage } from 'shared';

export function useMessages(): {
  messages: AnySerializedMessage[];
  clearMessages: () => void;
  loadMoreMessages: (newMessages: AnySerializedMessage[]) => void;
} {
  const [messages, setMessages] = useState<AnySerializedMessage[]>([]);

  const handleReceiveMessage = useCallback((message: AnySerializedMessage): void => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleLoadHistory = useCallback((history: AnySerializedMessage[]): void => {
    setMessages(history);
  }, []);

  const loadMoreMessages = useCallback((newMessages: AnySerializedMessage[]): void => {
    setMessages((prev) => [...newMessages, ...prev]);
  }, []);

  const clearMessages = useCallback((): void => {
    setMessages([]);
  }, []);

  useSocketEvent('receive_message', handleReceiveMessage);
  useSocketEvent('load_history', handleLoadHistory);

  return { messages, clearMessages, loadMoreMessages };
}
