import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utils";
import { shrinkUser } from "../../helper/shrinkUser";
import {IUser} from "../../types/user";

export const getUser = async (req: Request, res: Response) => {
    try {
        const user = req.User as IUser;

        sendSuccess(res, { message: "User fetched", data:{user: shrinkUser(user)} });

    } catch (e) {
        console.error(e);
        sendError(res, { message: "Internal Server error" });
    }
};
