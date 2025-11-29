import { type Server, type Socket } from 'socket.io';
import {
  sendMessageDtoSchema,
  receiveMessagePayloadSchema,
  type ClientToServerEvents,
  type ServerToClientEvents,
  type InterServerEvents,
  type SocketData,
} from 'shared';
import { saveMessage, serializeMessage } from '../services/message.service';

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerMessageHandlers(io: TypedServer, socket: TypedSocket): void {
  socket.on('send_message', async (data: unknown, callback?: (error?: string) => void) => {
    await handleSendMessage(io, socket, data, callback);
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

    const dbMessage = await saveMessage(dto.content, dto.senderNick, dto.roomId);

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
