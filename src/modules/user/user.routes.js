import express from 'express';
import userController from './user.controller.js';
import { singleFile } from '../../middleware/multerConfig.js'; // Import the new Multer helper function
import protect from '../../middleware/protectedRoutes.js';

const router = express.Router();

// Use singleFile to handle single file uploads
router.post('/adduser', singleFile('profilepicture', 'users'), userController.addUser);
router.get('/getusers', protect(['admin']), userController.getAllUsers);
router.get('/getuser/:id', protect(['admin']), userController.getOneUser);
router.get('/getuserscount', protect(['admin']), userController.getUsersCount);
router.get('/getme', protect(['user','admin']), userController.getUsersData);
router.post('/login', userController.loginUser)
export default router;