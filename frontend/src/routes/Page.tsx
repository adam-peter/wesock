import { useNavigate } from 'react-router';
import { emitSendMessage } from '../lib/socket';
import { useSocketConnection } from '../hooks/useSocketConnection';
import { useMessages } from '../hooks/useMessages';
import { useUsers } from '../hooks/useUsers';
import { ChatLayout } from '../components/ChatLayout';

export default function RootPage() {
  const navigate = useNavigate();
  const nickname = localStorage.getItem('nickname');

  const { messages, clearMessages } = useMessages();
  const users = useUsers();

  useSocketConnection({
    nickname,
    roomId: 'global',
  });

  function handleLogout(): void {
    localStorage.removeItem('nickname');
    clearMessages();
    navigate('/login', { replace: true });
  }

  function handleSendMessage(content: string): void {
    if (!nickname) {
      return;
    }

    emitSendMessage(content, nickname, 'global');
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
