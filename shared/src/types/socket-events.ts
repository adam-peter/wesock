import { z } from 'zod';
import { serializedMessageSchema, sendMessageDtoSchema, type SendMessageDto, type SerializedMessage } from './message';
import { joinRoomDtoSchema, userListUpdateSchema, type JoinRoomDto, type UserListUpdate } from './user';

export { sendMessageDtoSchema, joinRoomDtoSchema };

export const loadHistoryPayloadSchema = z.array(serializedMessageSchema);

export const receiveMessagePayloadSchema = serializedMessageSchema;

export const userListUpdatePayloadSchema = userListUpdateSchema;

export type LoadHistoryPayload = z.output<typeof loadHistoryPayloadSchema>;
export type ReceiveMessagePayload = z.output<typeof receiveMessagePayloadSchema>;
export type UserListUpdatePayload = z.output<typeof userListUpdatePayloadSchema>;

export interface ClientToServerEvents {
  join_room: (data: JoinRoomDto, callback?: (error?: string) => void) => void;
  send_message: (data: SendMessageDto, callback?: (error?: string) => void) => void;
}

export interface ServerToClientEvents {
  user_list_update: (data: UserListUpdate) => void;
  load_history: (messages: SerializedMessage[]) => void;
  receive_message: (message: SerializedMessage) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InterServerEvents {}

export interface SocketData {
  userId?: string;
  nickname?: string;
}
