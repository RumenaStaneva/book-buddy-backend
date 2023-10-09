import { Router } from 'express';
import { loginUser, signUpUser, signUpAdmin, getProfile, updateProfile, verifyUser, forgotPassword, resetPassword, uploadProfilePicture, loginWithGoogle, signupWithGoogle } from '../controllers/userController'
import requireAuth from '../middleware/requireAuth';

import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB 
        fieldSize: 10 * 1024 * 1024, // 10 MB
    },
});

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
// router.post('/update-profile', handleProfilePictureUpload, updateProfile);
router.post('/upload-profile-picture', upload.single('profilePicture'), uploadProfilePicture);

export default router;