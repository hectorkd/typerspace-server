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
  };
}

function calculateResults(
  endTime: number,
  startTime: string,
  allKeyPresses: number,
  charLength: number,
): IWpmCalculation {
  const { minutes, remainder, time } = calculateTime(endTime, startTime);
  const seconds = remainder < 10 ? `0${remainder}` : remainder;
  const wpm = calculateWpm(charLength, time);
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

function calculateAverageWPM(user: Iuser, WPM: number): any {
  const newWPMHistory = user.WPMHistory;
  newWPMHistory.push(WPM);
  const newAVG =
    newWPMHistory.reduce((total, WPM) => total + WPM) / newWPMHistory.length;
  return { newWPMHistory, newAVG };
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
  //TODO: check if user has name and color to be ready!
  let isReady;
  if (player.availablePUs.length === 0) {
    isReady = true;
  } else {
    isReady = false;
  }
  return isReady;
}

function givePowers(players: number): any {
  const powers = [
    { id: 'scramble', powerUp: 'ScrambleCard' },
    { id: 'longWord', powerUp: 'LongWordCard' },
    { id: 'symbols', powerUp: 'SymbolsCard' },
  ];
  const res = [];
  for (let i = 1; i < players; i++) {
    if (powers.length > 0) {
      const randomPower = Math.floor(Math.random() * powers.length);
      const power = powers.splice(randomPower, 1);
      res.push({ rank: players - i + 1, power: power[0] });
    }
  }
  return res;
}

export default {
  getRandomParagraph,
  joinUser,
  calculateResults,
  calculateAverageWPM,
  getPlayers,
  checkIfReady,
  givePowers,
};
