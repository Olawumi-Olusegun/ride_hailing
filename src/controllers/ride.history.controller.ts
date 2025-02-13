import { Response } from "express";
import { AuthRequest } from "../types";
import RideModel from "./../models/ride.model"


// Get ride history (Rider & Driver)
export const getRideHistory = async (req: AuthRequest, res: Response) => {

  const { page = 1, limit = 10 } = req.query;

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const filter = req.user.role === "rider" ? { rider: req.user.userId } : { driver: req.user.userId };

  const rides = await RideModel.find(filter)
    .populate("rider", "name email")
    .populate("driver", "name email")
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const totalRides = await RideModel.countDocuments(filter);

  res.json({
    page: Number(page),
    totalPages: Math.ceil(totalRides / Number(limit)),
    totalRides,
    rides,
  });
};
