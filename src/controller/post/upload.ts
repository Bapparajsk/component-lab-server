import {Request, Response} from 'express';
import {sendError, sendSuccess} from "../../utils";
import {UserToken} from "../../types/user";
import {PostUploadUserModel, PostModel} from "../../model";
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
            sendError(res, {message: error, name: "unauthorized"});
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
            timeLine: {
                upload: new Date(),
                approved: "processing",
                "creating-files": "-",
                completed: "-",
            },
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
        const page = Number(req.query.page as string) || 1;
        const limit = Math.min(Number(req.query.limit as string) || 10, 25);

        // Validate environment and pagination parameters
        if (!["all", "pending", "approved", "creating-files", "uploaded", "rejected"].includes(env)) {
            sendError(res, {message: "invalid environment", name: "client"});
            return;
        }
        if (isNaN(page) || isNaN(limit) || page < 1) {
            sendError(res, {message: "invalid page or limit", name: "client"});
            return;
        }

        const user = req.User as UserToken;
        if (!user) {
            sendError(res, {message: "unauthorized", name: "unauthorized"});
            return;
        }

        const [error, userData] = await fetchUser(user.id);
        if (error || !userData) {
            sendError(res, {message: error, name: "unauthorized",});
            return;
        }

        const cacheKey = `post-list-user:${userData._id}-${env}-${page}-${limit}`;
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            sendSuccess(res, {message: "post list", data: JSON.parse(cachedData)});
            return;
        }

        // Filter and select posts based on env
        let postList: any[] = [];
        switch (env) {
            case "all":
                postList = [
                    ...userData.postUploadList.values(),
                    ...userData.postCompletedList.values(),
                    ...userData.postRejectList.values(),
                ];
                break;
            case "pending":
            case "approved":
            case "creating-files":
                postList = [...userData.postUploadList.values()];
                break;
            case "completed":
                postList = [...userData.postCompletedList.values()];
                break;
            case "rejected":
                postList = [...userData.postRejectList.values()];
                break;
        }

        if (!postList.length) {
            sendSuccess(res, {message: "No posts found", data: { total: 0, totalPages: 0, page, limit, posts: []}});
            return;
        }

        // Paginate
        const total = postList.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = Math.min(startIndex + limit, total);
        const posts = postList.slice(startIndex, endIndex);

        // Resolve post details in parallel for "completed" status posts
        const completedPosts = await Promise.all(
            posts.map(async (post) => {
                if (post.progress === "completed") {
                    return (await PostModel.findById(post.id)) || post;
                }
                return post;
            })
        );

        const data = { total, totalPages, page, limit, posts: completedPosts };
        await redis.set(cacheKey, JSON.stringify(data), "EX", 60);

        sendSuccess(res, {message: "post list", data});
    } catch (e) {
        console.error(e);
        sendError(res, {message: "internal server error"});
    }
};
