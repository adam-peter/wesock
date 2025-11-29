import express from 'express';
import cors from 'cors';
import { PLACEHOLDER } from 'shared';
import { config } from './config';

const PORT = 3000;
const app = express();

app.get('/healthz', (_req, res) => {
  res.status(200).send({ status: 'ok' });
});

app.use(cors({
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
}));

app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).send({message: PLACEHOLDER, from: `From: ${config.platform}`});
});

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
