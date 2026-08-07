import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { aiRateLimit } from '../middleware/rateLimit';
import {
  addWord,
  reviewWord,
  getDueWords,
  getMasteryStats,
  toggleFavorite,
} from '../controllers/vocabulary.controller';

const router = Router();

router.use(authMiddleware);
router.use(aiRateLimit);

router.post('/add', addWord);
router.post('/review', reviewWord);
router.get('/due', getDueWords);
router.get('/stats', getMasteryStats);
router.post('/favorite', toggleFavorite);

export default router;
