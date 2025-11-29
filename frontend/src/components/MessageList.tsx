import {
  useRef,
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
} from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { socket } from '../lib/socket';
import type { AnySerializedMessage, LoadMoreMessagesPayload } from 'shared';

interface MessageListProps {
  messages: AnySerializedMessage[];
  roomId: string;
  onLoadMore: (messages: AnySerializedMessage[]) => void;
}

export function MessageList({
  messages,
  roomId,
  onLoadMore,
}: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const topObserverRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const previousScrollHeightRef = useRef<number>(0);
  const isLoadingMoreRef = useRef<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (viewport) {
        viewportRef.current = viewport as HTMLDivElement;
      }
    }
  }, []);

  const scrollToBottom = useCallback((): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isInitialLoad && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
        setIsInitialLoad(false);
        lastMessageIdRef.current = messages[messages.length - 1]?.id;
      }, 100);
    }
  }, [messages.length, isInitialLoad, messages]);

  useEffect(() => {
    const currentLastMessageId = messages[messages.length - 1]?.id;

    if (
      !isInitialLoad &&
      currentLastMessageId &&
      currentLastMessageId !== lastMessageIdRef.current
    ) {
      scrollToBottom();
      lastMessageIdRef.current = currentLastMessageId;
    }
  }, [messages, scrollToBottom, isInitialLoad]);

  const loadMoreMessages = useCallback((): void => {
    if (isLoadingMore || !hasMore) {
      return;
    }

    if (viewportRef.current) {
      previousScrollHeightRef.current = viewportRef.current.scrollHeight;
    }

    setIsLoadingMore(true);
    isLoadingMoreRef.current = true;

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
          isLoadingMoreRef.current = false;
        }
      }
    );
  }, [isLoadingMore, hasMore, roomId, messages.length]);

  useLayoutEffect(() => {
    if (
      isLoadingMoreRef.current &&
      viewportRef.current &&
      previousScrollHeightRef.current > 0
    ) {
      const currentScrollHeight = viewportRef.current.scrollHeight;
      const heightDifference =
        currentScrollHeight - previousScrollHeightRef.current;

      if (heightDifference > 0) {
        viewportRef.current.scrollTop =
          viewportRef.current.scrollTop + heightDifference;
      }

      isLoadingMoreRef.current = false;
      previousScrollHeightRef.current = 0;
    }
  }, [messages]);

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
        if (
          entries[0]?.isIntersecting &&
          !isLoadingMore &&
          hasMore &&
          messages.length > 0
        ) {
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

        {messages.map((msg) => {
          if (msg.type === 'system') {
            return (
              <div key={msg.id} className="text-center text-sm text-muted-foreground/60 italic py-1">
                {msg.content}
              </div>
            );
          }

          return (
            <div key={msg.id} className="bg-muted/50 rounded-lg p-3">
              <div className="font-semibold text-sm text-primary">
                {msg.senderNick}
              </div>
              <div className="text-foreground mt-1">{msg.content}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
