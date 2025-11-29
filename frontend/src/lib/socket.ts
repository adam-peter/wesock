import { io } from 'socket.io-client';
import { config } from '../config';

export const socket = io(config.apiBaseUrl, {
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});
