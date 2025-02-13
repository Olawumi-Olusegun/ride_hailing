import express from "express";
import { authenticateUser, authorizeRole } from "../middlewares/auth.middleware";
import { acceptRide, completeRide, createRide, findNearbyDrivers } from "../controllers/ride.controller";


const router = express.Router();

// Riders can create a ride
router.post("/", authenticateUser, authorizeRole(["rider"]), createRide);

// Drivers can accept a ride
router.patch("/:id/accept", authenticateUser, authorizeRole(["driver"]), acceptRide);

// Drivers can complete a ride
router.patch("/:id/complete", authenticateUser, authorizeRole(["driver"]), completeRide);

// Riders can view available rides
router.get("/find-drivers/:riderId/:maxDistance?",  authenticateUser, authorizeRole(["rider"]), findNearbyDrivers);


export default router;
