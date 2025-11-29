import { useEffect } from 'react';
import { socket } from '../lib/socket';

export function useSocketEvent<T>(event: string, handler: (data: T) => void): void {
  useEffect(() => {
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [event, handler]);
}
