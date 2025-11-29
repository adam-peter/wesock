import { useEffect, useState } from 'react';
import { socket } from './lib/socket';
import { LoginScreen } from './components/LoginScreen';
import { ChatLayout } from './components/ChatLayout';
import type { SerializedMessage } from 'shared';

const DUMMY_USERS = [
  { id: '1', nick: 'Alice' },
  { id: '2', nick: 'Bob' },
  { id: '3', nick: 'Charlie' },
];

export default function App() {
  const [nickname, setNickname] = useState<string | null>(() => {
    return localStorage.getItem('nickname');
  });
  const [messages, setMessages] = useState<SerializedMessage[]>([]);
  const [users] = useState(DUMMY_USERS);

  useEffect(() => {
    function onConnect(): void {
      console.log(`Connected with ID: ${socket.id}`);
    }

    function onDisconnect(): void {
      console.log('Disconnected from server');
    }

    function onReceiveMessage(message: SerializedMessage): void {
      setMessages((prev) => [...prev, message]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);

    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.disconnect();
    };
  }, []);

  function handleJoin(nick: string): void {
    localStorage.setItem('nickname', nick);
    setNickname(nick);
  }

  function handleLogout(): void {
    localStorage.removeItem('nickname');
    setNickname(null);
    setMessages([]);
  }

  function handleSendMessage(content: string): void {
    if (!nickname) {
      return;
    }

    socket.emit('send_message', {
      content,
      senderNick: nickname,
      roomId: 'global',
    });
  }

  if (!nickname) {
    return <LoginScreen onJoin={handleJoin} />;
  }

  return (
    <ChatLayout
      nickname={nickname}
      messages={messages}
      users={users}
      onSendMessage={handleSendMessage}
      onLogout={handleLogout}
    />
  );
}
