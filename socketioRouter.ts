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
    const updatedUser = {
      ...curUser,
      userName: userName,
      color: color,
    };
    const isReady = helperFunctions.checkIfReady(updatedUser);
    updatedUser.isReady = isReady;
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
    //apply power to chosen user and update available power ups for current user
    const curUser = gameState[`${roomId}`].users[socket.id];
    const loser = Object.values(gameState[`${roomId}`].users).filter(
      (user) => user.userName === userName,
    )[0];
    let updatedParagraph = '';
    let newPowerups: any = [];
    if (power === 'scramble') {
      updatedParagraph = powerUps.scrambleWord(loser.userParagraph);
      newPowerups = [
        ...loser.appliedPUs,
        { id: 'scramble', powerUp: 'ScrambleCard' },
      ];
    } else if (power === 'longWord') {
      updatedParagraph = powerUps.insertLongWord(loser.userParagraph);
      newPowerups = [
        ...loser.appliedPUs,
        { id: 'longWord', powerUp: 'LongWordCard' },
      ];
    } else if (power === 'symbols') {
      updatedParagraph = powerUps.insertSymbols(loser.userParagraph);
      newPowerups = [
        ...loser.appliedPUs,
        { id: 'symbols', powerUp: 'SymbolsCard' },
      ];
    }
    const updatedLoser = {
      ...loser,
      userParagraph: updatedParagraph,
      appliedPUs: newPowerups,
    };
    const updatedcurUser = {
      ...curUser,
      availablePUs: [],
      isReady: true,
    };
    gameState[`${roomId}`].users[loser.userId] = updatedLoser;
    gameState[`${roomId}`].users[socket.id] = updatedcurUser;
    const usersArray = helperFunctions.getPlayers(gameState, roomId);
    usersArray.sort((a, b): number => {
      return a.rank - b.rank;
    });
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
      const currUser = gameState[`${roomId}`].users[socket.id];
      //calculate new average wpm for a palyer
      const { newWPMHistory, newAVG } = helperFunctions.calculateAverageWPM(
        currUser,
        WPM,
      );
      const updatedCurUSer = {
        ...currUser,
        WPMHistory: newWPMHistory,
        WPMAverage: newAVG,
        gameData: { finishTime, WPM, accuracy },
      };
      gameState[`${roomId}`].users[socket.id] = updatedCurUSer;
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
    const usersInRoom = gameState[`${roomId}`].users;
    //sort players by average wpm
    let usersArray = helperFunctions.getPlayers(gameState, roomId);
    usersArray.sort((a, b): number => {
      return b.WPMAverage - a.WPMAverage;
    });
    //get new parapraph and update current round
    const newParagraph = await helperFunctions.getRandomParagraph();
    const newGameState = {
      ...gameState[`${roomId}`],
      paragraph: newParagraph,
      currRound:
        gameState[`${roomId}`].currRound + 1 < gameState[`${roomId}`].rounds
          ? gameState[`${roomId}`].currRound + 1
          : gameState[`${roomId}`].rounds,
    };
    gameState[`${roomId}`] = newGameState;
    //update ranks, assign power ups and clean gamedata
    const powers = helperFunctions.givePowers(usersArray.length);
    for (const user in usersInRoom) {
      const newRank = usersArray.findIndex((el) => el.userId === user) + 1;
      const updatedUser: Iuser = {
        ...usersInRoom[user],
        userParagraph: gameState[`${roomId}`].paragraph!,
        rank: newRank,
        appliedPUs: [],
        availablePUs: powers.find((el: { rank: number }) => el.rank === newRank)
          ? [powers.find((el: { rank: number }) => el.rank === newRank).power]
          : [],
        gameData: {
          finishTime: '',
          WPM: undefined,
          accuracy: undefined,
        },
      };
      const isReady = helperFunctions.checkIfReady(updatedUser);
      updatedUser.isReady = isReady;
      usersInRoom[user] = updatedUser;
    }
    //send everyone to lobby
    //send players info
    usersArray = helperFunctions.getPlayers(gameState, roomId);
    //sort by rank
    usersArray.sort((a, b): number => {
      return a.rank - b.rank;
    });
    socket.to(`${roomId}`).emit('navigateToLobby');
    io.to(`${roomId}`).emit('playerInfo', usersArray);
    io.to(`${socket.id}`).emit(
      'getGameState',
      gameState[`${roomId}`].rounds,
      gameState[`${roomId}`].currRound,
    );
  });

  socket.on('playAgain', async () => {
    const newParagraph = await helperFunctions.getRandomParagraph();
    const newGameState = {
      ...gameState[`${roomId}`],
      paragraph: newParagraph,
      currRound: gameState[`${roomId}`].rounds && 1,
    };
    gameState[`${roomId}`] = newGameState;
    const usersInRoom = gameState[`${roomId}`].users;
    for (const user in usersInRoom) {
      const newUserInfo: Iuser = {
        ...usersInRoom[user],
        gameData: {
          finishTime: '',
          WPM: undefined,
          accuracy: undefined,
        },
        appliedPUs: [],
        availablePUs: [],
        WPMHistory: [],
        userParagraph: gameState[`${roomId}`].paragraph!,
      };
      usersInRoom[user] = newUserInfo;
    }
    const usersArray = helperFunctions.getPlayers(gameState, roomId);
    io.to(`${roomId}`).emit('playerInfo', usersArray);
    socket.to(`${roomId}`).emit('navigateToLobby');
    io.to(`${socket.id}`).emit(
      'getGameState',
      gameState[`${roomId}`].rounds,
      gameState[`${roomId}`].currRound,
    );
  });

  socket.on('sendToFinal', () => {
    io.to(`${roomId}`).emit('navigateToFinal');
  });

  socket.on('disconnect', () => {
    delete gameState[`${roomId}`].users[socket.id];
    socket.leave(`${roomId}`);
    io.to(`${roomId}`).emit('playerDisconnect');
    const usersArray = helperFunctions.getPlayers(gameState, roomId);
    io.to(`${roomId}`).emit('playerInfo', usersArray);
  });
});

export default server;
