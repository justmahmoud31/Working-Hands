import express from 'express';
import mainController from './main.controller.js';
import { mixedFiles } from '../../middleware/multerConfig.js'; // Import the new Multer helper function

const router = express.Router();

// Use mixedFiles to handle multiple file uploads
router.post('/addmain', mixedFiles([{ name: 'mainpictures', maxCount: 10 }], 'main'), mainController.addMainContent);
router.put('/:id/details', mixedFiles([{ name: 'mainpictures', maxCount: 10 }], 'main'), mainController.updateMainContentDetails);
router.put('/:id/images/:imageId', mixedFiles([{ name: 'mainpictures', maxCount: 1 }], 'main'), mainController.updateMainContentImages);

router.get('/', mainController.getMainContent);
router.delete('/deletemain/:id', mainController.deleteMainContent);

export default router;