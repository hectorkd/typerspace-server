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
    io.to(`${roomId}`).emit('startTime', `${raceStartTime}`);
  });

  socket.on('position', ({ currIndex, currChar }) => {
    const currPositions = gameState[`${roomId}`].positions;
    const newPositions = {
      ...currPositions,
      [socket.id]: { currIndex, currChar },
    };
    gameState[`${roomId}`].positions = newPositions;
    socket.to(`${roomId}`).emit('positions', gameState[`${roomId}`].positions);
  });

  socket.on('finishRace', async ({ endTime, correctChar, errorChar }) => {
    console.log('player finished', endTime, correctChar, errorChar);
    //  const results = helperFunction.calculateResults(userInfo)
    //  gameState[roomId].users[socketId].gameData = results;
    //  io.to(`${roomId}`).emit('results', `${gameState[roomId].users}`)
  });
});

export default server;
