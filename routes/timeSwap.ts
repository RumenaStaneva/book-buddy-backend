import { Router } from 'express';

import { saveTime, getReadingTiime, getWeekDates } from '../controllers/timeSwapController';
import requireAuth from '../middleware/requireAuth';

const router = Router();


router.use(requireAuth);

router.get('/week-dates', getWeekDates);
router.post('/save-time', saveTime);
router.get('/reading-time', getReadingTiime);


export default router;