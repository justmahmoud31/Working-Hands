import express from "express";
const router = express.Router();
import protect from "../../middleware/protectedRoutes.js";
import editrequestController from "./editrequest.controller.js";
router.post("/addeditrequest", protect(["user"]),editrequestController.addEditRequest);

// Admin gets all pending requests
router.get("/", protect(["admin"]), editrequestController.getAllEditRequests);

// Admin approves a request
router.put("/accept/:id", protect(["admin"]), editrequestController.acceptEditRequest);

// Admin rejects a request
router.delete("/reject/:id", protect(["admin"]), editrequestController.rejectEditRequest);

export default router;
