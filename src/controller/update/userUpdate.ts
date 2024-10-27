import { Request, Response, } from "express";
import { sendError, sendSuccess } from "../../utils";
import {updateUserDetails} from "../../helper/user";
import {UserToken} from "../../types/user";
import {updateEnv} from "../../types/userUpdate";

export const userUpdate = async (req: Request, res: Response) => {
    try {
        const env = req.query.env as updateEnv["env"];
        const user = req.User as UserToken;

        if (!["password", "displayName", "gender", "description", "links", "language"].includes(env)) {
            sendError(res, { message: "invalid env", name: "client", errors: ["invalid env"] });
            return;
        }

        const [error, isValid] = await updateUserDetails({ env, body: req.body, id: user.id });
        if (error || !isValid) {
            sendError(res, { message: error, name: "client", errors: [error] });
            return;
        }

        sendSuccess(res, { message: "update successful" });
        return;
    } catch (e) {
        console.error(e);
        sendError(res, { message: "server error", errors: ["internal server error"] });
    }
};
