import  {Request, Response} from 'express';
import {jwt, OTP, sendError, sendSuccess} from "../../utils";
import {comparePassword, isEmail} from "../../validators";
import {validData} from "../../validators/newUser";
import {IUser} from "../../types/user";
import {UserModel} from "../../model";
import { ShrinkUser } from "../../helper/user";
import {sendOtpQueue} from "../../lib/bullmqProducer";
import {redis} from "../../config";

export const login = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;
        if (!email || !password || !isEmail(email)) {
            sendError(res, {message: "Email and password are required", name: "client"});
            return;
        }

        const user: IUser | null = await UserModel.findOne({email});
        if (!user) {
            sendError(res, {message: "invalid credential", name: "unauthorized"});
            return;
        }

        const isMatch = comparePassword(password, user.password);
        if (!isMatch) {
            sendError(res, {message: "invalid credential", name: "unauthorized"});
            return;
        }

        const token = jwt.create({id: user._id, name: user.displayName}, {expiresIn: "7d", algorithm: "HS256"});
        sendSuccess(res, {message: "Login successful", data: {token, user: ShrinkUser(user)}});
        return;
    } catch (error) {
        console.error(error);
        sendError(res, {message: "Internal server error"});
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { name, displayName, email, password } = req.body;

        const [error, isValid] = validData({name, displayName, email, password});
        if (error || !isValid) {
            sendError(res, {message: "Invalid data", name: "client", errors: [error]});
            return;
        }

        const user: IUser | null = await UserModel.findOne({$or: [{displayName}, {email}]});
        if (user) {
            let message = "";

            if(user.displayName === displayName && user.email === email) {
                message = "User already exist";
            } else if (user.displayName === displayName) {
                message = "Display name already exist";
            } else {
                message = "Email already exist";
            }

            sendError(res, {message, name: "client"});
            return;
        }

        const { otp, hashedOTP } = await OTP.generateOTP();
        const token = jwt.create({ name, displayName, email, password, hashedOTP }, {expiresIn: "5m", algorithm: "HS256"});
        sendSuccess(res, {message: "OTP sent to email", data: {token}});

        sendOtpQueue({email, otp}).catch(console.error);
        return;
    } catch (error) {
        console.error(error);
        sendError(res, {message: "Internal server error"});
    }
};

export const resendOTP = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        if (!token) {
            sendError(res, {message: "token is required", name: "notFound"});
            return;
        }

        const data = jwt.verify(token) as { name: string, displayName: string, email: string, password: string, hashedOTP: string };
        if (!data) {
            sendError(res, {message: "Invalid token", name: "client"});
            return;
        }

        await redis.set(`reject:${token}`, "true", "EX", 300);
        const { otp, hashedOTP } = await OTP.generateOTP();
        const newToken = jwt.create({ name: data.name, displayName: data.displayName, email: data.email, password: data.password, hashedOTP: hashedOTP }, {expiresIn: "5m", algorithm: "HS256"});
        sendSuccess(res, {message: "OTP sent to email", data: {token: newToken}});

        sendOtpQueue({email: data.email, otp});
        return;
    } catch (error) {
        console.error(error);
        sendError(res, {message: "Internal server error"});
    }
};

export const verifyOTP = async (req: Request, res: Response) => {
    try {
        const { otp, token } = req.body;
        if (!otp || !token) {
            sendError(res, {message: "OTP is required", name: "client"});
            return;
        }

        const isValidToken = await redis.get(`reject:${token}`);

        if (isValidToken !== null) {
            sendError(res, {message: "Invalid token", name: "client"});
            return;
        }

        const data = jwt.verify(token) as { name: string, displayName: string, email: string, password: string, hashedOTP: string };
        if (!data) {
            sendError(res, {message: "Invalid token", name: "client"});
            return;
        }

        const isMatch = await OTP.verifyOTP(otp, data.hashedOTP);
        if (!isMatch) {
            sendError(res, {message: "Invalid OTP", name: "client"});
            return;
        }

        const user = new UserModel({...data});
        await user.save();

        const userToken = jwt.create({id: user._id, name: user.displayName}, {expiresIn: "7d", algorithm: "HS256"});
        sendSuccess(res, {message: "User registered successfully", data: {user: ShrinkUser(user), token: userToken}});
    } catch (error) {
        console.error(error);
        sendError(res, {message: "Internal server error"});
    }
};

