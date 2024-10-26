import {Request, Response} from "express";
import {sendError, sendSuccess} from "../../utils";
import {shrinkUser} from "../../helper/shrinkUser";
import {IUser, UserToken} from "../../types/user";
import {UserModel} from "../../model";
import {redis} from "../../config";


export const getUser = async (req: Request, res: Response) => {
    try {
        const user = req.User as UserToken;
        let userFromCache = await redis.get(`get-user:${user.id}`) as string | IUser | null;
        if (typeof userFromCache === "string") {
            sendSuccess(res, {message: "User fetched", data: {user: JSON.parse(userFromCache)}});
            return;
        }

        userFromCache = await UserModel.findById(user.id) as IUser;
        if (!userFromCache) {
            sendError(res, {message: "User not found", name: "client", errors: ["invalid token"]});
            return;
        }

        const creatShrinkUser = shrinkUser(userFromCache);
        await redis.set(`get-user:${user.id}`, JSON.stringify(creatShrinkUser), "EX", 60 * 30); // 30 minutes
        sendSuccess(res, {message: "User fetched", data: {user: creatShrinkUser}});

    } catch (e) {
        console.error(e);
        sendError(res, { message: "Internal Server error" });
    }
};
