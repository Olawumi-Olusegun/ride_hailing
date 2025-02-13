import { Schema, model, Document, Types } from "mongoose";

export interface Ride extends Document {
  rider: Types.ObjectId;
  driver?: Types.ObjectId;
  pickupLocation: string;
  pickupCoord: { longitude: number; latitude: number };
  destination: string;
  destinationCoord: { longitude: number; latitude: number };
  status: "pending" | "accepted" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const RideSchema = new Schema<Ride>(
  {
    rider: { type: Schema.Types.ObjectId, ref: "User", required: true },
    driver: { type: Schema.Types.ObjectId, ref: "User" },
    pickupLocation: { type: String, required: true },
    pickupCoord: {
      longitude: { type: Number, required: true },
      latitude: { type: Number, required: true },
    },
    destination: { type: String, required: true },
    destinationCoord: {
      longitude: { type: Number, required: true },
      latitude: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed"],
      default: "pending",
    },
  }, { timestamps: true });

export default model<Ride>("Ride", RideSchema);

