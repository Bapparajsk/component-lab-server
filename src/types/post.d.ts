import { Document, Schema } from "mongoose";

export interface FileGroup extends Document {
    title: string,
    files: [{
        name: string,
        type: string,
        content: string,
    }],
}

export interface Post extends Document {
    userId: Schema.Types.ObjectId,
    title: string,
    description: string,
    content: string,
    likes: number,
    fileGroup: FileGroup[],
}
