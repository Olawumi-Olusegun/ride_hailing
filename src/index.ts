import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/database";

// routes
import authRoutes from "./routes/auth.route";
import rideRoutes from "./routes/ride.route";
import driverRoutes from "./routes/driver.route";
import rideHistoryRoutes from "./routes/ride.history.route";

dotenv.config();

const PORT = Number(process.env.PORT || 5150);

const app: Application = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/ride", rideRoutes);
app.use("/api/v1/driver", driverRoutes);
app.use("/api/v1/ride-history", rideHistoryRoutes);


const startApp = async () => {
    try {
        /** Connect to Mongo Database */
        await connectDB();
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        throw new Error('Unable to connect to database...')
    }
}

startApp();