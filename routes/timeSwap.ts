import { Router } from 'express';

import { saveTime, getCurrentWeekDates, getUserScreenTimeData, getReadingTime, hasReadingTimeAnytime, updateReadingTimeForToday } from '../controllers/timeSwapController';
import requireAuth from '../middleware/requireAuth';

const router = Router();


router.use(requireAuth);

router.get('/user-screen-time-data', getUserScreenTimeData);
router.get('/week-dates', getCurrentWeekDates);
router.post('/save-time', saveTime);
router.get('/reading-time', getReadingTime);
router.get('/reading-time-anytime', hasReadingTimeAnytime);
router.put('/update-reading-time', updateReadingTimeForToday);

export default router;