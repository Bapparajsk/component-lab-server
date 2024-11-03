"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.resendOtp = exports.updateEmail = exports.userUpdate = void 0;
const utils_1 = require("../../utils");
const user_1 = require("../../helper/user");
const bullmqProducer_1 = require("../../lib/bullmqProducer");
const config_1 = require("../../config");
const userUpdate = async (req, res) => {
    try {
        const env = req.query.env;
        // Check if the env is valid
        if (!["password", "displayName", "gender", "description", "links", "language"].includes(env)) {
            (0, utils_1.sendError)(res, { message: "invalid env", name: "client", errors: ["invalid env"] });
            return;
        }
        const user = req.User;
        if (!user) {
            (0, utils_1.sendError)(res, { message: "invalid token", name: "client", errors: ["invalid token"] });
            return;
        }
        // update user details based on the env provided
        const [error, isValid] = await (0, user_1.updateUserDetails)({ env, body: req.body, id: user.id });
        if (error || !isValid) {
            (0, utils_1.sendError)(res, { message: error, name: "client", errors: [error] });
            return;
        }
        // Send success response
        (0, utils_1.sendSuccess)(res, { message: "update successful" });
        return;
    }
    catch (e) {
        console.error(e);
        (0, utils_1.sendError)(res, { message: "server error", errors: ["internal server error"] });
    }
};
exports.userUpdate = userUpdate;
const updateEmail = async (req, res) => {
    try {
        const { email } = req.body;
        // Check if email is provided
        if (!email) {
            (0, utils_1.sendError)(res, { message: "email is required", name: "client", errors: ["email is required"] });
            return;
        }
        const user = req.User;
        if (!user) {
            (0, utils_1.sendError)(res, { message: "invalid token", name: "client", errors: ["invalid token"] });
            return;
        }
        // fetch user data from cache or database
        const [error, userData] = await (0, user_1.fetchUser)(user.id);
        if (error || !userData) {
            (0, utils_1.sendError)(res, { message: error, name: "client", errors: [error] });
            return;
        }
        // Generate OTP and create a token for the user email
        const { otp, hashedOTP } = await utils_1.OTP.generateOTP();
        const token = utils_1.jwt.create({ email, hashedOTP }, { expiresIn: "5m", algorithm: "HS256" });
        (0, utils_1.sendSuccess)(res, { message: "OTP sent to email", data: { token } });
        // Send OTP to the user email
        (0, bullmqProducer_1.sendOtpQueue)({ email, otp }).catch(console.error);
        return;
    }
    catch (e) {
        console.error(e);
        (0, utils_1.sendError)(res, { message: "server error", errors: ["internal server error"] });
    }
};
exports.updateEmail = updateEmail;
const resendOtp = async (req, res) => {
    try {
        const { token } = req.body;
        // Check if token is provided
        if (!token) {
            (0, utils_1.sendError)(res, { message: "token is required", name: "client", errors: ["token is required"] });
            return;
        }
        // Check if the token is expired
        const [error, userData] = await verifyTokenAndGetUser(token, req.User);
        if (error || !userData) {
            (0, utils_1.sendError)(res, { message: error, name: "client", errors: [error] });
            return;
        }
        // Generate OTP and create a token for the user email
        const { otp, hashedOTP } = await utils_1.OTP.generateOTP();
        const newToken = utils_1.jwt.create({ email: userData.email, hashedOTP }, { expiresIn: "5m", algorithm: "HS256" });
        (0, utils_1.sendSuccess)(res, { message: "OTP sent to email", data: { newToken } });
        // Send OTP to the user email
        (0, bullmqProducer_1.sendOtpQueue)({ email: userData.email, otp }).catch(console.error);
        config_1.redis.set(`reject:${token}`, "true", "EX", 300).catch(console.error);
        return;
    }
    catch (e) {
        console.error(e);
        (0, utils_1.sendError)(res, { message: "server error", errors: ["internal server error"] });
    }
};
exports.resendOtp = resendOtp;
const verifyEmail = async (req, res) => {
    try {
        const { otp, token } = req.body;
        // Check if otp and token is provided
        if (!otp || !token) {
            (0, utils_1.sendError)(res, { message: "invalid body contain", name: "client", errors: ["otp and token is required"] });
            return;
        }
        const [error, userData] = await verifyTokenAndGetUser(token, req.User);
        if (error || !userData) {
            (0, utils_1.sendError)(res, { message: error, name: "client", errors: [error] });
            return;
        }
        // Verify the OTP
        const { email, hashedOTP } = utils_1.jwt.verify(token);
        const isValidOTP = await utils_1.OTP.verifyOTP(otp, hashedOTP);
        if (!isValidOTP) {
            (0, utils_1.sendError)(res, { message: "invalid otp", name: "client", errors: ["invalid otp"] });
            return;
        }
        // * Send success response
        (0, utils_1.sendSuccess)(res, { message: "email verified", data: { email } });
        // Update the user email and set the token to expire in 5 minutes and redis cache update
        userData.email = email;
        userData.save().catch(console.error);
        config_1.redis.set(`reject:${token}`, "true", "EX", 300).catch(console.error);
        config_1.redis.set(`get-user:${userData._id}`, JSON.stringify(userData), "EX", 60 * 30).catch(console.error); // 30 minutes
        return;
    }
    catch (e) {
        console.error(e);
        (0, utils_1.sendError)(res, { message: "server error", errors: ["internal server error"] });
    }
};
exports.verifyEmail = verifyEmail;
async function verifyTokenAndGetUser(token, user) {
    try {
        if (!user)
            return ["User not found", null];
        const rejectToken = await config_1.redis.get(`reject:${token}`);
        if (rejectToken)
            return ["Token expired", null];
        return await (0, user_1.fetchUser)(user.id);
    }
    catch (e) {
        console.error(e);
        return ["Internal Server Error", null];
    }
}
