import { createMessage, getMessages } from '../../db/queries/messages';
import { type Message, type SerializedMessage, MESSAGE_HISTORY_LIMIT } from 'shared';

export async function saveMessage(
  content: string,
  senderNick: string,
  roomId: string,
  isGlobal: boolean
): Promise<Message> {
  return await createMessage(content, senderNick, roomId, isGlobal);
}

export async function loadMessageHistory(
  roomId: string,
  limit: number = MESSAGE_HISTORY_LIMIT
): Promise<Message[]> {
  return await getMessages(roomId, limit);
}

export function serializeMessage(message: Message): SerializedMessage {
  return {
    id: message.id,
    content: message.content,
    senderNick: message.senderNick,
    roomId: message.roomId,
    isGlobal: message.isGlobal,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  };
}

export function serializeMessages(messages: Message[]): SerializedMessage[] {
  return messages.map(serializeMessage);
}
