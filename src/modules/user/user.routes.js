import express from 'express';
import upload from '../../middleware/multerConfig.js';
import userController from './user.controller.js';

const router = express.Router();

router.post('/adduser', upload.single('profilepicture'), userController.addUser);
router.get('/getusers', userController.getAllUsers);
export default router;