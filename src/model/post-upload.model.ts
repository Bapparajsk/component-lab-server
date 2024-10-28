import { Schema, model } from "mongoose";
import {PostUploadUser} from "../types";

const PostUploadUserSchema = new Schema<PostUploadUser.PostUploadUserTypes>({
    userId: { type: Schema.Types.ObjectId, required: true, ref: "user" },
    description: { type: String, required: false },
    displayName: { type: String, required: true },
    url: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
});

const postUploadUserModel = model<PostUploadUser.PostUploadUserTypes>("PostUploadUser", PostUploadUserSchema);
export default postUploadUserModel;
