import { useEffect } from 'react';
import { socket } from '../lib/socket';
import type { ServerToClientEvents } from 'shared';

type ServerToClientEventNames = keyof ServerToClientEvents;
type ServerToClientEventHandler<E extends ServerToClientEventNames> = Parameters<
  ServerToClientEvents[E]
>[0] extends undefined
  ? () => void
  : (data: Parameters<ServerToClientEvents[E]>[0]) => void;

export function useSocketEvent<E extends ServerToClientEventNames>(
  event: E,
  handler: ServerToClientEventHandler<E>
): void {
  useEffect(() => {
    socket.on(event, handler as never);
    return () => {
      socket.off(event, handler as never);
    };
  }, [event, handler]);
}
