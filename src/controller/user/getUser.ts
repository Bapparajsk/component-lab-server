import {Request, Response} from "express";
import {sendError, sendSuccess} from "../../utils";
import {fetchUser, ShrinkUser} from "../../helper/user";
import {IUser, UserToken} from "../../types/user";
import {PostModel, UserModel} from "../../model";
import {redis} from "../../config";


export const getUser = async (req: Request, res: Response) => {
    try {
        const user = req.User as UserToken;
        if (!user) {
            sendError(res, {message: "Invalid token", name: "client", errors: ["invalid token"]});
            return;
        }
        const [error, userFromCache] = await fetchUser(user.id);
        if (error || !userFromCache) {
            sendError(res, {message: error || "User not found", name: "client", errors: ["invalid token"]});
            return;
        }

        const creatShrinkUser = ShrinkUser(userFromCache);
        sendSuccess(res, {message: "User fetched", data: {user: creatShrinkUser}});
    } catch (e) {
        console.error(e);
        sendError(res, { message: "Internal Server error" });
    }
};

export const getUserPost = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 15;
        const env = req.query.env as string || "user";

        // *Validate query parameter
        if (page < 1 || limit < 1 || limit > 20 || !["user", "liked"].includes(env)) {
            sendError(res, {message: "Invalid query parameter", name: "client"});
            return;
        }

        const user = req.User as UserToken;
        if (!user) {
            sendError(res, {message: "Invalid token", name: "client", errors: ["invalid token"]});
            return;
        }

        // *Check if the data is in cache
        let posts = await redis.get(`get-user-post:${user.id}:${page}:${limit}:${env}`) as string | IUser["posts"] | null;
        if (typeof posts === "string") {
            posts = JSON.parse(posts) as IUser["posts"];
            sendSuccess(res, {message: "User posts fetched", data: posts});
            return;
        }

        // *Fetch data from database
        const userFromCache = await UserModel.findById(user.id);
        if (!userFromCache) {
            sendError(res, {message: "User not found", name: "client", errors: ["invalid token"]});
            return;
        }

        // *Filter the data
        posts = userFromCache.posts;
        if (env === "liked") {
            posts = userFromCache.likedPosts;
        }

        // *Paginate the data
        const total = posts.size;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // *Fetch the data from database
        const PostData = await PostModel
            .find({_id: {$in: Array.from(posts).slice(startIndex, endIndex)}})
            .populate("user")
            .exec();
        const result = { total, page, totalPages, posts: PostData };

        // *Cache the data
        await redis.set(`get-user-post:${user.id}:${page}:${limit}:${env}`, JSON.stringify(result), "EX", 60 * 30); // 30 minutes
        sendSuccess(res, {message: "User posts fetched", data: result});
    } catch (e) {
        console.error(e);
        sendError(res, {message: "Internal Server error"});
    }
};

export const getFans = async (req: Request, res: Response) => {
    try {
        const env = req.query.env as string || "followers";
        if (!["followers", "following"].includes(env)) {
            sendError(res, {message: "invalid query", name: "client"});
            return;
        }

        const user = req.User as UserToken;
        if (!user) {
            sendError(res, {message: "Invalid token", name: "client", errors: ["invalid token"]});
            return;
        }

        let fan = await redis.get(`get-user-fans:${user.id}:${env}`) as string | IUser["followers"] | null;
        if (typeof fan === "string") {
            fan = JSON.parse(fan) as IUser["followers"];
            sendSuccess(res, {message: "User followers fetched", data: fan});
            return;
        }

        const [error, userFromCache] = await fetchUser(user.id);
        if (error || !userFromCache) {
            sendError(res, {message: error || "User not found", name: "client", errors: ["invalid token"]});
            return;
        }

        fan = env === "followers" ? userFromCache.followers : userFromCache.following;
        await redis.set(`get-user-fans:${user.id}:${env}`, JSON.stringify(fan), "EX", 60 * 30); // 30 minutes
        sendSuccess(res, {message: "User followers fetched", data: fan});
    } catch (e) {
        console.error(e);
        sendError(res, {message: "Internal Server error"});
    }
};
