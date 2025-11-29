import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  PLACEHOLDER,
  sendMessageDtoSchema,
  joinRoomDtoSchema,
  userListUpdatePayloadSchema,
  loadHistoryPayloadSchema,
  receiveMessagePayloadSchema,
  MESSAGE_TTL_HOURS,
  type SerializedMessage,
  type OnlineUser,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from 'shared';
import { config } from './config';
import { middlewareErrors } from './middleware/errors';
import './db';
import { createMessage, getMessages, deleteOldMessages } from './db/queries/messages';

const PORT = 3000;
const app = express();
const server = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: config.allowedOrigins,
    credentials: true,
  },
  connectionStateRecovery: {},
});

const onlineUsers: OnlineUser[] = [];

app.use((req, res, next) => {
  if (req.path === '/healthz') {
    return next();
  }

  cors({
    origin: (origin, callback) => {
      if (!origin) {
        console.log('CORS blocked: request with no origin');
        callback(new Error('Not allowed by CORS'));
        return;
      }

      if (config.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })(req, res, next);
});

app.use(express.json());

app.get('/healthz', (_req, res) => {
  res.status(200).send({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.status(200).send({message: PLACEHOLDER, from: `From: ${config.platform}`});
});

app.use(middlewareErrors);

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join_room', async (data: unknown, callback?: (error?: string) => void) => {
    try {
      const dto = joinRoomDtoSchema.parse(data);

      const user: OnlineUser = {
        id: socket.id,
        nick: dto.nick,
        roomId: dto.roomId,
      };

      onlineUsers.push(user);
      await socket.join(dto.roomId);

      const userListPayload = userListUpdatePayloadSchema.parse({
        users: onlineUsers.filter(u => u.roomId === dto.roomId)
      });
      io.to(dto.roomId).emit('user_list_update', userListPayload);

      const dbMessages = await getMessages();
      const serializedMessages: SerializedMessage[] = dbMessages.map(msg => ({
        id: msg.id,
        content: msg.content,
        senderNick: msg.senderNick,
        roomId: msg.roomId,
        createdAt: msg.createdAt.toISOString(),
        updatedAt: msg.updatedAt.toISOString(),
      }));
      const loadHistoryPayload = loadHistoryPayloadSchema.parse(serializedMessages.reverse());
      socket.emit('load_history', loadHistoryPayload);

      callback?.();
    } catch (err) {
      console.error('Error in join_room handler:', err);
      callback?.(err instanceof Error ? err.message : 'Unknown error');
    }
  });

  socket.on('send_message', async (data: unknown, callback?: (error?: string) => void) => {
    try {
      const dto = sendMessageDtoSchema.parse(data);

      const dbMessage = await createMessage(dto.content, dto.senderNick, dto.roomId);

      const message: SerializedMessage = {
        id: dbMessage.id,
        content: dbMessage.content,
        senderNick: dbMessage.senderNick,
        roomId: dbMessage.roomId,
        createdAt: dbMessage.createdAt.toISOString(),
        updatedAt: dbMessage.updatedAt.toISOString(),
      };

      const receiveMessagePayload = receiveMessagePayloadSchema.parse(message);
      io.to(dto.roomId).emit('receive_message', receiveMessagePayload);
      callback?.();
    } catch (err) {
      console.error('Error in send_message handler:', err);
      callback?.(err instanceof Error ? err.message : 'Unknown error');
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);

    const userIndex = onlineUsers.findIndex(u => u.id === socket.id);
    if (userIndex !== -1) {
      const user = onlineUsers[userIndex];
      onlineUsers.splice(userIndex, 1);
      const userListPayload = userListUpdatePayloadSchema.parse({
        users: onlineUsers.filter(u => u.roomId === user.roomId)
      });
      io.to(user.roomId).emit('user_list_update', userListPayload);
    }
  });
});

setInterval(() => {
  void (async (): Promise<void> => {
    const cutoffDate = new Date(Date.now() - MESSAGE_TTL_HOURS * 60 * 60 * 1000);
    await deleteOldMessages(cutoffDate);
    console.log(`Cleaned up messages older than ${MESSAGE_TTL_HOURS} hours`);
  })();
}, 1000 * 60 * 60);

server.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
