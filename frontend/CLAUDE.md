# Frontend - WeSock - WebSocket real-time web application

Vite + React + TypeScript + Tailwind CSS. Package manager: **Bun**.
- Don't include any comments ever, unless they're commenting on an extremely complex piece of logic that's not clear from reading the code.

## Tech Stack

React 18, Vite, TypeScript (strict), Socket.io Client, Tailwind CSS, types from `shared`.

## Socket.io Client

```typescript
// lib/socket.ts
import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_BACKEND_URL, {
  autoConnect: false,
  ackTimeout: 10000,
  retries: 3,
});

export function sendMessage(content: string, room: string): Promise<void> {
  return new Promise((resolve, reject) => {
    socket.emit('send_message', { content, room }, (error?: string) => {
      error ? reject(new Error(error)) : resolve();
    });
  });
}
```

## Socket Event Hook

```typescript
// hooks/useSocket.ts
import { useEffect } from 'react';
import { socket } from '@/lib/socket';

export function useSocketEvent<T>(event: string, handler: (data: T) => void): void {
  useEffect(() => {
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [event, handler]);
}
```

**Usage:**
```typescript
import type { SerializedMessage } from 'shared/types';

useSocketEvent<SerializedMessage>('receive_message', (message) => {
  // Handle message
});
```

## State Management

```typescript
// hooks/useMessages.ts
import { useState } from 'react';
import { useSocketEvent } from './useSocket';
import type { SerializedMessage } from 'shared/types';

export function useMessages(roomId: string) {
  const [messages, setMessages] = useState<SerializedMessage[]>([]);

  useSocketEvent<SerializedMessage>('receive_message', (msg) => {
    setMessages(prev => [...prev, msg]);
  });

  useSocketEvent<SerializedMessage[]>('load_history', setMessages);

  return { messages };
}
```

## Component Pattern

```typescript
import type { SerializedMessage } from 'shared/types';

interface MessageListProps {
  messages: SerializedMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex flex-col gap-2">
      {messages.map(msg => (
        <div key={msg.id} className="p-2 bg-gray-100 rounded">
          <strong>{msg.senderNick}:</strong> {msg.content}
        </div>
      ))}
    </div>
  );
}
```

## Naming

Components: `PascalCase.tsx` | Hooks: `use{Name}.ts` | Utils: `camelCase.ts`

## Type Imports

```typescript
// types/index.ts
export type { Message, SerializedMessage, SendMessageDto, JoinRoomDto } from 'shared/types';
```

**Always use shared types** - never redefine.

## Configuration

```typescript
export const config = {
  backendUrl: import.meta.env.VITE_BACKEND_URL,
  isDevelopment: import.meta.env.DEV,
};
```

## Tailwind

Use utility classes. Order: layout → spacing → colors → typography.

## Scripts

`bun dev` | `bun run build` | `bun run preview`

## Key Principles

Socket.io singleton from `lib/socket.ts` | Custom hooks for socket logic | Import types from `shared/types` | Auto-connect: false | Use callbacks for acknowledgments | Clean up listeners in useEffect

## Common Patterns

**Join room:**
```typescript
socket.emit('join_room', { nick, room }, (error?: string) => { /* ... */ });
```

**Connection state:**
```typescript
const [isConnected, setIsConnected] = useState(socket.connected);
useEffect(() => {
  const onConnect = () => setIsConnected(true);
  const onDisconnect = () => setIsConnected(false);
  socket.on('connect', onConnect);
  socket.on('disconnect', onDisconnect);
  return () => { socket.off('connect', onConnect); socket.off('disconnect', onDisconnect); };
}, []);
```
