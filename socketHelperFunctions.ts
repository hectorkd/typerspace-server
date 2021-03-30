// import { unregisterCustomQueryHandler } from 'puppeteer';
// import { Socket } from 'socket.io';
import Paragraph from './schemas/paragraph';
import powerUps from './powerUps';
import IWpmCalculation from './interfaces/calcutaltion.interface';
import gameState from './interfaces/gameState.interface';
import Iuser from './interfaces/user.interface';
// import { time } from 'node:console';
import { time } from 'node:console';
import sequelize from './models';
import { Op } from 'sequelize';

async function getRandomParagraph(): Promise<string | undefined> {
  const paragraph = await Paragraph.findOne({
    order: sequelize.random(),
    where: {
      characterLengthNumeric: {
        [Op.lt]: 400,
      },
    },
  });
  return paragraph?.text;
}

async function joinUser(
  roomId: string,
  socketId: string,
  gameState: any,
): Promise<void> {
  let isHost = false;
  if (!gameState[roomId]) {
    // const paragraph: string | undefined = await getRandomParagraph();
    const paragraph = 'Test paragraph not long not short';
    gameState[roomId] = { users: {}, paragraph: paragraph };
    isHost = true;
  }
  gameState[roomId].users[socketId] = {
    userId: socketId,
    userName: 'Guest',
    color: '',
    isHost: isHost,
    isReady: false,
    gameData: {},
    WPMHistory: [],
    userParagraph: gameState[roomId].paragraph,
    availablePUs: isHost
      ? [{ id: 'scramble', powerUp: 'ScrambleCard' }]
      : [{ id: 'symbols', powerUp: 'SymbolsCard' }],
    appliedPUs: [],
    // availablePUs: {
    //   scrambleWord: false, //TODO: change back to false!
    //   insertLongWord: false,
    //   insertSymbols: false,
    // },
    // appliedPUs: {
    //   scrambleWord: false,
    //   insertLongWord: false,
    //   insertSymbols: false,
    // },
  };
  // const newGameState: Iuser = gameState[roomId].users[socketId]
}

function calculateResults(
  endTime: number,
  startTime: string,
  allKeyPresses: number,
  charLength: number,
): IWpmCalculation {
  const { minutes, remainder, time } = calculateTime(endTime, startTime);
  const seconds = remainder < 10 ? `0${remainder}` : remainder;
  // console.log({ minutes, remainder, time });
  const wpm = calculateWpm(charLength, time);
  // console.log('wpm', wpm);
  const accuracy = calculateAccuracy(allKeyPresses, charLength);
  return { finishTime: `${minutes}:${seconds}`, WPM: wpm, accuracy };
}

function calculateTime(endTime: number, startTime: string) {
  const seconds = Math.round((endTime - parseInt(startTime)) / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  const percentageOfMinute = remainder / 60;
  return { minutes, remainder, time: minutes + percentageOfMinute };
}

function calculateWpm(charLength: number, time: number): number {
  const wpm = Math.round(charLength / 5 / time);
  return wpm;
}

function calculateAccuracy(allKeyPresses: number, charLength: number): number {
  const accuracy = Math.round((charLength / allKeyPresses) * 100);
  return accuracy;
}

function getPlayers(
  gameState: gameState,
  roomId: string | string[] | undefined,
): Iuser[] {
  const usersArray = [];
  for (const user in gameState[`${roomId}`].users) {
    usersArray.push(gameState[`${roomId}`].users[user]);
  }
  return usersArray;
}

function checkIfReady(player: Iuser): boolean {
  let isReady;
  if (player.availablePUs.length === 0) {
    isReady = true;
  } else {
    isReady = false;
  }
  return isReady;
}

export default {
  getRandomParagraph,
  joinUser,
  calculateResults,
  getPlayers,
  checkIfReady,
};
