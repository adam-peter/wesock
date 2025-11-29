import { z } from 'zod';
import { anySerializedMessageSchema, sendMessageDtoSchema, type SendMessageDto, type AnySerializedMessage } from './message';
import { joinRoomDtoSchema, userListUpdateSchema, type JoinRoomDto, type UserListUpdate } from './user';

export { sendMessageDtoSchema, joinRoomDtoSchema };

export const loadHistoryPayloadSchema = z.array(anySerializedMessageSchema);

export const receiveMessagePayloadSchema = anySerializedMessageSchema;

export const userListUpdatePayloadSchema = userListUpdateSchema;

export const loadMoreMessagesDtoSchema = z
  .object({
    roomId: z.string(),
    offset: z.number().int().min(0),
    limit: z.number().int().min(1).max(100).optional(),
  })
  .strict();

export const loadMoreMessagesPayloadSchema = z.object({
  messages: z.array(anySerializedMessageSchema),
  hasMore: z.boolean(),
});

export type LoadHistoryPayload = z.output<typeof loadHistoryPayloadSchema>;
export type ReceiveMessagePayload = z.output<typeof receiveMessagePayloadSchema>;
export type UserListUpdatePayload = z.output<typeof userListUpdatePayloadSchema>;
export type LoadMoreMessagesDto = z.input<typeof loadMoreMessagesDtoSchema>;
export type LoadMoreMessagesPayload = z.output<typeof loadMoreMessagesPayloadSchema>;

export interface ClientToServerEvents {
  join_room: (data: JoinRoomDto, callback?: (error?: string) => void) => void;
  send_message: (data: SendMessageDto, callback?: (error?: string) => void) => void;
  load_more_messages: (data: LoadMoreMessagesDto, callback?: (error?: string) => void) => void;
}

export interface ServerToClientEvents {
  user_list_update: (data: UserListUpdate) => void;
  load_history: (messages: AnySerializedMessage[]) => void;
  receive_message: (message: AnySerializedMessage) => void;
  load_more_messages_response: (data: LoadMoreMessagesPayload) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InterServerEvents {}

export interface SocketData {
  userId?: string;
  nickname?: string;
}
