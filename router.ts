import express from 'express';
import paragraphController from './controllers/paragraph';
const router = express.Router();

router.get('/getParagraph', paragraphController.getRandomParagraph);

export default router;
