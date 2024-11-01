import {Request, Response} from 'express';
import {sendError, sendSuccess} from "../../utils";
import {PostUploadList, UserToken} from "../../types/user";
import {PostUploadUserModel} from "../../model";
import {isValidRepoUrl} from "../../validators/url.validator";
import {fetchUser, fetchUserFromDatabase} from "../../helper/user";
import {redis} from "../../config";


export const addNewPost = async (req: Request, res: Response) => {
    try {
        const {url, description, title} = req.body;
        if (!(await isValidRepoUrl(url)) || !title) {
            sendError(res, {message: "invalid url", name: "client", errors: ["url", "title"]});
            return;
        }

        const [error, userData] = await fetchUserFromDatabase(req.User as UserToken);
        if (error || !userData) {
            sendError(res, {message: error});
            return;
        }

        const newPost =  await PostUploadUserModel.create({
            userId: userData._id,
            title,
            description,
            displayName: userData.displayName,
            url,
            uploadDate: new Date(),
        });

        const mapUrl: string = url.replaceAll(".", "_").toString();
        if (userData.postUploadList.has(mapUrl)) {
            sendError(res, {message: "post already added", name: "client"});
            return;
        }

        userData.postUploadList.set(mapUrl, {
            id: newPost._id as string,
            title,
            url,
            description,
            displayName: userData.displayName,
            uploadDate: new Date(),
            verifyDate: null,
            progress: "pending",
        });

        sendSuccess(res, {message: "post added successfully"});
        userData.save().catch(console.error);
    } catch (e) {
        console.error(e);
        sendError(res, {message: "internal server error"});
    }
};

export const getPostsList = async (req: Request, res: Response) => {
    try {
        const env = req.query.env as string || "pending";
        const page = Number(req.query.page as string ) || 1;
        const limit = Number(req.query.limit as string) || 10;

        if (!["all", "pending", "approved", "creating-files", "uploaded", "rejected"].includes(env)) {
            sendError(res, {message: "invalid environment", name: "client"});
            return;
        }

        if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1 || limit > 25) {
            sendError(res, {message: "invalid page or limit", name: "client"});
            return;
        }

        const user = req.User as UserToken;
        if (!user) {
            sendError(res, {message: "user not found", name: "client"});
            return;
        }

        const [error, userData] = await fetchUser(user.id);
        if (error || !userData) {
            sendError(res, {message: error, name: "client"});
            return;
        }

        const cash = await redis.get(`post-list-user:${userData._id}-${env}-${page}-${limit}`);
        if (cash) {
            sendSuccess(res, {message: "post list", data: JSON.parse(cash)});
            return;
        }

        const postList:PostUploadList[]  = [];

        if (env === "all") {
            postList.push(
                ...userData.postUploadList.values(),
                ...userData.postCompletedList.values(),
                ...userData.postRejectList.values()
            );
        } else if (env === "pending" || env === "approved" || env === "creating-files") {
            postList.push(...userData.postUploadList.values());
        } else if (env === "completed") {
            postList.push(...userData.postUploadList.values());
        } else if (env === "rejected") {
            postList.push(...userData.postUploadList.values());
        } else {
            sendError(res, {message: "invalid environment", name: "client"});
            return;
        }

        const total = postList.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const posts = postList.slice(startIndex, endIndex);
        const data = {
            total,
            totalPages,
            page,
            limit,
            posts,
        };

        redis.set(`post-list-user:${userData._id}-${env}-${page}-${limit}`, JSON.stringify(data), "EX", 60);
        sendSuccess(res, {message: "post list", data});

    } catch (e) {
        console.error(e);
        sendError(res, {message: "internal server error"});
    }
};
