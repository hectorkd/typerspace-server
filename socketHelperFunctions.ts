import { unregisterCustomQueryHandler } from 'puppeteer';
import { Socket } from 'socket.io';
import Paragraph from './schemas/paragraph';
import IWpmCalculation from './interfaces/calcutaltion.interface';
import Iuser from './interfaces/user.interface';
import { time } from 'node:console';

async function getRandomParagraph(): Promise<string> {
  const randomNumber: number = Math.floor(Math.random() * 7191); //TODO: romove hard coded number
  const paragraph: any = await Paragraph.findOne({
    //TODO: fix any
    where: { id: randomNumber },
  }).then((data) => {
    return data?.get('text');
  });
  return paragraph;
}

async function joinUser(
  roomId: string,
  socketId: string,
  gameState: any,
): Promise<void> {
  let isHost = false;
  if (!gameState[roomId]) {
    const paragraph: string = await getRandomParagraph();
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

export default {
  getRandomParagraph,
  joinUser,
  calculateResults,
};
