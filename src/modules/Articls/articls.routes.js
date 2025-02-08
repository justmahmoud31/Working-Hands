import express from "express";
const router = express.Router();
import articlsController from "./articls.controller.js";
import protect from "../../middleware/protectedRoutes.js";
router.get('/one/:id', articlsController.getOneContent);
router.post('/addcontent', protect(["admin"]), articlsController.addNewContent);
router.put('/editcontent/:id', protect(["admin"]), articlsController.editcontent);
export default router;