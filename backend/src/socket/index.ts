import { type Server } from 'socket.io';
import {
  type ClientToServerEvents,
  type ServerToClientEvents,
  type InterServerEvents,
  type SocketData,
} from 'shared';
import { registerMessageHandlers } from './handlers/message.handler';
import { registerRoomHandlers } from './handlers/room.handler';

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function setupSocketHandlers(io: TypedServer): void {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    registerMessageHandlers(io, socket);
    registerRoomHandlers(io, socket);
  });
}
