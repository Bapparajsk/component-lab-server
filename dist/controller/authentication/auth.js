"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = exports.resendOTP = exports.register = exports.login = void 0;
const utils_1 = require("../../utils");
const validators_1 = require("../../validators");
const newUser_1 = require("../../validators/newUser");
const model_1 = require("../../model");
const user_1 = require("../../helper/user");
const bullmqProducer_1 = require("../../lib/bullmqProducer");
const config_1 = require("../../config");
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password || !(0, validators_1.isEmail)(email)) {
            (0, utils_1.sendError)(res, { message: "Email and password are required", name: "client" });
            return;
        }
        const user = await model_1.UserModel.findOne({ email });
        if (!user) {
            (0, utils_1.sendError)(res, { message: "invalid credential", name: "unauthorized" });
            return;
        }
        const isMatch = (0, validators_1.comparePassword)(password, user.password);
        if (!isMatch) {
            (0, utils_1.sendError)(res, { message: "invalid credential", name: "unauthorized" });
            return;
        }
        const token = utils_1.jwt.create({ id: user._id, name: user.displayName }, { expiresIn: "7d", algorithm: "HS256" });
        (0, utils_1.sendSuccess)(res, { message: "Login successful", data: { token, user: (0, user_1.ShrinkUser)(user) } });
        return;
    }
    catch (error) {
        console.error(error);
        (0, utils_1.sendError)(res, { message: "Internal server error" });
    }
};
exports.login = login;
const register = async (req, res) => {
    try {
        const { name, displayName, email, password } = req.body;
        const [error, isValid] = (0, newUser_1.validData)({ name, displayName, email, password });
        if (error || !isValid) {
            (0, utils_1.sendError)(res, { message: "Invalid data", name: "client", errors: [error] });
            return;
        }
        const user = await model_1.UserModel.findOne({ $or: [{ displayName }, { email }] });
        if (user) {
            let message = "";
            if (user.displayName === displayName && user.email === email) {
                message = "User already exist";
            }
            else if (user.displayName === displayName) {
                message = "Display name already exist";
            }
            else {
                message = "Email already exist";
            }
            (0, utils_1.sendError)(res, { message, name: "client" });
            return;
        }
        const { otp, hashedOTP } = await utils_1.OTP.generateOTP();
        const token = utils_1.jwt.create({ name, displayName, email, password, hashedOTP }, { expiresIn: "5m", algorithm: "HS256" });
        (0, utils_1.sendSuccess)(res, { message: "OTP sent to email", data: { token } });
        (0, bullmqProducer_1.sendOtpQueue)({ email, otp }).catch(console.error);
        return;
    }
    catch (error) {
        console.error(error);
        (0, utils_1.sendError)(res, { message: "Internal server error" });
    }
};
exports.register = register;
const resendOTP = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            (0, utils_1.sendError)(res, { message: "token is required", name: "notFound" });
            return;
        }
        const data = utils_1.jwt.verify(token);
        if (!data) {
            (0, utils_1.sendError)(res, { message: "Invalid token", name: "client" });
            return;
        }
        await config_1.redis.set(`reject:${token}`, "true", "EX", 300);
        const { otp, hashedOTP } = await utils_1.OTP.generateOTP();
        const newToken = utils_1.jwt.create({ name: data.name, displayName: data.displayName, email: data.email, password: data.password, hashedOTP: hashedOTP }, { expiresIn: "5m", algorithm: "HS256" });
        (0, utils_1.sendSuccess)(res, { message: "OTP sent to email", data: { token: newToken } });
        (0, bullmqProducer_1.sendOtpQueue)({ email: data.email, otp });
        return;
    }
    catch (error) {
        console.error(error);
        (0, utils_1.sendError)(res, { message: "Internal server error" });
    }
};
exports.resendOTP = resendOTP;
const verifyOTP = async (req, res) => {
    try {
        const { otp, token } = req.body;
        if (!otp || !token) {
            (0, utils_1.sendError)(res, { message: "OTP is required", name: "client" });
            return;
        }
        const isValidToken = await config_1.redis.get(`reject:${token}`);
        if (isValidToken !== null) {
            (0, utils_1.sendError)(res, { message: "Invalid token", name: "client" });
            return;
        }
        const data = utils_1.jwt.verify(token);
        if (!data) {
            (0, utils_1.sendError)(res, { message: "Invalid token", name: "client" });
            return;
        }
        const isMatch = await utils_1.OTP.verifyOTP(otp, data.hashedOTP);
        if (!isMatch) {
            (0, utils_1.sendError)(res, { message: "Invalid OTP", name: "client" });
            return;
        }
        const user = new model_1.UserModel({ ...data });
        await user.save();
        const userToken = utils_1.jwt.create({ id: user._id, name: user.displayName }, { expiresIn: "7d", algorithm: "HS256" });
        (0, utils_1.sendSuccess)(res, { message: "User registered successfully", data: { user: (0, user_1.ShrinkUser)(user), token: userToken } });
    }
    catch (error) {
        console.error(error);
        (0, utils_1.sendError)(res, { message: "Internal server error" });
    }
};
exports.verifyOTP = verifyOTP;
