import express from 'express';
import labelController from './label.controller.js';
import protect from '../../middleware/protectedRoutes.js';

const router = express.Router();

router.get('/', labelController.getLabels);
router.put('/editlabel/:id', protect(['admin']), labelController.updateLabels);
router.post('/addlabel', protect(['admin']), labelController.addLabel);

export default router;
