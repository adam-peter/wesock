import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MessageList } from './MessageList';
import { UserList } from './UserList';
import type { SerializedMessage, OnlineUser } from 'shared';

interface ChatLayoutProps {
  nickname: string;
  messages: SerializedMessage[];
  users: OnlineUser[];
  onSendMessage: (content: string) => void;
  onLogout: () => void;
}

export function ChatLayout({ nickname, messages, users, onSendMessage, onLogout }: ChatLayoutProps) {
  const [messageInput, setMessageInput] = useState('');

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (messageInput.trim()) {
      onSendMessage(messageInput.trim());
      setMessageInput('');
    }
  }

  return (
    <div className="h-screen flex bg-background">
      <div className="w-[15%] border-r bg-muted/50 p-4 flex flex-col justify-between">
        <h2 className="text-2xl font-bold">WeSock</h2>
        <Button variant="outline" onClick={onLogout} className="w-full">
          Logout
        </Button>
      </div>

      <div className="w-[70%] flex flex-col bg-background">
        <div className="border-b bg-background p-4">
          <h3 className="font-semibold">Welcome, {nickname}</h3>
        </div>

        <MessageList messages={messages} />

        <div className="border-t bg-background p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              maxLength={1000}
              className="flex-1"
            />
            <Button type="submit">Send</Button>
          </form>
        </div>
      </div>

      <div className="w-[15%] border-l bg-muted/50">
        <UserList users={users} />
      </div>
    </div>
  );
}
