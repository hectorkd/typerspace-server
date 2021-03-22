import { unregisterCustomQueryHandler } from 'puppeteer';
import { Socket } from 'socket.io';
import Paragraph from './schemas/paragraph';
import Idata from './interfaces/data.interface';

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
  if (!gameState[roomId]) {
    const paragraph: string = await getRandomParagraph();
    gameState[roomId] = { users: [], paragraph: paragraph };
  }
  gameState[roomId].users.contcat({ userId: socketId });
}

export default {
  getRandomParagraph,
  joinUser,
};
