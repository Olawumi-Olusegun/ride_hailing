import { Request, Response } from "express";
import UserModel from "../models/user.model";
import { generateToken } from "../utils/jwt";

/**
 * @desc Signup
 * @route POST /api/v1/auth/signup
 * @access Pulic
 */
export const signup = async (req: Request, res: Response) => {

  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!["rider", "driver"].includes(role)) {
    return res.status(400).json({ message: "Invalid role. Must be a 'rider' or 'driver'" });
  }


  try {
    
      const existingUser = await UserModel.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
    
      const user = new UserModel({ name, email, password, role });
    
      await user.save();
    
      const token = generateToken(user.id, user.role);
      
      return res.status(201).json({ message: "User registered successfully", token });
    
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

/**
 * @desc Signup
 * @route POST /api/v1/auth/signin
 * @access Pulic
 */
export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    
      const isValidPassword = await user.isValidPassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    
      const token = generateToken(user.id, user.role);
      return res.status(200).json({ message: "Login successful", token });
    
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
