"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_1 = require("../controller/authentication");
const auth = (0, express_1.Router)();
// Register a new user
auth.post("/login", authentication_1.login);
// Register a new user
auth.post("/register", authentication_1.register);
// Verify OTP
auth.post("/verify", authentication_1.verifyOTP);
// Resend OTP
auth.post("/resend", authentication_1.resendOTP);
exports.default = auth;
