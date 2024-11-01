import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utils";
import {fetchUserFromDatabase} from "../../helper/user";
import {UserSchemas, PostUploadUser} from "../../types";
import {PostUploadUserModel} from "../../model";
import {redis} from "../../config";
import {isValidRepoUrl} from "../../validators/url.validator";

const getPostAndUser = async (user: UserSchemas.UserToken, id: string | undefined | null):
    Promise<[string | null, UserSchemas.IUser | null, PostUploadUser.PostUploadUserTypes | null]> =>
{
    try {
        const [error, userData] = await fetchUserFromDatabase(user);
        if (error || !userData) {
            return [error, null, null];
        }

        const postDB = await PostUploadUserModel.findById(id);
        if (!postDB) {
            return ["post not found", null, null];
        }

        return [null, userData, postDB];
    } catch (e) {
        console.error(e);
        return ["internal server error", null, null];
    }
};

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

        const [error, userData, postDB] = await getPostAndUser(req.User as UserSchemas.UserToken, id);
        if (error || !userData || !postDB) {
            sendError(res, {message: error, name: error === "post not found" ? "client" : "server"});
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
        updatePostInMap(userData.postCompletedList);

        await redis.set(`get-user:${userData._id}`, JSON.stringify(userData), "EX", 60 * 30);
        await userData.save();

        sendSuccess(res, { message: "post updated successfully" });
    } catch (e) {
        console.error(e);
        sendError(res, {message: "internal server error"});
    }
};

export const updateUrl = async (req: Request, res: Response) => {
    try {
        const {url, id} = req.body;
        if (!id || !url || typeof url !== "string" || !(await isValidRepoUrl(url))) {
            sendError(res, {message: "invalid fields", name: "client", errors: ["id", "url"]});
            return;
        }

        const [error, userData, postDB] = await getPostAndUser(req.User as UserSchemas.UserToken, id);
        if (error || !userData || !postDB) {
            sendError(res, {message: error, name: error === "post not found" ? "client" : "server"});
            return;
        }

        const key = postDB.url.replaceAll(".", "_").toString();
        if (!userData.postUploadList.has(key)) {
            sendError(res, {message: "post not found", name: "client"});
            return;
        }

        const post = userData.postUploadList.get(key);
        if (!post || post.progress !== "pending") {
            sendError(res, {message: "url cannot change", name: "client", errors: ["progress"]});
            return;
        }

        post.url = url;
        userData.postUploadList.set(key, post);

        await postDB.updateOne({url});
        await redis.set(`get-user:${userData._id}`, JSON.stringify(userData), "EX", 60 * 30);
        await userData.save();

        sendSuccess(res, { message: "url updated successfully" });
    } catch (e) {
        console.error(e);
        sendError(res, {message: "internal server error"});
    }
};
