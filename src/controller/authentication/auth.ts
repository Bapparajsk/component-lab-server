import {Request, Response} from 'express';
import {jwt, sendError, sendSuccess, OTP, sendEmail} from "../../utils";
import {comparePassword, isEmail} from "../../validators";
import {validData} from "../../validators/newUser";
import {IUser} from "../../types/user";
import {UserModel} from "../../model";
import {shrinkUser} from "../../helper/shrinkUser";
import { each } from "../../lib/each";
import { redis } from "../../config";

export const login = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;
        if (!email || !password || !isEmail(email)) {
            sendError(res, {message: "Email and password are required"});
            return;
        }

        const user: IUser | null = await UserModel.findOne({email});
        if (!user) {
            sendError(res, {message: "invalid credential"});
            return;
        }

        const isMatch = comparePassword(password, user.password);
        if (!isMatch) {
            sendError(res, {message: "invalid credential"});
            return;
        }

        const token = jwt.create({id: user._id, name: user.displayName}, {expiresIn: "7d", algorithm: "ES384"});
        sendSuccess(res, {message: "Login successful", data: {token, user: shrinkUser(user)}});
        return;
    } catch (error) {
        console.error(error);
        sendError(res, {message: "Internal server error", errors: [error]});
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        console.log(req.body);
        const { name, displayName, email, password } = req.body;

        const [error, isValid] = validData({name, displayName, email, password});
        if (error || !isValid) {
            sendError(res, {message: "Invalid data", errors: [error]});
            return;
        }

        const { otp, hashedOTP } = await OTP.generateOTP();
        const token = jwt.create({ name, displayName, email, password, hashedOTP }, {expiresIn: "5m", algorithm: "HS256"});
        sendSuccess(res, {message: "OTP sent to email", data: {token}});

        await each(3, async () => {
            const isSend = await sendEmail(email, "Your OTP is " + otp);
            if (isSend) {
                console.log("OTP sent to email");
                return true;
            }
            console.error("Failed to send OTP");
            return false;
        });
    } catch (error) {
        console.error(error);
        sendError(res, {message: "Internal server error", errors: [error]});
    }
};

export const resendOTP = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        if (!token) {
            sendError(res, {message: "Email is required"});
            return;
        }

        const data = jwt.verify(token) as { name: string, displayName: string, email: string, password: string, hashedOTP: string };
        if (!data) {
            sendError(res, {message: "Invalid token"});
            return;
        }

        await redis.set(`reject:${token}`, "true", "EX", 300);
        const { otp, hashedOTP } = await OTP.generateOTP();
        const newToken = jwt.create({ name: data.name, displayName: data.displayName, email: data.email, password: data.password, hashedOTP: hashedOTP }, {expiresIn: "5m", algorithm: "HS256"});
        sendSuccess(res, {message: "OTP sent to email", data: {token: newToken}});

        await each(3, async () => {
            const isSend = await sendEmail(data.email, "Your OTP is " + otp);
            if (isSend) {
                console.log("OTP sent to email");
                return true;
            }
            console.error("Failed to send OTP");
            return false;
        });
        return;
    } catch (error) {
        console.error(error);
        sendError(res, {message: "Internal server error", errors: [error]});
    }
};

export const verifyOTP = async (req: Request, res: Response) => {
    try {
        const { otp, token } = req.body;
        if (!otp || !token) {
            sendError(res, {message: "OTP is required"});
            return;
        }

        const isValidToken = await redis.get(`reject:${token}`);

        if (isValidToken !== null) {
            sendError(res, {message: "Invalid token"});
            return;
        }

        const data = jwt.verify(token) as { name: string, displayName: string, email: string, password: string, hashedOTP: string };
        if (!data) {
            sendError(res, {message: "Invalid token"});
            return;
        }

        const isMatch = await OTP.verifyOTP(otp, data.hashedOTP);
        if (!isMatch) {
            sendError(res, {message: "Invalid OTP"});
            return;
        }

        const user = new UserModel({...data});
        await user.save();

        const userToken = jwt.create({id: user._id, name: user.displayName}, {expiresIn: "7d", algorithm: "HS256"});
        sendSuccess(res, {message: "User registered successfully", data: {user: shrinkUser(user), token: userToken}});
    } catch (error) {
        console.error(error);
        sendError(res, {message: "Internal server error", errors: [error]});
    }
};

