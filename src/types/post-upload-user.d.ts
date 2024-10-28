import {Document, Schema} from "mongoose";

interface PostUploadUserTypes extends Document {
    userId: Schema.Types.ObjectId;
    description?: string;
    displayName: string;
    url: string;
    uploadDate: Date;
}

export {
    PostUploadUserTypes
};
