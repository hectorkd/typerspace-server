import { Request, Response } from 'express';
import Paragraph from '../schemas/paragraph';

async function getRandomParagraph(_: Request, res: Response): Promise<void> {
  try {
    const randomNumber = Math.floor(Math.random() * 7191); //TODO: romove hard coded number
    const paragraph = await Paragraph.findOne({
      where: { id: randomNumber },
    }).then((data) => {
      return {
        text: data?.get('text'),
        difficultyRating: data?.get('difficultyRating'),
        characterLength: data?.get('characterLength'),
      };
    });
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
