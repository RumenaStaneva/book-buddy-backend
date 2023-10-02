import { Router } from 'express';
import { loginUser, signUpUser, signUpAdmin, getProfile, updateProfile, verifyUser, forgotPassword, resetPassword, loginWithGoogle, signupWithGoogle } from '../controllers/userController'
import requireAuth from '../middleware/requireAuth';

const router: Router = Router();

router.get('/verify/:token', verifyUser);
router.post('/signup-with-google', signupWithGoogle)
router.post('/login-with-google', loginWithGoogle)
router.post('/login', loginUser);
router.post('/sign-up', signUpUser);
router.post('/sign-up-admin', signUpAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.use(requireAuth);

router.get('/profile', getProfile);
router.patch('/update-profile-info', updateProfile);

export default router;