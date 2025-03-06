import express from "express";
import codeController from "./code.controller.js";
import protect from "../../middleware/protectedRoutes.js";

const router = express.Router();

router.post("/addcode", protect(["admin"]), codeController.addCode);
router.get("/", protect(["admin"]), codeController.getAllCodes);
router.put("/editcode/:id", protect(["admin"]), codeController.editNumberOfCodes);
router.delete("/deletecode/:id", protect(["admin"]), codeController.deleteCode);
router.post("/acceptrequest/:id", codeController.acceptUserByCode);
router.get('/getonecode/:id', protect(["admin"]), codeController.getOneCode);
export default router;
