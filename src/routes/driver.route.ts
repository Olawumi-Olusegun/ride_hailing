import express from "express";
import { authenticateUser, authorizeRole } from "../middlewares/auth.middleware";
import { updateUserLocation } from "../controllers/driver.controller";


const router = express.Router();


router.patch("/location", authenticateUser, authorizeRole(["driver", "rider"]), updateUserLocation);

export default router;
