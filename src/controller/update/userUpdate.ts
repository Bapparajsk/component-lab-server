import {Request, Response,} from "express";
import {jwt, OTP, sendError, sendSuccess} from "../../utils";
import {fetchUser, updateUserDetails} from "../../helper/user";
import {IUser, UserToken} from "../../types/user";
import {updateEnv} from "../../types/userUpdate";
import {sendOtpQueue} from "../../lib/bullmqProducer";
import {redis} from "../../config";



export const userUpdate = async (req: Request, res: Response) => {
    try {
        const env = req.query.env as updateEnv["env"];

        // Check if the env is valid
        if (!["password", "displayName", "gender", "description", "links", "language"].includes(env)) {
            sendError(res, { message: "invalid env", name: "client", errors: ["invalid env"] });
            return;
        }

        const user = req.User as UserToken;
        if (!user) {
            sendError(res, { message: "invalid token", name: "client", errors: ["invalid token"] });
            return;
        }

        // update user details based on the env provided
        const [error, isValid] = await updateUserDetails({ env, body: req.body, id: user.id });
        if (error || !isValid) {
            sendError(res, { message: error, name: "client", errors: [error] });
            return;
        }

        // Send success response
        sendSuccess(res, { message: "update successful" });
        return;
    } catch (e) {
        console.error(e);
        sendError(res, { message: "server error", errors: ["internal server error"] });
    }
};

export const updateEmail = async (req: Request, res: Response) => {
    try {
        const {email} = req.body;

        // Check if email is provided
        if (!email) {
            sendError(res, {message: "email is required", name: "client", errors: ["email is required"]});
            return;
        }

        const user = req.User as UserToken;
        if (!user) {
            sendError(res, {message: "invalid token", name: "client", errors: ["invalid token"]});
            return;
        }

        // fetch user data from cache or database
        const [error, userData] = await fetchUser(user.id);
        if (error || !userData) {
            sendError(res, {message: error, name: "client", errors: [error]});
            return;
        }

        // Generate OTP and create a token for the user email
        const {otp, hashedOTP} = await OTP.generateOTP();
        const token = jwt.create({email, hashedOTP}, {expiresIn: "5m", algorithm: "HS256"});
        sendSuccess(res, {message: "OTP sent to email", data: {token}});

        // Send OTP to the user email
        sendOtpQueue({email, otp}).catch(console.error);
        return;
    } catch (e) {
        console.error(e);
        sendError(res, {message: "server error", errors: ["internal server error"]});
    }
};

export const resendOtp = async (req: Request, res: Response) => {
    try {
        const {token} = req.body;

        // Check if token is provided
        if (!token) {
            sendError(res, {message: "token is required", name: "client", errors: ["token is required"]});
            return;
        }

        // Check if the token is expired
        const [error, userData] = await verifyTokenAndGetUser(token, req.User);
        if (error || !userData) {
            sendError(res, {message: error, name: "client", errors: [error]});
            return;
        }

        // Generate OTP and create a token for the user email
        const {otp, hashedOTP} = await OTP.generateOTP();
        const newToken = jwt.create({email: userData.email, hashedOTP}, {expiresIn: "5m", algorithm: "HS256"});
        sendSuccess(res, {message: "OTP sent to email", data: {newToken}});

        // Send OTP to the user email
        sendOtpQueue({email: userData.email, otp}).catch(console.error);
        redis.set(`reject:${token}`, "true", "EX", 300).catch(console.error);
        return;
    } catch (e) {
        console.error(e);
        sendError(res, {message: "server error", errors: ["internal server error"]});
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const {otp, token} = req.body;

        // Check if otp and token is provided
        if (!otp || !token) {
            sendError(res, {message: "invalid body contain", name: "client", errors: ["otp and token is required"]});
            return;
        }

        const [error, userData] = await verifyTokenAndGetUser(token, req.User);
        if (error || !userData) {
            sendError(res, {message: error, name: "client", errors: [error]});
            return;
        }

        // Verify the OTP
        const {email, hashedOTP} = jwt.verify(token) as {email: string, hashedOTP: string};
        const isValidOTP = await OTP.verifyOTP(otp, hashedOTP);
        if (!isValidOTP) {
            sendError(res, {message: "invalid otp", name: "client", errors: ["invalid otp"]});
            return;
        }

        // * Send success response
        sendSuccess(res, {message: "email verified", data: {email}});

        // Update the user email and set the token to expire in 5 minutes and redis cache update
        userData.email = email;
        userData.save().catch(console.error);
        redis.set(`reject:${token}`, "true", "EX", 300).catch(console.error);
        redis.set(`get-user:${userData._id}`, JSON.stringify(userData), "EX", 60 * 30).catch(console.error); // 30 minutes
        return;
    } catch (e) {
        console.error(e);
        sendError(res, {message: "server error", errors: ["internal server error"]});
    }
};

async function verifyTokenAndGetUser(token: string, user: UserToken | undefined): Promise<[string | null, IUser | null ]> {
    try {
        if (!user)  return ["User not found", null];

        const rejectToken = await redis.get(`reject:${token}`);
        if(rejectToken) return ["Token expired", null];

        return await fetchUser(user.id);
    } catch (e) {
        console.error(e);
        return ["Internal Server Error", null];
    }
}
