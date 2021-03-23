import app from './index';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import helperFunctions from './socketHelperFunctions';
import IgameState from './interfaces/gameState.interface';
import { unregisterCustomQueryHandler } from 'puppeteer';

const gameState: IgameState = {};

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  const { roomId, isHost } = socket.handshake.query;
  console.log('------------', roomId);
  socket.on('Join race', async () => {
    await helperFunctions.joinUser(`${roomId}`, socket.id, gameState);
    socket.join(`${roomId}`);
  });

  socket.on('userInfo', async ({ userInfo }) => {
    const user = gameState[`${roomId}`].users[socket.id];
    const updatedUser = {
      ...user,
      userName: userInfo.userName,
      color: userInfo.color,
    };
    gameState[`${roomId}`].users[socket.id] = updatedUser;
    io.to(`${roomId}`).emit('playerInfo', gameState[`${roomId}`]);
  });

  socket.on('Get paragraph', async () => {
    const result = gameState[`${roomId}`];
    io.to(`${roomId}`).emit(`${result.paragraph}`);
  });

  socket.on('Sync start', () => {
    const timeNow = Date.now();
    const raceStartTime = timeNow + 5000;
    gameState[`${roomId}`].startTime = raceStartTime;
    io.to(`${roomId}`).emit('startTime', `${raceStartTime}`);
  });

  socket.on('Finish race', async ({ userInfo }) => {
    // const results = helperFunction.calculateResults(userInfo)
    // gameState[roomId].users[socketId].gameData = results;
    // io.to(`${roomId}`).emit('results', `${gameState[roomId].users}`)
  });
});

export default server;
