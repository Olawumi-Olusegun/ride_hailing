import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validateSignup = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isIn(["rider", "driver"]).withMessage("Invalid role. Must be 'rider' or 'driver'"),
];


export const validateSignin = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next(); // Proceed to the next middleware or controller
};
