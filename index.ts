import express from 'express';
import dotenv from 'dotenv';
import router from './router';
import cors from 'cors';
import server from './socketioRouter';

dotenv.config();
const app = express();

app.use((req, res, next) => {
  console.log('req.url', req.url);
  console.log('req.method', req.method);
  next();
});
app.use(cors({ origin: '*' }));
app.use(router);

const PORT = process.env.PORT;

server.listen(PORT, () =>
  console.log(`running at http://localhost:${PORT} 🚀🚀🚀`),
);

export default app;
