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
    const parseResult = sendMessageDtoSchema.safeParse(data);

    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message ?? 'Validation failed';
      console.error('Validation error in send_message:', parseResult.error);
      callback?.(errorMessage);
      return;
    }

    const dto = parseResult.data;

    const isGlobal = dto.roomId === DEFAULT_ROOM;
    const dbMessage = await saveMessage(dto.content, dto.senderNick, dto.roomId, isGlobal);

    const serializedMessage = serializeMessage(dbMessage);

    const payloadResult = receiveMessagePayloadSchema.safeParse(serializedMessage);

    if (!payloadResult.success) {
      console.error('Payload validation error:', payloadResult.error);
      callback?.('Failed to process message');
      return;
    }

    io.to(dto.roomId).emit('receive_message', payloadResult.data);
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
    const parseResult = loadMoreMessagesDtoSchema.safeParse(data);

    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message ?? 'Validation failed';
      console.error('Validation error in load_more_messages:', parseResult.error);
      callback?.(errorMessage);
      return;
    }

    const dto = parseResult.data;
    const limit = dto.limit ?? MESSAGE_HISTORY_LIMIT;

    const dbMessages = await loadMessageHistory(dto.roomId, limit + 1, dto.offset);
    const hasMore = dbMessages.length > limit;
    const messagesToSend = hasMore ? dbMessages.slice(0, limit) : dbMessages;
    const serializedMessages = serializeMessages(messagesToSend);

    const payloadResult = loadMoreMessagesPayloadSchema.safeParse({
      messages: serializedMessages.reverse(),
      hasMore,
    });

    if (!payloadResult.success) {
      console.error('Payload validation error:', payloadResult.error);
      callback?.('Failed to load messages');
      return;
    }

    socket.emit('load_more_messages_response', payloadResult.data);
    callback?.();
  } catch (err) {
    console.error('Error in handleLoadMoreMessages:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    callback?.(errorMessage);
  }
}
