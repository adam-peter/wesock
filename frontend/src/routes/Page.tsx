import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { socket } from '../lib/socket';
import { ChatLayout } from '../components/ChatLayout';
import type { SerializedMessage } from 'shared';

const DUMMY_USERS = [
  { id: '1', nick: 'Alice' },
  { id: '2', nick: 'Bob' },
  { id: '3', nick: 'Charlie' },
];

export default function RootPage() {
  const navigate = useNavigate();
  const nickname = localStorage.getItem('nickname');
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

  function handleLogout(): void {
    localStorage.removeItem('nickname');
    setMessages([]);
    navigate('/login', { replace: true });
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

  return (
    <ChatLayout
      nickname={nickname!}
      messages={messages}
      users={users}
      onSendMessage={handleSendMessage}
      onLogout={handleLogout}
    />
  );
}
