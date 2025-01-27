import express from "express";
import requestController from "./request.controller.js";
import upload from "../../middleware/multerConfig.js";
const router = express.Router();
router.post('/addrequest', upload.single('profilepicture'), requestController.addrequest);
router.get('/', requestController.getAllRequests);
export default router;