import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { socket } from '../lib/socket';
import { ChatLayout } from '../components/ChatLayout';
import type { SerializedMessage, OnlineUser } from 'shared';

export default function RootPage() {
  const navigate = useNavigate();
  const nickname = localStorage.getItem('nickname');
  const [messages, setMessages] = useState<SerializedMessage[]>([]);
  const [users, setUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    function onConnect(): void {
      console.log(`Connected with ID: ${socket.id}`);

      if (nickname) {
        socket.emit('join_room', { nick: nickname, roomId: 'global' }, (error?: string) => {
          if (error) {
            console.error('Failed to join room:', error);
          }
        });
      }
    }

    function onDisconnect(): void {
      console.log('Disconnected from server');
    }

    function onReceiveMessage(message: SerializedMessage): void {
      setMessages((prev) => [...prev, message]);
    }

    function onUserListUpdate(data: { users: OnlineUser[] }): void {
      setUsers(data.users);
    }

    function onLoadHistory(history: SerializedMessage[]): void {
      setMessages(history);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);
    socket.on('user_list_update', onUserListUpdate);
    socket.on('load_history', onLoadHistory);

    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('user_list_update', onUserListUpdate);
      socket.off('load_history', onLoadHistory);
      socket.disconnect();
    };
  }, [nickname]);

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
