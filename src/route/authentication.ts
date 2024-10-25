import { Router } from "express";
import { login, verifyOTP, resendOTP, register } from "../controller/authentication";

const auth = Router();

// Register a new user
auth.post("/login", login);

// Register a new user
auth.post("/register", register);

// Verify OTP
auth.post("/verify", verifyOTP);

// Resend OTP
auth.post("/resend", resendOTP);

export default auth;
