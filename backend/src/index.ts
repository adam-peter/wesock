import express from 'express';

const PORT = 3000;
const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).send({message: 'hello world!'});
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
