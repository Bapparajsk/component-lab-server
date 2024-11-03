"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUrl = exports.updatePost = void 0;
const utils_1 = require("../../utils");
const user_1 = require("../../helper/user");
const model_1 = require("../../model");
const config_1 = require("../../config");
const url_validator_1 = require("../../validators/url.validator");
const getPostAndUser = async (user, id) => {
    try {
        const [error, userData] = await (0, user_1.fetchUserFromDatabase)(user);
        if (error || !userData) {
            return [error, null, null];
        }
        const postDB = await model_1.PostUploadUserModel.findById(id);
        if (!postDB) {
            return ["post not found", null, null];
        }
        return [null, userData, postDB];
    }
    catch (e) {
        console.error(e);
        return ["internal server error", null, null];
    }
};
const updatePost = async (req, res) => {
    try {
        const { description, title, id } = req.body;
        if (!id) {
            (0, utils_1.sendError)(res, { message: "missing fields", name: "client", errors: ["id"] });
            return;
        }
        if (!description && !title) {
            (0, utils_1.sendError)(res, { message: "missing fields", name: "client", errors: ["description", "title"] });
            return;
        }
        const [error, userData, postDB] = await getPostAndUser(req.User, id);
        if (error || !userData || !postDB) {
            (0, utils_1.sendError)(res, { message: error, name: error === "post not found" ? "client" : "server" });
            return;
        }
        await postDB.updateOne({ description, title });
        const key = postDB.url.replaceAll(".", "_").toString();
        const updatePostInMap = (map) => {
            const post = map.get(key);
            if (post) {
                post.description = description || post.description;
                post.title = title || post.title;
                map.set(key, post);
            }
        };
        updatePostInMap(userData.postUploadList);
        updatePostInMap(userData.postCompletedList);
        await config_1.redis.set(`get-user:${userData._id}`, JSON.stringify(userData), "EX", 60 * 30);
        await userData.save();
        (0, utils_1.sendSuccess)(res, { message: "post updated successfully" });
    }
    catch (e) {
        console.error(e);
        (0, utils_1.sendError)(res, { message: "internal server error" });
    }
};
exports.updatePost = updatePost;
const updateUrl = async (req, res) => {
    try {
        const { url, id } = req.body;
        if (!id || !url || typeof url !== "string" || !(await (0, url_validator_1.isValidRepoUrl)(url))) {
            (0, utils_1.sendError)(res, { message: "invalid fields", name: "client", errors: ["id", "url"] });
            return;
        }
        const [error, userData, postDB] = await getPostAndUser(req.User, id);
        if (error || !userData || !postDB) {
            (0, utils_1.sendError)(res, { message: error, name: error === "post not found" ? "client" : "server" });
            return;
        }
        const key = postDB.url.replaceAll(".", "_").toString();
        if (!userData.postUploadList.has(key)) {
            (0, utils_1.sendError)(res, { message: "post not found", name: "client" });
            return;
        }
        const post = userData.postUploadList.get(key);
        if (!post || post.progress !== "pending") {
            (0, utils_1.sendError)(res, { message: "url cannot change", name: "client", errors: ["progress"] });
            return;
        }
        post.url = url;
        userData.postUploadList.set(key, post);
        await postDB.updateOne({ url });
        await config_1.redis.set(`get-user:${userData._id}`, JSON.stringify(userData), "EX", 60 * 30);
        await userData.save();
        (0, utils_1.sendSuccess)(res, { message: "url updated successfully" });
    }
    catch (e) {
        console.error(e);
        (0, utils_1.sendError)(res, { message: "internal server error" });
    }
};
exports.updateUrl = updateUrl;
