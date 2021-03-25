import app from './index';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import helperFunctions from './socketHelperFunctions';
import IgameState from './interfaces/gameState.interface';
import { unregisterCustomQueryHandler } from 'puppeteer';

const gameState: IgameState = {};

console.log('befor the server is created');

const server = createServer(app);
console.log('inbetween server and io');

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT'],
  },
});

console.log('You made it here, woooooooo');

io.on('connection', async (socket) => {
  const { roomId } = socket.handshake.query;
  console.log(
    '------------ New ws connection for room',
    roomId,
    ' from ',
    socket.id,
  );
  await helperFunctions
    .joinUser(`${roomId}`, socket.id, gameState)
    .catch((error) => {
      console.error(error);
    });
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
    io.to(`${socket.id}`).emit(
      'getParagraph',
      gameState[`${roomId}`].paragraph,
    ); // emit paragraph once only to user
  });

  socket.on('syncStart', () => {
    io.to(`${roomId}`).emit('startRace');
    const timeNow = Date.now();
    const raceStartTime = timeNow + 5000;
    gameState[`${roomId}`].startTime = raceStartTime;
    io.to(`${roomId}`).emit('startTime', `${timeNow}`);
  });

  socket.on('position', ({ currIndex }) => {
    const currPositions = gameState[`${roomId}`].positions;
    const newPositions = {
      ...currPositions,
      [socket.id]: currIndex,
    };
    gameState[`${roomId}`].positions = newPositions;
  });

  setInterval(() => {
    io.in(`${roomId}`).emit('positions', gameState[`${roomId}`].positions);
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
