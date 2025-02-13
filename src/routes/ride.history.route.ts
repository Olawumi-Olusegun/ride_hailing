import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware";
import { getRideHistory } from "../controllers/ride.history.controller";

const router = express.Router();

// Riders & Drivers can view their ride history
router.get("/", authenticateUser, getRideHistory);

export default router;
