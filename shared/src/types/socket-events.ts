import { z } from 'zod';
import { serializedMessageSchema } from './message';
import { userListUpdateSchema, joinRoomDtoSchema, sendMessageDtoSchema } from './user';

export const loadHistoryPayloadSchema = z.array(serializedMessageSchema);

export const receiveMessagePayloadSchema = serializedMessageSchema;

export const userListUpdatePayloadSchema = userListUpdateSchema;

export type LoadHistoryPayload = z.output<typeof loadHistoryPayloadSchema>;
export type ReceiveMessagePayload = z.output<typeof receiveMessagePayloadSchema>;
export type UserListUpdatePayload = z.output<typeof userListUpdatePayloadSchema>;

export type JoinRoomDto = z.output<typeof joinRoomDtoSchema>;
export type SendMessageDto = z.output<typeof sendMessageDtoSchema>;
export type UserListUpdate = z.output<typeof userListUpdateSchema>;
export type SerializedMessage = z.output<typeof serializedMessageSchema>;

export interface ClientToServerEvents {
  join_room: (data: JoinRoomDto, callback?: (error?: string) => void) => void;
  send_message: (data: SendMessageDto, callback?: (error?: string) => void) => void;
}

export interface ServerToClientEvents {
  user_list_update: (data: UserListUpdate) => void;
  load_history: (messages: SerializedMessage[]) => void;
  receive_message: (message: SerializedMessage) => void;
}
