import { Request, Response } from "express";
import { AuthRequest } from "../types";
import RideModel from "./../models/ride.model";
import UserModel from "./../models/user.model";
import mongoose from "mongoose";
import { haversineDistance } from "../utils/haversineDistance";


/**
 * @desc Create Ride
 * @route POST /api/v1/ride
 * @access Protected
 */

export const createRide = async (req: Request, res: Response) => {
  try {

    const { rider, pickupLocation, pickupCoord, destination, destinationCoord } = req.body;

    if (!rider || !pickupLocation || !pickupCoord || !destination || !destinationCoord) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(rider)) {
      return res.status(400).json({ message: "Invalid rider ID" });
    }


    const ride = new RideModel({
      rider,
      pickupLocation,
      pickupCoord,
      destination,
      destinationCoord,
      status: "pending",
    });

    await ride.save();
    return res.status(201).json({ message: "Ride created successfully", ride });
  } catch (error) {
    return res.status(500).json({ message: "Error creating ride", error });
  }
};

/**
 * @desc Get all available rides
 * @route GET /api/v1/ride
 * @access Protected
 */
//Get all available rides (rides that haven't been accepted yet)
export const getAvailableRides = async (req: AuthRequest, res: Response) => {

  if (req.user?.role !== "rider") {
    return res.status(403).json({ message: "Only riders can view available rides" });
  }

  try {
    const rides = await RideModel.find({ status: "pending" }).populate("rider", "name email");
    return res.status(200).json({ rides });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }

};

/**
 * @desc Accept Ride
 * @route PATCH /api/v1/ride/accept
 * @access Protected
 */
//Driver accepts a ride
export const acceptRide = async (req: AuthRequest, res: Response) => {
  
  const { id } = req.params;

  if (req.user?.role !== "driver") {
    return res.status(403).json({ message: "Only drivers can accept rides" });
  }

  try {
    const ride = await RideModel.findById(id);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }
  
    if (ride.status !== "pending") {
      return res.status(400).json({ message: "This ride has already been accepted" });
    }
  
  const updatedRide = await RideModel.findByIdAndUpdate(id,
      { $set: { status: "accepted", driver: req.user.userId }},
      { new: true } )
  
    return res.json({ message: "Ride accepted successfully", ride: updatedRide });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

/**
 * @desc Accept Ride
 * @route PATCH /api/v1/ride/completes
 * @access Protected
 */
//Driver completes a ride
export const completeRide = async (req: AuthRequest, res: Response) => {
  
  const { id } = req.params;

  if (req.user?.role !== "driver") {
    return res.status(403).json({ message: "Only drivers can complete rides" });
  }

  try {
    const ride = await RideModel.findById(id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status !== "accepted") {
      return res.status(400).json({ message: "Only accepted rides can be completed" });
    }

    ride.status = "completed";
    await ride.save();

    res.json({ message: "Ride completed successfully", ride });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};


/**
 * @desc Match Rider with Driver
 * @route PATCH /api/v1/ride/find-drivers/:riderId/:maxDistance
 * @access Protected
 */
export const findNearbyDrivers = async (req: Request, res: Response) => {

  try {
    const { riderId, maxDistance } = req.params;

    // Fetch the rider's data
    const rider = await UserModel.findById(riderId);

    // Validate that the rider exists
    if (!rider || rider.role !== "rider") {
      return res.status(404).json({ message: "Rider not found" });
    }

    // Validate the rider's location
    if (!rider.location || rider.location.longitude === undefined || rider.location.latitude === undefined) {
      return res.status(400).json({ message: "Rider location is not set" });
    }

    const { longitude, latitude } = rider.location;

    // Convert maxDistance to number (default to 5km if not provided)
    const searchRadius = maxDistance ? parseInt(maxDistance) : 5000;

    // Approximate degree difference for the given search radius
    const degreeDiff = searchRadius / 111000; // 1 degree ≈ 111km

    // Define latitude and longitude boundaries
    const minLongitude = longitude - degreeDiff;
    const maxLongitude = longitude + degreeDiff;
    const minLatitude = latitude - degreeDiff;
    const maxLatitude = latitude + degreeDiff;

    // Find drivers within the bounding box
    const drivers = await UserModel.find({
      role: "driver",
      "location.longitude": { $gte: minLongitude, $lte: maxLongitude },
      "location.latitude": { $gte: minLatitude, $lte: maxLatitude },
    }).select("-password"); // Exclude password

    if (drivers.length === 0) {
      return res.status(404).json({ message: "No nearby drivers found" });
    }

    // Calculate exact distances for each driver
    const driversWithDistance = drivers
      .map((driver) => {
        if (!driver.location || driver.location.longitude === undefined || driver.location.latitude === undefined) {
          return null; // Skip drivers with missing locations
        }

        const distance = haversineDistance(latitude, longitude, driver.location.latitude, driver.location.longitude);

        return {
          ...driver.toObject(),
          distance: Math.round(distance),
        };
      })
      .filter((driver): driver is { distance: number } & typeof driver => driver !== null); // ✅ TypeScript fix

    // Filter only drivers within the exact search radius
    const filteredDrivers = driversWithDistance
    .filter((driver) => driver.distance <= searchRadius)
    .map((driver) => ({
      _id: driver._id,
      distance: (driver.distance / 1000).toFixed(2) + " km",
    }));

    if (filteredDrivers.length === 0) {
      return res.status(404).json({ message: "No drivers within the exact radius" });
    }

    res.status(200).json({ message: "Nearby drivers found", drivers: filteredDrivers });
  } catch (error) {
    res.status(500).json({ message: "Error finding drivers", error });
  }
};
