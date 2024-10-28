import {Request, Response} from 'express';
import axios from 'axios';
import {sendError, sendSuccess} from "../../utils";
import {UserToken} from "../../types/user";
import {PostUploadUserModel, UserModel} from "../../model";


async function isValidRepoUrl(url: string): Promise<boolean> {
    try {
        // Extract owner and repo from the URL
        const match = url.match(/github\.com\/([\w-]+)\/([\w-]+)(?:\.git)?$/);

        if (!match) {
            return false;
        }

        const [, owner, repo] = match;

        // GitHub API endpoint to check repo existence
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

        // Make a GET request to the GitHub API
        const response = await axios.get(apiUrl);

        // If status is 200, the repository exists
        return response.status === 200;
    } catch (error) {
        // If the error response status is 404, the repository doesn't exist
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return false;
        }
        // Re-throw any unexpected errors
        throw error;
    }
}

export const addNewPost = async (req: Request, res: Response) => {
    try {
        const {url, description} = req.body;
        if (!(await isValidRepoUrl(url))) {
            sendError(res, {message: "invalid url", name: "client"});
            return;
        }

        const user = req.User as UserToken;
        if (!user) {
            sendError(res, {message: "unauthorized", name: "client", errors:["user not found"]});
            return;
        }

        const userData = await UserModel.findById(user.id);
        if (!userData) {
            sendError(res, {message: "unauthorized", name: "client", errors:["user not found"]});
            return;
        }

        const newPost =  await PostUploadUserModel.create({
            userId: user.id,
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

