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

  socket.join(`${roomId}`);

  await helperFunctions
    .joinUser(`${roomId}`, socket.id, gameState)
    .then(() => {
      const usersArray = helperFunctions.getPlayers(gameState, roomId);
      io.to(`${roomId}`).emit('playerInfo', usersArray);
    })
    .catch((err) => {
      console.error(err);
    });

  socket.on('userInfo', ({ userName, color }) => {
    const curUser = gameState[`${roomId}`].users[socket.id];
    const updatedUser = {
      ...curUser,
      userName: userName,
      color: color,
    };
    gameState[`${roomId}`].users[socket.id] = updatedUser;
    const usersArray = helperFunctions.getPlayers(gameState, roomId);
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
    io.to(`${roomId}`).emit('startTime', `${raceStartTime}`);
  });

  socket.on('position', ({ currIndex }) => {
    const currPositions = gameState[`${roomId}`].positions;
    const color = gameState[`${roomId}`].users[socket.id].color;
    const newPositions = {
      ...currPositions,
      [socket.id]: { currIndex, color },
    };
    gameState[`${roomId}`].positions = newPositions;
  });

  setInterval(() => {
    io.in(`${roomId}`).emit('positions', gameState[`${roomId}`].positions);
  }, 500);

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
  socket.on('disconnect', () => {
    if (gameState[`${roomId}`].users[socket.id].isHost) {
      io.to(`${roomId}`).emit('hostDisconnect');
      socket.leave(`${roomId}`);
      delete gameState[`${roomId}`];
    } else {
      delete gameState[`${roomId}`].users[socket.id];
      socket.leave(`${roomId}`);
      io.to(`${roomId}`).emit('playerDisconnect');
      const usersArray = helperFunctions.getPlayers(gameState, roomId);
      io.to(`${roomId}`).emit('playerInfo', usersArray);
    }
  });
});

export default server;
