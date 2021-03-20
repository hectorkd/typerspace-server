import express from 'express';
import dotenv from 'dotenv';
import router from './router';

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT;

app.use(router);

app.listen(PORT, () =>
  console.log(`running at http://localhost:${PORT} 🚀🚀🚀`),
);
