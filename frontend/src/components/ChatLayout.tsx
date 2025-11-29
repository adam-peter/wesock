import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MessageList } from './MessageList';
import { UserList } from './UserList';
import { MobileMenu } from './MobileMenu';
import type { AnySerializedMessage, OnlineUser } from 'shared';
import { ModeToggle } from './mode-toggle';

interface ChatLayoutProps {
  nickname: string;
  roomId: string;
  messages: AnySerializedMessage[];
  users: OnlineUser[];
  onSendMessage: (content: string) => void;
  onLogout: () => void;
  onLoadMore: (messages: AnySerializedMessage[]) => void;
}

export function ChatLayout({
  nickname,
  roomId,
  messages,
  users,
  onSendMessage,
  onLogout,
  onLoadMore,
}: ChatLayoutProps) {
  const [messageInput, setMessageInput] = useState('');
  const [copied, setCopied] = useState(false);

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (messageInput.trim()) {
      onSendMessage(messageInput.trim());
      setMessageInput('');
    }
  }

  function copyRoomId() {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="h-screen flex bg-background">
      <div className="hidden md:flex md:w-[15%] border-r bg-muted/50 p-4 flex-col justify-between">
        <h2 className="text-2xl font-bold">WeSock</h2>
        <Button variant="outline" onClick={onLogout} className="w-full">
          Logout
        </Button>
      </div>

      <div className="w-full md:w-[70%] flex flex-col bg-background">
        <div className="border-b bg-background p-4 flex justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <MobileMenu users={users} onLogout={onLogout} />
            <h3 className="font-semibold text-sm md:text-base">Welcome, {nickname}</h3>
          </div>

          <div
            className="bg-muted px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-muted/80 transition-colors flex items-center gap-2"
            onClick={copyRoomId}
            title="Click to copy Room ID"
          >
            <span className="opacity-50">Room:</span>
            <span className="font-mono">{roomId}</span>
            {copied && <span className="text-green-500 font-bold">Copied!</span>}
          </div>

          <ModeToggle />
        </div>

        <MessageList messages={messages} roomId={roomId} onLoadMore={onLoadMore} />

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

      <div className="hidden md:flex md:w-[15%] border-l bg-muted/50 flex-col">
        <UserList users={users} />
      </div>
    </div>
  );
}