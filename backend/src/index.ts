import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PLACEHOLDER, sendMessageDtoSchema, type SerializedMessage } from 'shared';
import { config } from './config';
import { middlewareErrors } from './middleware/errors';
import { randomUUID } from 'crypto';

const PORT = 3000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.allowedOrigins,
    credentials: true,
  },
  connectionStateRecovery: {},
});

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

  socket.on('send_message', (data: unknown, callback?: (error?: string) => void) => {
    try {
      const dto = sendMessageDtoSchema.parse(data);

      const message: SerializedMessage = {
        id: randomUUID(),
        content: dto.content,
        senderNick: dto.senderNick,
        roomId: dto.roomId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      io.emit('receive_message', message);
      callback?.();
    } catch (err) {
      console.error('Error in send_message handler:', err);
      callback?.(err instanceof Error ? err.message : 'Unknown error');
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
