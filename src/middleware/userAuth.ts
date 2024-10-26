import { Request, Response, NextFunction } from "express";
import { sendError, jwt } from "../utils";
import {IUser} from "../types/user";

export const userAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            throw new Error("Unauthorized");
        }

        // Verify token
        const decoded = jwt.verify(token) as IUser;
        if (!decoded) {
            throw new Error("Unauthorized");
        }

        // Attach user to request object
        req.User = decoded;
        next();
    } catch (e) {
        console.error(e);
        sendError(res, { name: "unauthorized", message: "Invalid token"});
    }
};
