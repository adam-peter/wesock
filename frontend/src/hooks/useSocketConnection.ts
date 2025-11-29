import { useEffect, useCallback } from 'react';
import { socket } from '../lib/socket';

interface UseSocketConnectionOptions {
  nickname: string | null;
  roomId?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useSocketConnection({
  nickname,
  roomId = 'global',
  onConnect,
  onDisconnect,
}: UseSocketConnectionOptions): void {
  const handleConnect = useCallback((): void => {
    console.log(`Connected with ID: ${socket.id}`);

    if (nickname) {
      socket.emit('join_room', { nick: nickname, roomId }, (error?: string) => {
        if (error) {
          console.error('Failed to join room:', error);
        }
      });
    }

    onConnect?.();
  }, [nickname, roomId, onConnect]);

  const handleDisconnect = useCallback((): void => {
    console.log('Disconnected from server');
    onDisconnect?.();
  }, [onDisconnect]);

  useEffect(() => {
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.disconnect();
    };
  }, [handleConnect, handleDisconnect]);
}
