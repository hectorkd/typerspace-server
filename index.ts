import express from 'express';
import dotenv from 'dotenv';
import router from './router';
import cors from 'cors';
import server from './socketioRouter';

dotenv.config();
const app = express();

app.use((req, res, next) => {
  console.log(req.url);
  console.log(req.method);
  next();
});
app.use(cors({ origin: '*' }));
app.use(router);

const PORT = process.env.PORT;

app.listen(PORT, () =>
  console.log(`running at http://localhost:${PORT} 🚀🚀🚀`),
);

export default app;
