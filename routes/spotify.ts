import { Router } from 'express';
import { getSpotifyToken } from '../controllers/spotifyController';

const router = Router();

router.post('/access-token', getSpotifyToken);

export default router;