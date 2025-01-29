import express from "express";
import requestController from "./request.controller.js";
import { singleFile } from '../../middleware/multerConfig.js'; // Import the new Multer helper function
const router = express.Router();
router.post('/addrequest',singleFile('profilepicture', 'requests'), requestController.addrequest);
router.post('/accept/:id', requestController.acceptUser);
router.post('/reject/:id', requestController.rejectUser);
router.get('/', requestController.getAllRequests);
export default router;