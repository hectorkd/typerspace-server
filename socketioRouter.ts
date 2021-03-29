import app from './index';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helperFunctions from './socketHelperFunctions';
import IgameState from './interfaces/gameState.interface';
import Iuser from './interfaces/user.interface';

const gameState: IgameState = {};

// console.log('befor the server is created');

const server = createServer(app);
// console.log('inbetween server and io');

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT'],
  },
});

// console.log('You made it here, woooooooo');

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

  socket.on('userInfo', ({ userName, color, rounds }) => {
    const curUser = gameState[`${roomId}`].users[socket.id];
    const isReady = helperFunctions.checkIfReady(curUser);
    const updatedUser = {
      ...curUser,
      userName: userName,
      color: color,
      isReady: isReady,
    };
    gameState[`${roomId}`].users[socket.id] = updatedUser;
    if (curUser.isHost) {
      gameState[`${roomId}`].rounds = parseInt(rounds);
      gameState[`${roomId}`].currRound = 1;
    }
    const usersArray = helperFunctions.getPlayers(gameState, roomId);
    io.to(`${roomId}`).emit('playerInfo', usersArray);
    io.to(`${socket.id}`).emit(
      'getGameState',
      gameState[`${roomId}`].rounds, //test rounds assignment
      gameState[`${roomId}`].currRound,
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
      const usersArray = helperFunctions.getPlayers(gameState, roomId);
      io.to(`${roomId}`).emit('results', usersArray);
    },
  );

  socket.on('getParagraph', async () => {
    const newParagraph = await helperFunctions.getRandomParagraph();
    const newGameState = { ...gameState[`${roomId}`], paragraph: newParagraph };
    gameState[`${roomId}`] = newGameState;
    io.to(`${roomId}`).emit('getParagraph', gameState[`${roomId}`].paragraph);
  });

  socket.on('playAgain', () => {
    const usersInRoom = gameState[`${roomId}`].users;
    for (const user in usersInRoom) {
      //TODO: calculate rank before cleaning gameData
      //TODO: update currRound!
      const newUserInfo: Iuser = {
        ...usersInRoom[user],
        gameData: {
          finishTime: '',
          WPM: undefined,
          accuracy: undefined,
        },
      };
      usersInRoom[user] = newUserInfo;
    }
    const usersArray = helperFunctions.getPlayers(gameState, roomId);
    io.to(`${roomId}`).emit('playerInfo', usersArray);
    socket.to(`${roomId}`).emit('navigateToLobby');
  });

  socket.on('disconnect', () => {
    // if (gameState[`${roomId}`].users[socket.id].isHost) {
    //   io.to(`${roomId}`).emit('hostDisconnect');
    //   socket.leave(`${roomId}`);
    //   delete gameState[`${roomId}`];
    // } else {
    delete gameState[`${roomId}`].users[socket.id];
    socket.leave(`${roomId}`);
    io.to(`${roomId}`).emit('playerDisconnect');
    const usersArray = helperFunctions.getPlayers(gameState, roomId);
    io.to(`${roomId}`).emit('playerInfo', usersArray);
    // }
  });
});

export default server;
