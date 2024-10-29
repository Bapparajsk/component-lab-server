import {Document, Schema} from "mongoose";

interface PostUploadUserTypes extends Document {
    userId: Schema.Types.ObjectId;
    title: string;
    description?: string;
    displayName: string;
    url: string;
    uploadDate: Date;
}

export {
    PostUploadUserTypes
};
