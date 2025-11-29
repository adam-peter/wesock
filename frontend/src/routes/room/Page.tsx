import { useNavigate, useParams } from 'react-router';
import { emitSendMessage } from '../../lib/socket';
import { useSocketConnection } from '../../hooks/useSocketConnection';
import { useMessages } from '../../hooks/useMessages';
import { useUsers } from '../../hooks/useUsers';
import { ChatLayout } from '../../components/ChatLayout';

export default function RoomPage() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const nickname = localStorage.getItem('nickname');

  const currentRoomId = roomId || 'global';

  const { messages, clearMessages, loadMoreMessages } = useMessages();
  const users = useUsers();

  useSocketConnection({
    nickname,
    roomId: currentRoomId,
  });

  function handleLogout(): void {
    localStorage.removeItem('nickname');
    clearMessages();
    navigate('/', { replace: true });
  }

  function handleSendMessage(content: string): void {
    if (!nickname) {
      return;
    }

    emitSendMessage(content, nickname, currentRoomId);
  }

  return (
    <ChatLayout
      nickname={nickname!}
      roomId={currentRoomId}
      messages={messages}
      users={users}
      onSendMessage={handleSendMessage}
      onLogout={handleLogout}
      onLoadMore={loadMoreMessages}
    />
  );
}
