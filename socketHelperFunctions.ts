import { unregisterCustomQueryHandler } from 'puppeteer';
import { Socket } from 'socket.io';
import Paragraph from './schemas/paragraph';
import Iuser from './interfaces/user.interface';

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
  let isHost: boolean = false;
  if (!gameState[roomId]) {
    const paragraph: string = await getRandomParagraph();
    gameState[roomId] = { users: {}, paragraph: paragraph };
    isHost = true;
  }
  gameState[roomId].users[socketId] = {
    userName: 'Guest',
    color: '',
    isHost: isHost,
    isReady: false,
    gameData: {},
  };
  // const newGameState: Iuser = gameState[roomId].users[socketId]
}

export default {
  getRandomParagraph,
  joinUser,
};
