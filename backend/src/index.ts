import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  PLACEHOLDER,
  type ClientToServerEvents,
  type ServerToClientEvents,
  type InterServerEvents,
  type SocketData,
} from 'shared';
import { config } from './config';
import { middlewareErrors } from './middleware/errors';
import './db';
import { setupSocketHandlers } from './socket';
import { startCleanupInterval } from './socket/services/cleanup.service';

const PORT = 3000;
const app = express();
const server = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
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
  res
    .status(200)
    .send({ message: PLACEHOLDER, from: `From: ${config.platform}` });
});

app.use(middlewareErrors);

setupSocketHandlers(io);

startCleanupInterval();

server.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
