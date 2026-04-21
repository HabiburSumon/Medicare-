import { Router } from 'express';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favorite.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('patient'), getFavorites);
router.post('/', authenticate, authorize('patient'), addFavorite);
router.delete('/:doctorId', authenticate, authorize('patient'), removeFavorite);

export default router;