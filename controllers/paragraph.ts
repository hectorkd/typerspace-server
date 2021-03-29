import { Request, Response } from 'express';
import Paragraph from '../schemas/paragraph';
import Sequelize, { Op } from 'sequelize';
import sequelize from '../models';
// const Op = Sequelize.Op;

async function getRandomParagraph(_: Request, res: Response): Promise<void> {
  try {
    const paragraph = await Paragraph.findOne({
      order: sequelize.random(),
      where: {
        characterLengthNumeric: {
          [Op.lt]: 400,
        },
      },
    });
    // console.log(`paragraph`, paragraph?.toJSON());
    res.status(200);
    res.send(`${paragraph?.characterLength}`);
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send("Couldn't get a paragraph");
  }
}

export default {
  getRandomParagraph,
};
