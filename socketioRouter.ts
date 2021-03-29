import app from './index';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helperFunctions from './socketHelperFunctions';
import powerUps from './powerUps';
import IgameState from './interfaces/gameState.interface';
import Iuser from './interfaces/user.interface';

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
      gameState[`${roomId}`].rounds,
      gameState[`${roomId}`].currRound,
    );
  });

  socket.on('applyPower', ({ power, userName }) => {
    //TODO: refactor! keep smth in helper function
    //apply power to chosen user and update available power ups for current user
    const curUser = gameState[`${roomId}`].users[socket.id];
    const loser = Object.values(gameState[`${roomId}`].users).filter(
      (user) => user.userName === userName,
    )[0];
    let updatedParagraph = '';
    const appliedPUs = loser.appliedPUs;
    const availablePUs = curUser.availablePUs;
    if (power === 'scramble') {
      updatedParagraph = powerUps.scrambleWord(loser.userParagraph);
      appliedPUs.scrambleWord = true;
      availablePUs.scrambleWord = false;
    } else if (power === 'longWord') {
      updatedParagraph = powerUps.insertLongWord(loser.userParagraph);
      appliedPUs.insertLongWord = true;
      availablePUs.insertLongWord = false;
    } else if (power === 'symbols') {
      updatedParagraph = powerUps.insertSymbols(loser.userParagraph);
      appliedPUs.insertSymbols = true;
      availablePUs.insertSymbols = false;
    }
    const updatedLoser = {
      ...loser,
      userParagraph: updatedParagraph,
      appliedPUs: appliedPUs,
    };
    const isReady = helperFunctions.checkIfReady(curUser);
    const updatedcurUser = {
      ...curUser,
      availableUPs: availablePUs,
      isReady: isReady,
    };
    gameState[`${roomId}`].users[loser.userId] = updatedLoser;
    gameState[`${roomId}`].users[socket.id] = updatedcurUser;
    const usersArray = helperFunctions.getPlayers(gameState, roomId);
    io.to(`${roomId}`).emit('playerInfo', usersArray);
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
      io.to(`${socket.id}`).emit(
        'getGameState',
        gameState[`${roomId}`].rounds,
        gameState[`${roomId}`].currRound,
      );
    },
  );

  socket.on('nextRound', async () => {
    //calculate new average wpm for every player
    const usersInRoom = gameState[`${roomId}`].users;
    for (const user in usersInRoom) {
      const newWPMHistory = usersInRoom[user].WPMHistory;
      newWPMHistory.push(usersInRoom[user].gameData.WPM!);
      const newAVG =
        newWPMHistory.reduce((total, WPM) => total + WPM) /
        newWPMHistory.length;
      const updatedUser = {
        ...usersInRoom[user],
        WPMHistory: newWPMHistory,
        WPMAverage: newAVG,
      };
      usersInRoom[user] = updatedUser;
    }
    //sort players by average wpm
    const usersArray = helperFunctions.getPlayers(gameState, roomId);
    usersArray.sort((a, b): number => {
      return b.WPMAverage - a.WPMAverage;
    });
    //get new parapraph
    //update currRound
    const newParagraph = await helperFunctions.getRandomParagraph();
    const newGameState = {
      ...gameState[`${roomId}`],
      paragraph: newParagraph,
      currRound: gameState[`${roomId}`].currRound + 1,
    };
    gameState[`${roomId}`] = newGameState;
    //update ranks
    //clean gamedata
    for (const user in usersInRoom) {
      const newRank = usersArray.findIndex((el) => el.userId === user) + 1;
      console.log(newRank);
      const updatedUser: Iuser = {
        ...usersInRoom[user],
        userParagraph: gameState[`${roomId}`].paragraph!,
        rank: newRank,
        gameData: {
          finishTime: '',
          WPM: undefined,
          accuracy: undefined,
        },
      };
      usersInRoom[user] = updatedUser;
    }
    console.log(usersInRoom);
    //send everyone to lobby
    //send players info
    io.to(`${roomId}`).emit('playerInfo', usersArray);
    socket.to(`${roomId}`).emit('navigateToLobby');
    io.to(`${socket.id}`).emit(
      'getGameState',
      gameState[`${roomId}`].rounds,
      gameState[`${roomId}`].currRound,
    );
  });

  socket.on('getParagraph', async () => {
    const newParagraph = await helperFunctions.getRandomParagraph();
    const newGameState = { ...gameState[`${roomId}`], paragraph: newParagraph };
    gameState[`${roomId}`] = newGameState;
    io.to(`${roomId}`).emit('getParagraph', gameState[`${roomId}`].paragraph);
  });

  socket.on('playAgain', () => {
    const usersInRoom = gameState[`${roomId}`].users;
    for (const user in usersInRoom) {
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
