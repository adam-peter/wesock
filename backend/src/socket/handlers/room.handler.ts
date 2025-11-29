import { type Server, type Socket } from 'socket.io';
import {
  joinRoomDtoSchema,
  userListUpdatePayloadSchema,
  loadHistoryPayloadSchema,
  type OnlineUser,
  type ClientToServerEvents,
  type ServerToClientEvents,
  type InterServerEvents,
  type SocketData,
} from 'shared';
import { addUser, removeUser, getUsersByRoom } from '../services/user.service';
import { loadMessageHistory, serializeMessages } from '../services/message.service';

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerRoomHandlers(io: TypedServer, socket: TypedSocket): void {
  socket.on('join_room', async (data: unknown, callback?: (error?: string) => void) => {
    await handleJoinRoom(io, socket, data, callback);
  });

  socket.on('disconnect', () => {
    handleDisconnect(io, socket);
  });
}

async function handleJoinRoom(
  io: TypedServer,
  socket: TypedSocket,
  data: unknown,
  callback?: (error?: string) => void
): Promise<void> {
  try {
    const parseResult = joinRoomDtoSchema.safeParse(data);

    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message ?? 'Validation failed';
      console.error('Validation error in join_room:', parseResult.error);
      callback?.(errorMessage);
      return;
    }

    const dto = parseResult.data;

    const user: OnlineUser = {
      id: socket.id,
      nick: dto.nick,
      roomId: dto.roomId,
    };

    addUser(user);
    await socket.join(dto.roomId);

    const roomUsers = getUsersByRoom(dto.roomId);
    const userListPayloadResult = userListUpdatePayloadSchema.safeParse({
      users: roomUsers,
    });

    if (userListPayloadResult.success) {
      io.to(dto.roomId).emit('user_list_update', userListPayloadResult.data);
    } else {
      console.error('User list payload validation error:', userListPayloadResult.error);
    }

    const dbMessages = await loadMessageHistory(dto.roomId);
    const serializedMessages = serializeMessages(dbMessages);

    const historyPayloadResult = loadHistoryPayloadSchema.safeParse(serializedMessages.reverse());

    if (historyPayloadResult.success) {
      socket.emit('load_history', historyPayloadResult.data);
    } else {
      console.error('History payload validation error:', historyPayloadResult.error);
    }

    callback?.();
  } catch (err) {
    console.error('Error in handleJoinRoom:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    callback?.(errorMessage);
  }
}

function handleDisconnect(io: TypedServer, socket: TypedSocket): void {
  console.log(`Client disconnected: ${socket.id}`);

  const user = removeUser(socket.id);
  if (!user) {
    return;
  }

  const roomUsers = getUsersByRoom(user.roomId);
  const userListPayloadResult = userListUpdatePayloadSchema.safeParse({
    users: roomUsers,
  });

  if (userListPayloadResult.success) {
    io.to(user.roomId).emit('user_list_update', userListPayloadResult.data);
  } else {
    console.error('User list payload validation error:', userListPayloadResult.error);
  }
}
