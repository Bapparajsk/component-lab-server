"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostsList = exports.addNewPost = void 0;
const utils_1 = require("../../utils");
const model_1 = require("../../model");
const url_validator_1 = require("../../validators/url.validator");
const user_1 = require("../../helper/user");
const config_1 = require("../../config");
const addNewPost = async (req, res) => {
    try {
        const { url, description, title } = req.body;
        if (!(await (0, url_validator_1.isValidRepoUrl)(url)) || !title) {
            (0, utils_1.sendError)(res, { message: "invalid url", name: "client", errors: ["url", "title"] });
            return;
        }
        const [error, userData] = await (0, user_1.fetchUserFromDatabase)(req.User);
        if (error || !userData) {
            (0, utils_1.sendError)(res, { message: error });
            return;
        }
        const newPost = await model_1.PostUploadUserModel.create({
            userId: userData._id,
            title,
            description,
            displayName: userData.displayName,
            url,
            uploadDate: new Date(),
        });
        const mapUrl = url.replaceAll(".", "_").toString();
        if (userData.postUploadList.has(mapUrl)) {
            (0, utils_1.sendError)(res, { message: "post already added", name: "client" });
            return;
        }
        userData.postUploadList.set(mapUrl, {
            id: newPost._id,
            title,
            url,
            description,
            displayName: userData.displayName,
            uploadDate: new Date(),
            verifyDate: null,
            progress: "pending",
        });
        (0, utils_1.sendSuccess)(res, { message: "post added successfully" });
        userData.save().catch(console.error);
    }
    catch (e) {
        console.error(e);
        (0, utils_1.sendError)(res, { message: "internal server error" });
    }
};
exports.addNewPost = addNewPost;
const getPostsList = async (req, res) => {
    try {
        const env = req.query.env || "pending";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        if (!["all", "pending", "approved", "creating-files", "uploaded", "rejected"].includes(env)) {
            (0, utils_1.sendError)(res, { message: "invalid environment", name: "client" });
            return;
        }
        if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1 || limit > 25) {
            (0, utils_1.sendError)(res, { message: "invalid page or limit", name: "client" });
            return;
        }
        const user = req.User;
        if (!user) {
            (0, utils_1.sendError)(res, { message: "user not found", name: "client" });
            return;
        }
        const [error, userData] = await (0, user_1.fetchUser)(user.id);
        if (error || !userData) {
            (0, utils_1.sendError)(res, { message: error, name: "client" });
            return;
        }
        const cash = await config_1.redis.get(`post-list-user:${userData._id}-${env}-${page}-${limit}`);
        if (cash) {
            (0, utils_1.sendSuccess)(res, { message: "post list", data: JSON.parse(cash) });
            return;
        }
        const postList = [];
        if (env === "all") {
            postList.push(...userData.postUploadList.values(), ...userData.postCompletedList.values(), ...userData.postRejectList.values());
        }
        else if (env === "pending" || env === "approved" || env === "creating-files") {
            postList.push(...userData.postUploadList.values());
        }
        else if (env === "completed") {
            postList.push(...userData.postUploadList.values());
        }
        else if (env === "rejected") {
            postList.push(...userData.postUploadList.values());
        }
        else {
            (0, utils_1.sendError)(res, { message: "invalid environment", name: "client" });
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
        config_1.redis.set(`post-list-user:${userData._id}-${env}-${page}-${limit}`, JSON.stringify(data), "EX", 60);
        (0, utils_1.sendSuccess)(res, { message: "post list", data });
    }
    catch (e) {
        console.error(e);
        (0, utils_1.sendError)(res, { message: "internal server error" });
    }
};
exports.getPostsList = getPostsList;
