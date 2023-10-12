import { Router } from 'express';

import { saveTime, getReadingTime, getWeekDates, getUserScreenTimeData } from '../controllers/timeSwapController';
import requireAuth from '../middleware/requireAuth';

const router = Router();


router.use(requireAuth);

router.get('/user-screen-time-data', getUserScreenTimeData);
router.get('/week-dates', getWeekDates);
router.post('/save-time', saveTime);
router.get('/reading-time', getReadingTime);


export default router;