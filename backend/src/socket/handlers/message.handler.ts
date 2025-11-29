import { type Server, type Socket } from 'socket.io';
import {
  DEFAULT_ROOM,
  MESSAGE_HISTORY_LIMIT,
  sendMessageDtoSchema,
  receiveMessagePayloadSchema,
  loadMoreMessagesDtoSchema,
  loadMoreMessagesPayloadSchema,
  type ClientToServerEvents,
  type ServerToClientEvents,
  type InterServerEvents,
  type SocketData,
} from 'shared';
import { saveMessage, serializeMessage, loadMessageHistory, serializeMessages } from '../services/message.service';

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerMessageHandlers(io: TypedServer, socket: TypedSocket): void {
  socket.on('send_message', async (data: unknown, callback?: (error?: string) => void) => {
    await handleSendMessage(io, socket, data, callback);
  });

  socket.on('load_more_messages', async (data: unknown, callback?: (error?: string) => void) => {
    await handleLoadMoreMessages(socket, data, callback);
  });
}

async function handleSendMessage(
  io: TypedServer,
  socket: TypedSocket,
  data: unknown,
  callback?: (error?: string) => void
): Promise<void> {
  try {
    const dto = sendMessageDtoSchema.parse(data);

    const isGlobal = dto.roomId === DEFAULT_ROOM;
    const dbMessage = await saveMessage(dto.content, dto.senderNick, dto.roomId, isGlobal);

    const serializedMessage = serializeMessage(dbMessage);
    const payload = receiveMessagePayloadSchema.parse(serializedMessage);

    io.to(dto.roomId).emit('receive_message', payload);
    callback?.();
  } catch (err) {
    console.error('Error in handleSendMessage:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    callback?.(errorMessage);
  }
}

async function handleLoadMoreMessages(
  socket: TypedSocket,
  data: unknown,
  callback?: (error?: string) => void
): Promise<void> {
  try {
    const dto = loadMoreMessagesDtoSchema.parse(data);
    const limit = dto.limit ?? MESSAGE_HISTORY_LIMIT;

    const dbMessages = await loadMessageHistory(dto.roomId, limit + 1, dto.offset);
    const hasMore = dbMessages.length > limit;
    const messagesToSend = hasMore ? dbMessages.slice(0, limit) : dbMessages;
    const serializedMessages = serializeMessages(messagesToSend);

    const payload = loadMoreMessagesPayloadSchema.parse({
      messages: serializedMessages.reverse(),
      hasMore,
    });

    socket.emit('load_more_messages_response', payload);
    callback?.();
  } catch (err) {
    console.error('Error in handleLoadMoreMessages:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    callback?.(errorMessage);
  }
}
