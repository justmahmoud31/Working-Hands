import express from 'express';
import adsController from './ads.controller.js';
import protect from '../../middleware/protectedRoutes.js';
import { singleFile } from '../../middleware/multerConfig.js';

const router = express.Router();

router.post('/addad', protect(['admin']), singleFile('photos', "ads"), adsController.addAd);
router.put('/editad/:id', protect(['admin']), singleFile('photos', "ads"), adsController.editAd);
router.get('/', adsController.getAds);
router.delete('/deletead/:id',protect(["admin"]), adsController.deleteAd);

export default router;
