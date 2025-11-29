import { createMessage, getMessages } from '../../db/queries/messages';
import { type Message, type SerializedMessage, type SystemMessage, MESSAGE_HISTORY_LIMIT } from 'shared';
import { randomUUID } from 'crypto';

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
  limit = MESSAGE_HISTORY_LIMIT,
  offset = 0
): Promise<Message[]> {
  return await getMessages(roomId, limit, offset);
}

export function serializeMessage(message: Message): SerializedMessage {
  return {
    id: message.id,
    type: 'user' as const,
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

export function createSystemMessage(content: string, roomId: string): SystemMessage {
  return {
    id: randomUUID(),
    type: 'system' as const,
    content,
    roomId,
    createdAt: new Date().toISOString(),
  };
}
