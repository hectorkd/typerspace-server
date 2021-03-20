import { Request, Response } from 'express';
import Text from '../schemas/paragraph';

async function getRandomParagraph(_: Request, res: Response): Promise<void> {
  try {
    const randomNumber = Math.floor(Math.random() * 7191);
    const paragraph = await Text.findOne({ where: { id: randomNumber } }).then(
      (data) => {
        return {
          paragraph: data?.get('paragraph'),
          difficultyRating: data?.get('difficultyRating'),
          characterLength: data?.get('characterLength'),
        };
      },
    );
    res.status(200);
    res.send(`${paragraph}`);
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send("Couldn't get a paragraph");
  }
}

export default {
  getRandomParagraph,
};
