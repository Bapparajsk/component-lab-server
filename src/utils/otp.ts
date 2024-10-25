import bcrypt from "bcrypt";
import crypto from "crypto";

const generateOTP  = async () => {
    // Generate a random 4-digit OTP
    const otp = crypto.randomInt(1000, 9999).toString();

    // Hash the OTP using bcrypt
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);

    // Return the OTP (to send to the user) and the hashed OTP (to store in the database)
    return { otp, hashedOTP };
};

const verifyOTP = async (inputOTP: string, hashedOTP: string) => {
    // Compare the input OTP with the hashed OTP
    return await bcrypt.compare(inputOTP, hashedOTP);
};

export default {
    generateOTP,
    verifyOTP
};
