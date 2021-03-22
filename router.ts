import express, { Request, Response } from 'express';
import paragraphController from './controllers/paragraph';
const router = express.Router();

router.get('/get_paragraph', paragraphController.getRandomParagraph);
router.get('/', (req, res) => {
  res.send('Hector the bad boi');
});

export default router;
