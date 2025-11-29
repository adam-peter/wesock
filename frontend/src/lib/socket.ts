import { io } from 'socket.io-client';
import { config } from '../config';

export const socket = io(config.apiBaseUrl, {
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

export function emitSendMessage(
  content: string,
  senderNick: string,
  roomId: string = 'global'
): void {
  socket.emit('send_message', {
    content,
    senderNick,
    roomId,
  });
}

export function emitJoinRoom(
  nick: string,
  roomId: string = 'global',
  callback?: (error?: string) => void
): void {
  socket.emit('join_room', { nick, roomId }, callback);
}
