import { Document } from "mongoose";

interface PostUploadUserTypes extends Document {
    displayName: string;
    url: string;
    uploadDate: Date;
}

export {
    PostUploadUserTypes
};
