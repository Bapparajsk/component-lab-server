import { Request, Response } from 'express';
import { sendError, sendSuccess } from '../../utils';
import { PostUploadUserModel } from "../../model";
import { PostUploadUserTypes } from "../../types/post-upload-user";

const getUserList = async (req: Request, res: Response) => {
    try {
        const users = await PostUploadUserModel.find() as PostUploadUserTypes[];
        sendSuccess(res, { message: 'User list', data: { users } });
    } catch (e) {
        console.error(e);
        sendError(res, { errors: [e || 'Unknown error']});
    }
};

export {
    getUserList
};
