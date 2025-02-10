import express from "express";
const router = express.Router();
import protect from "../../middleware/protectedRoutes.js";
import editrequestController from "./editrequest.controller.js";
import { singleFile } from "../../middleware/multerConfig.js";
router.post("/addeditrequest", protect(["user", "admin"]), singleFile('profilepicture', "users"), editrequestController.addEditRequest);

// Admin gets all pending requests
router.get("/", protect(["admin", 'subadmin']), editrequestController.getAllEditRequests);
router.get("/editrequestnumber", protect(["admin", 'subadmin']), editrequestController.getEditRequestsCount);

// Admin approves a request
router.put("/accept/:id", protect(["admin", 'subadmin']), editrequestController.acceptEditRequest);

// Admin rejects a request
router.put("/reject/:id", protect(["admin", 'subadmin']), editrequestController.rejectEditRequest);

export default router;
