import express from 'express';
import { PLACEHOLDER } from 'shared';
import { config } from './config';

const PORT = 3000;
const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).send({message: PLACEHOLDER, from: `From: ${config.platform}`});
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
