import express from 'express';
import userController from './user.controller.js';
import { singleFile } from '../../middleware/multerConfig.js'; // Import the new Multer helper function

const router = express.Router();

// Use singleFile to handle single file uploads
router.post('/adduser', singleFile('profilepicture', 'users'), userController.addUser);
router.get('/getusers', userController.getAllUsers);

export default router;