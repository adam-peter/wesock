import { ScrollArea } from './ui/scroll-area';
import type { SerializedMessage } from 'shared';

interface MessageListProps {
  messages: SerializedMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-muted/50 rounded-lg p-3">
            <div className="font-semibold text-sm text-primary">{msg.senderNick}</div>
            <div className="text-foreground mt-1">{msg.content}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
