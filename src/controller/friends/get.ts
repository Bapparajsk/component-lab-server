import {Request, Response} from "express";
import {sendError, sendSuccess} from "../../utils";
import {fetchUser} from "../../helper/user";

export const getFriend = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) {
            sendError(res, {message: "missing id"});
            return;
        }

        const [error, friend] = await fetchUser(id);
        if (error || !friend) {
            sendError(res, {message: "user not found", errors: [error]});
            return;
        }

        sendSuccess(res, {message: "user found", data: {user: friend}});
    } catch (e) {
        console.error(e);
        sendError(res, {message: "internal server error"});
    }
};
