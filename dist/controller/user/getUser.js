"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFans = exports.getUserPost = exports.getUser = void 0;
const utils_1 = require("../../utils");
const user_1 = require("../../helper/user");
const model_1 = require("../../model");
const config_1 = require("../../config");
const getUser = async (req, res) => {
    try {
        const user = req.User;
        if (!user) {
            (0, utils_1.sendError)(res, { message: "Invalid token", name: "client", errors: ["invalid token"] });
            return;
        }
        const [error, userFromCache] = await (0, user_1.fetchUser)(user.id);
        if (error || !userFromCache) {
            (0, utils_1.sendError)(res, { message: error || "User not found", name: "client", errors: ["invalid token"] });
            return;
        }
        const creatShrinkUser = (0, user_1.ShrinkUser)(userFromCache);
        (0, utils_1.sendSuccess)(res, { message: "User fetched", data: { user: creatShrinkUser } });
    }
    catch (e) {
        console.error(e);
        (0, utils_1.sendError)(res, { message: "Internal Server error" });
    }
};
exports.getUser = getUser;
const getUserPost = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const env = req.query.env || "user";
        // *Validate query parameter
        if (page < 1 || limit < 1 || limit > 20 || !["user", "liked"].includes(env)) {
            (0, utils_1.sendError)(res, { message: "Invalid query parameter", name: "client" });
            return;
        }
        const user = req.User;
        if (!user) {
            (0, utils_1.sendError)(res, { message: "Invalid token", name: "client", errors: ["invalid token"] });
            return;
        }
        // *Check if the data is in cache
        let posts = await config_1.redis.get(`get-user-post:${user.id}:${page}:${limit}:${env}`);
        if (typeof posts === "string") {
            posts = JSON.parse(posts);
            (0, utils_1.sendSuccess)(res, { message: "User posts fetched", data: posts });
            return;
        }
        // *Fetch data from database
        const userFromCache = await model_1.UserModel.findById(user.id);
        if (!userFromCache) {
            (0, utils_1.sendError)(res, { message: "User not found", name: "client", errors: ["invalid token"] });
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
        const PostData = await model_1.PostModel
            .find({ _id: { $in: Array.from(posts).slice(startIndex, endIndex) } })
            .populate("user")
            .exec();
        const result = { total, page, totalPages, posts: PostData };
        // *Cache the data
        await config_1.redis.set(`get-user-post:${user.id}:${page}:${limit}:${env}`, JSON.stringify(result), "EX", 60 * 30); // 30 minutes
        (0, utils_1.sendSuccess)(res, { message: "User posts fetched", data: result });
    }
    catch (e) {
        console.error(e);
        (0, utils_1.sendError)(res, { message: "Internal Server error" });
    }
};
exports.getUserPost = getUserPost;
const getFans = async (req, res) => {
    try {
        const env = req.query.env || "followers";
        if (!["followers", "following"].includes(env)) {
            (0, utils_1.sendError)(res, { message: "invalid query", name: "client" });
            return;
        }
        const user = req.User;
        if (!user) {
            (0, utils_1.sendError)(res, { message: "Invalid token", name: "client", errors: ["invalid token"] });
            return;
        }
        let fan = await config_1.redis.get(`get-user-fans:${user.id}:${env}`);
        if (typeof fan === "string") {
            fan = JSON.parse(fan);
            (0, utils_1.sendSuccess)(res, { message: "User followers fetched", data: fan });
            return;
        }
        const [error, userFromCache] = await (0, user_1.fetchUser)(user.id);
        if (error || !userFromCache) {
            (0, utils_1.sendError)(res, { message: error || "User not found", name: "client", errors: ["invalid token"] });
            return;
        }
        fan = env === "followers" ? userFromCache.followers : userFromCache.following;
        await config_1.redis.set(`get-user-fans:${user.id}:${env}`, JSON.stringify(fan), "EX", 60 * 30); // 30 minutes
        (0, utils_1.sendSuccess)(res, { message: "User followers fetched", data: fan });
    }
    catch (e) {
        console.error(e);
        (0, utils_1.sendError)(res, { message: "Internal Server error" });
    }
};
exports.getFans = getFans;
