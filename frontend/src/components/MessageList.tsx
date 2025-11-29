import { useRef, useEffect, useState, useCallback } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { socket } from '../lib/socket';
import type { SerializedMessage, LoadMoreMessagesPayload } from 'shared';

interface MessageListProps {
  messages: SerializedMessage[];
  roomId: string;
  onLoadMore: (messages: SerializedMessage[]) => void;
}

export function MessageList({ messages, roomId, onLoadMore }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const topObserverRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const scrollToBottom = useCallback((): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isInitialLoad && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
        setIsInitialLoad(false);
      }, 100);
    }
  }, [messages.length, isInitialLoad]);

  useEffect(() => {
    if (!isInitialLoad && messages.length > 0 && !isLoadingMore) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom, isInitialLoad, isLoadingMore]);

  const loadMoreMessages = useCallback((): void => {
    if (isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);

    socket.emit(
      'load_more_messages',
      {
        roomId,
        offset: messages.length,
      },
      (error?: string) => {
        if (error) {
          console.error('Failed to load more messages:', error);
          setIsLoadingMore(false);
        }
      }
    );
  }, [isLoadingMore, hasMore, roomId, messages.length]);

  useEffect(() => {
    function handleLoadMoreResponse(data: LoadMoreMessagesPayload): void {
      onLoadMore(data.messages);
      setHasMore(data.hasMore);
      setIsLoadingMore(false);
    }

    socket.on('load_more_messages_response', handleLoadMoreResponse);

    return () => {
      socket.off('load_more_messages_response', handleLoadMoreResponse);
    };
  }, [onLoadMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoadingMore && hasMore && messages.length > 0) {
          loadMoreMessages();
        }
      },
      { threshold: 1.0 }
    );

    if (topObserverRef.current) {
      observer.observe(topObserverRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [loadMoreMessages, isLoadingMore, hasMore, messages.length]);

  return (
    <ScrollArea className="flex-1 p-4 min-h-0" ref={scrollAreaRef}>
      <div className="space-y-3">
        {hasMore && messages.length > 0 && (
          <div ref={topObserverRef} className="py-2">
            {isLoadingMore && (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="bg-muted/50 rounded-lg p-3">
            <div className="font-semibold text-sm text-primary">{msg.senderNick}</div>
            <div className="text-foreground mt-1">{msg.content}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
