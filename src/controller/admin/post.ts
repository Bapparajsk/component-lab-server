import {Request, Response} from "express";
import {sendError, sendSuccess} from "../../utils";
import {PostModel, PostUploadUserModel, UserModel} from "../../model";
import {IUser, PostUploadList} from "../../types/user";
import {sendMailQueue} from "../../lib/bullmqProducer";
import {PostUploadUserTypes} from "../../types/post-upload-user";

const updateUserPostLists = (
    userData: IUser,
    key: string,
    postData: PostUploadList,
    listName: "postCompletedList" | "postRejectList"
) => {
    userData.postUploadList.delete(key);
    postData.progress = (listName === "postCompletedList") ? "completed" : "rejected";
    userData[listName].set(key, postData);
};

const isValidPost = async (id: string): Promise<{
    isValid: boolean,
    tempPost: PostUploadUserTypes | null,
    userData: IUser | null,
    postUploadListData: PostUploadList | null,
    key: string | null
}> => {
    try {
        const tempPost = await PostUploadUserModel.findById(id);
        if (!tempPost) {
            return {isValid: false, tempPost: null, userData: null, postUploadListData: null, key: null};
        }

        const {userId, url} = tempPost;
        const userData = await UserModel.findById(userId);
        if (!userData) {
            return {isValid: false, tempPost: null, userData: null, postUploadListData: null, key: null};
        }

        const key = url.replaceAll(".", "_");
        const postUploadListData = userData.postUploadList.get(key);
        if (!postUploadListData) {
            return {isValid: false, tempPost: null, userData: null, postUploadListData: null, key: null};
        }

        return {isValid: true, tempPost, userData, postUploadListData, key};
    } catch (e) {
        console.error(e);
        return {isValid: false, tempPost: null, userData: null, postUploadListData: null, key: null};
    }
};

export const addPost = async (req: Request, res: Response) => {
    try {
        const {id, tags, files} = req.body as {
            id: string,
            tags: string[],
            files: { title: string, files: { name: string, type: string, content: string }[] }[],
        };

        if (!id || !tags || !files) {
            sendError(res, { message: "Invalid request", name: "client", errors: ["id, tags, files are required"] });
            return;
        }

        const {isValid, tempPost, userData, postUploadListData, key} = await isValidPost(id);
        if (!isValid || !tempPost || !userData || !postUploadListData || !key) {
            sendError(res, {message: "Invalid request", name: "client", errors: ["Invalid id"]});
            return;
        }

        const newPOst = new PostModel({
            userId: userData._id,
            title: tempPost.title,
            description: tempPost.description,
            tags,
            fileGroup: files.map(({title, files}) => ({
                title,
                files
            }))
        });

        await newPOst.save();
        updateUserPostLists(userData, key, postUploadListData, "postCompletedList");
        sendSuccess(res, {message: "Post added successfully"});
        PostUploadUserModel.findByIdAndDelete(id).catch(console.error);
        return;
    } catch (e) {
        console.error(e);
        sendError(res, {message: "Internal server error"});
    }
};

export const rejectPost = async (req: Request, res: Response) => {
    try {
        const {id, rejectRejoin} = req.body;
        if (!id || !id.trim() || typeof id !== "string" || !rejectRejoin || typeof rejectRejoin !== "string") {
            sendError(res, {message: "Invalid request", name: "client", errors: ["id is required"]});
            return;
        }

        const {isValid, tempPost, userData, postUploadListData, key} = await isValidPost(id);
        if (!isValid || !tempPost || !userData || !postUploadListData || !key) {
            sendError(res, {message: "Invalid request", name: "client", errors: ["Invalid id"]});
            return;
        }

        updateUserPostLists(userData, key, postUploadListData, "postRejectList");
        postUploadListData.timeLine = undefined;
        await userData.save();
        await PostUploadUserModel.findByIdAndDelete(id);
        sendSuccess(res, {message: "Post rejectPost successfully"});

        sendMailQueue({
            email: userData.email,
            data: {
                subject: "Post Rejected",
                text: `Your post with title ${postUploadListData.title} has been rejected.`,
                body: rejectRejoin
            }
        }).catch(console.error);
    } catch (e) {
        console.error(e);
        sendError(res, {message: "Internal server error"});
    }
};

export const postProspering = async (req: Request, res: Response) => {
    try {
        const id = req.query.id;
        const env = req.query.env;

        if (!id || typeof id !== "string" || !id.trim() || !env || typeof env !== "string" || !env.trim() || env !== "approved" && env !== "creating-files") {
            sendError(res, {message: "Invalid request", name: "client", errors: ["id, env is required"]});
            return;
        }

        const {isValid, tempPost, userData, postUploadListData, key} = await isValidPost(id);
        if (!isValid || !tempPost || !userData || !postUploadListData || !key) {
            sendError(res, {message: "Invalid request", name: "client", errors: ["Invalid id"]});
            return;
        }

        postUploadListData.progress = env;
        if(postUploadListData.timeLine) {
            if (env === "approved") {
                postUploadListData.timeLine.approved = new Date();
                postUploadListData.timeLine["creating-files"] = "processing";
            } else {
                postUploadListData.timeLine["creating-files"] = new Date();
                postUploadListData.timeLine.completed = "processing";
            }
        }

        userData.postUploadList.set(key, postUploadListData);
        await userData.save();
        sendSuccess(res, {message: "Post approved successfully"});
    } catch (e) {
        console.error(e);
        sendError(res, {message: "Internal server error"});
    }
};
