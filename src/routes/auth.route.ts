import express from "express";
import { signin, signup } from "../controllers/auth.controller";
import { validateSignin, validateSignup } from "../validators";

const router = express.Router();

router.post("/signup", validateSignup, signup);
router.post("/signin", validateSignin, signin);

export default router;
