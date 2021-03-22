import express from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import router from './router';

dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {});

io.on('connection', (socket) => {
  console.log('yeaaaaaaaaaaaaah boi');

  socket.on('joinRace', () => {});
  socket.on('raceText', () => {});
  socket.on('leaveRace', () => {});
});

app.use(router);

const PORT = process.env.SERVER_PORT;

server.listen(PORT, () =>
  console.log(`running at http://localhost:${PORT} 🚀🚀🚀`),
);
