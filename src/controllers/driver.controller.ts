import { Response } from "express";
import { AuthRequest } from "../types";
import UserModel from "./../models/user.model"

export const updateUserLocation = async (req: AuthRequest, res: Response) => {
  try {

    const { longitude, latitude } = req.body;
 
    const userId = req.user?.userId;

    if (longitude === undefined || latitude === undefined) {
      return res.status(400).json({ message: "Longitude and latitude are required" });
    }

    // Find user and update location
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { "location.longitude": longitude, "location.latitude": latitude },
      { new: true, select: "-password" }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Location updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating location", error });
  }
};
  

  