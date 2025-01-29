import express from 'express';
import mainController from './main.controller.js';
import { mixedFiles } from '../../middleware/multerConfig.js'; // Import the new Multer helper function
import protect from '../../middleware/protectedRoutes.js';

const router = express.Router();

// Use mixedFiles to handle multiple file uploads
router.post('/addmain', protect(["admin"]), mixedFiles([{ name: 'mainpictures', maxCount: 10 }], 'main'), mainController.addMainContent);
router.put('/:id/details', protect(["admin"]), mixedFiles([{ name: 'mainpictures', maxCount: 10 }], 'main'), mainController.updateMainContentDetails);
router.put('/:id/images/:imageId', protect(["admin"]), mixedFiles([{ name: 'mainpictures', maxCount: 1 }], 'main'), mainController.updateMainContentImages);
router.get('/', mainController.getMainContent);
router.delete('/deletemain/:id', protect(["admin"]), mainController.deleteMainContent);

export default router;