"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const generateOTP = async () => {
    // Generate a random 4-digit OTP
    const otp = crypto_1.default.randomInt(1000, 9999).toString();
    // Hash the OTP using bcrypt
    const saltRounds = 10;
    const hashedOTP = await bcrypt_1.default.hash(otp, saltRounds);
    // Return the OTP (to send to the user) and the hashed OTP (to store in the database)
    return { otp, hashedOTP };
};
const verifyOTP = async (inputOTP, hashedOTP) => {
    // Compare the input OTP with the hashed OTP
    return await bcrypt_1.default.compare(inputOTP, hashedOTP);
};
exports.default = {
    generateOTP,
    verifyOTP
};
