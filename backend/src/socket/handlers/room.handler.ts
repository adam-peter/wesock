import { type Server, type Socket } from 'socket.io';
import {
  joinRoomDtoSchema,
  userListUpdatePayloadSchema,
  loadHistoryPayloadSchema,
  receiveMessagePayloadSchema,
  type OnlineUser,
  type ClientToServerEvents,
  type ServerToClientEvents,
  type InterServerEvents,
  type SocketData,
} from 'shared';
import {
  addUser,
  removeUser,
  getUsersByRoom,
} from '../../socket/services/user.service';
import {
  loadMessageHistory,
  serializeMessages,
  createSystemMessage,
} from '../../socket/services/message.service';

type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export function registerRoomHandlers(
  io: TypedServer,
  socket: TypedSocket,
): void {
  socket.on(
    'join_room',
    async (data: unknown, callback?: (error?: string) => void) => {
      await handleJoinRoom(io, socket, data, callback);
    },
  );

  socket.on('disconnect', () => {
    handleDisconnect(io, socket);
  });
}

async function handleJoinRoom(
  io: TypedServer,
  socket: TypedSocket,
  data: unknown,
  callback?: (error?: string) => void,
): Promise<void> {
  try {
    const dto = joinRoomDtoSchema.parse(data);

    const user: OnlineUser = {
      id: socket.id,
      nick: dto.nick,
      roomId: dto.roomId,
    };

    addUser(user);
    await socket.join(dto.roomId);

    const roomUsers = getUsersByRoom(dto.roomId);
    const userListPayload = userListUpdatePayloadSchema.parse({
      users: roomUsers,
    });
    io.to(dto.roomId).emit('user_list_update', userListPayload);

    const dbMessages = await loadMessageHistory(dto.roomId);
    const serializedMessages = serializeMessages(dbMessages);
    const historyPayload = loadHistoryPayloadSchema.parse(
      serializedMessages.reverse(),
    );
    socket.emit('load_history', historyPayload);

    const systemMessage = createSystemMessage(`${dto.nick} joined`, dto.roomId);
    const systemMessagePayload =
      receiveMessagePayloadSchema.parse(systemMessage);
    io.to(dto.roomId).emit('receive_message', systemMessagePayload);

    callback?.();
  } catch (err) {
    console.error('Error in handleJoinRoom:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    callback?.(errorMessage);
  }
}

function handleDisconnect(io: TypedServer, socket: TypedSocket): void {
  try {
    console.log(`Client disconnected: ${socket.id}`);

    const user = removeUser(socket.id);
    if (!user) {
      return;
    }

    const roomUsers = getUsersByRoom(user.roomId);
    const userListPayload = userListUpdatePayloadSchema.parse({
      users: roomUsers,
    });
    io.to(user.roomId).emit('user_list_update', userListPayload);

    const systemMessage = createSystemMessage(`${user.nick} left`, user.roomId);
    const systemMessagePayload =
      receiveMessagePayloadSchema.parse(systemMessage);
    io.to(user.roomId).emit('receive_message', systemMessagePayload);
  } catch (err) {
    console.error('Error in handleDisconnect:', err);
  }
}
