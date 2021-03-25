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
    methods: ['GET', 'POST', 'PUT'],
  },
});

io.on('connection', async (socket) => {
  const { roomId } = socket.handshake.query;
  console.log(
    '------------ New ws connection for room',
    roomId,
    ' from ',
    socket.id,
  );
  await helperFunctions.joinUser(`${roomId}`, socket.id, gameState);
  socket.join(`${roomId}`);

  socket.on('userInfo', async ({ userName, color }) => {
    const curUser = gameState[`${roomId}`].users[socket.id];
    const updatedUser = {
      ...curUser,
      userName: userName,
      color: color,
    };
    gameState[`${roomId}`].users[socket.id] = updatedUser;
    const usersArray = [];
    for (const user in gameState[`${roomId}`].users) {
      usersArray.push(gameState[`${roomId}`].users[user]);
    }
    io.to(`${roomId}`).emit('playerInfo', usersArray);
    io.to(`${roomId}`).emit('getParagraph', gameState[`${roomId}`].paragraph);
  });

  socket.on('syncStart', () => {
    const timeNow = Date.now();
    const raceStartTime = timeNow + 5000;
    gameState[`${roomId}`].startTime = raceStartTime;
    io.to(`${roomId}`).emit('startTime', `${timeNow}`);
  });

  socket.on('position', ({ currIndex, currChar }) => {
    const currPositions = gameState[`${roomId}`].positions;
    const newPositions = {
      ...currPositions,
      [socket.id]: { currIndex, currChar },
    };
    gameState[`${roomId}`].positions = newPositions;
  });

  setInterval(() => {
    socket.to(`${roomId}`).emit('positions', gameState[`${roomId}`].positions);
  }, 2000);

  socket.on(
    'finishRace',
    async ({ endTime, startTime, allKeyPresses, length }) => {
      console.log({ endTime, startTime, allKeyPresses, length });
      // console.log('player finished', endTime, correctChar, errorChar, charLength, allKeyPresses);
      const { finishTime, WPM, accuracy } = helperFunctions.calculateResults(
        endTime,
        startTime,
        allKeyPresses,
        length,
      );
      gameState[`${roomId}`].users[socket.id].gameData = {
        finishTime,
        WPM,
        accuracy,
      };
      const usersArray = [];
      for (const user in gameState[`${roomId}`].users) {
        usersArray.push(gameState[`${roomId}`].users[user]);
      }
      io.to(`${roomId}`).emit('results', usersArray);
    },
  );
});

export default server;
