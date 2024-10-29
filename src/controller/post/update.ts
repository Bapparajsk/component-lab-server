import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utils";
import {fetchUserFromDatabase} from "../../helper/user";
import {UserToken} from "../../types/user";
import {PostUploadUserModel} from "../../model";
import {redis} from "../../config";


export const updatePost = async (req: Request, res: Response) => {
    try {
        const {description, title, id} = req.body;
        if (!id) {
            sendError(res, {message: "missing fields", name: "client", errors: ["id"]});
            return;
        }

        if (!description && !title) {
            sendError(res, {message: "missing fields", name: "client", errors: ["description", "title"]});
            return;
        }

        const postDB = await PostUploadUserModel.findById(id);
        if (!postDB) {
            sendError(res, {message: "post not found", name: "client"});
            return;
        }

        const [error, userData] = await fetchUserFromDatabase(req.User as UserToken);
        if (error || !userData) {
            sendError(res, {message: error, name: error === "User not found" ? "client" : "server"});
            return;
        }

        await postDB.updateOne({description, title});
        const key = postDB.url.replaceAll(".", "_").toString();

        const updatePostInMap = (map: Map<string, any>) => {
            const post = map.get(key);
            if (post) {
                post.description = description || post.description;
                post.title = title || post.title;
                map.set(key, post);
            }
        };

        updatePostInMap(userData.postUploadList);
        updatePostInMap(userData.postUploadUploadedList);

        await redis.set(`get-user:${userData._id}`, JSON.stringify(userData), "EX", 60 * 30);
        await userData.save();

        sendSuccess(res, { message: "post updated successfully" });
    } catch (e) {
        console.error(e);
        sendError(res, {message: "internal server error"});
    }
};
