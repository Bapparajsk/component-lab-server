import {NextFunction, Request, Response} from "express";
import {jwt, sendError} from "../utils";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.token as string;
        if (!token) {
            sendError(res, {message: "Token is required", name: "client",});
            return;
        }

        const decoded = jwt.verify(token) as { email: string };
        if (!decoded || typeof decoded !== "object" || decoded.email !== process.env.ADMIN_EMAIL) {
            sendError(res, {message: "Invalid token", name: "client",});
            return;
        }

        next();
    } catch (e) {
        console.error(e);
        sendError(res, {message: "Internal server error"});
    }
};
