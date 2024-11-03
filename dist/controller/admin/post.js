"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postProspering = exports.rejectPost = exports.addPost = void 0;
const utils_1 = require("../../utils");
const model_1 = require("../../model");
const bullmqProducer_1 = require("../../lib/bullmqProducer");
const updateUserPostLists = async (userData, key, postData, listName) => {
    userData.postUploadList.delete(key);
    postData.progress = (listName === "postCompletedList") ? "completed" : "rejected";
    userData[listName].set(key, postData);
    await userData.save();
};
const isValidPost = async (id) => {
    try {
        const tempPost = await model_1.PostUploadUserModel.findById(id);
        if (!tempPost) {
            return { isValid: false, tempPost: null, userData: null, postUploadListData: null, key: null };
        }
        const { userId, url } = tempPost;
        const userData = await model_1.UserModel.findById(userId);
        if (!userData) {
            return { isValid: false, tempPost: null, userData: null, postUploadListData: null, key: null };
        }
        const key = url.replaceAll(".", "_");
        const postUploadListData = userData.postUploadList.get(key);
        if (!postUploadListData) {
            return { isValid: false, tempPost: null, userData: null, postUploadListData: null, key: null };
        }
        return { isValid: true, tempPost, userData, postUploadListData, key };
    }
    catch (e) {
        console.error(e);
        return { isValid: false, tempPost: null, userData: null, postUploadListData: null, key: null };
    }
};
const addPost = async (req, res) => {
    try {
        const { id, tags, files } = req.body;
        if (!id || !tags || !files) {
            (0, utils_1.sendError)(res, { message: "Invalid request", name: "client", errors: ["id, tags, files are required"] });
            return;
        }
        const { isValid, tempPost, userData, postUploadListData, key } = await isValidPost(id);
        if (!isValid || !tempPost || !userData || !postUploadListData || !key) {
            (0, utils_1.sendError)(res, { message: "Invalid request", name: "client", errors: ["Invalid id"] });
            return;
        }
        const newPOst = new model_1.PostModel({
            userId: userData._id,
            title: tempPost.title,
            description: tempPost.description,
            tags,
            fileGroup: files.map(({ title, files }) => ({
                title,
                files
            }))
        });
        await newPOst.save();
        await updateUserPostLists(userData, key, postUploadListData, "postCompletedList");
        (0, utils_1.sendSuccess)(res, { message: "Post added successfully" });
        model_1.PostUploadUserModel.findByIdAndDelete(id).catch(console.error);
        return;
    }
    catch (e) {
        console.error(e);
        (0, utils_1.sendError)(res, { message: "Internal server error" });
    }
};
exports.addPost = addPost;
const rejectPost = async (req, res) => {
    try {
        const { id, rejectRejoin } = req.body;
        if (!id || !id.trim() || typeof id !== "string" || !rejectRejoin || typeof rejectRejoin !== "string") {
            (0, utils_1.sendError)(res, { message: "Invalid request", name: "client", errors: ["id is required"] });
            return;
        }
        const { isValid, tempPost, userData, postUploadListData, key } = await isValidPost(id);
        if (!isValid || !tempPost || !userData || !postUploadListData || !key) {
            (0, utils_1.sendError)(res, { message: "Invalid request", name: "client", errors: ["Invalid id"] });
            return;
        }
        await updateUserPostLists(userData, key, postUploadListData, "postRejectList");
        await userData.save();
        await model_1.PostUploadUserModel.findByIdAndDelete(id);
        (0, utils_1.sendSuccess)(res, { message: "Post rejectPost successfully" });
        (0, bullmqProducer_1.sendMailQueue)({
            email: userData.email,
            data: {
                subject: "Post Rejected",
                text: `Your post with title ${postUploadListData.title} has been rejected.`,
                body: rejectRejoin
            }
        }).catch(console.error);
    }
    catch (e) {
        console.error(e);
        (0, utils_1.sendError)(res, { message: "Internal server error" });
    }
};
exports.rejectPost = rejectPost;
const postProspering = async (req, res) => {
    try {
        const id = req.query.id;
        const env = req.query.env;
        if (!id || typeof id !== "string" || !id.trim() || !env || typeof env !== "string" || !env.trim() || env !== "approved" && env !== "creating-files") {
            (0, utils_1.sendError)(res, { message: "Invalid request", name: "client", errors: ["id, env is required"] });
            return;
        }
        const { isValid, tempPost, userData, postUploadListData, key } = await isValidPost(id);
        if (!isValid || !tempPost || !userData || !postUploadListData || !key) {
            (0, utils_1.sendError)(res, { message: "Invalid request", name: "client", errors: ["Invalid id"] });
            return;
        }
        postUploadListData.progress = env;
        userData.postUploadList.set(key, postUploadListData);
        await userData.save();
        (0, utils_1.sendSuccess)(res, { message: "Post approved successfully" });
    }
    catch (e) {
        console.error(e);
        (0, utils_1.sendError)(res, { message: "Internal server error" });
    }
};
exports.postProspering = postProspering;
