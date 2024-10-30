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
    likes: Map<string, string | Schema.Types.ObjectId>,
    codePreview: Map<string, string | Schema.Types.ObjectId>,
    fileGroup: FileGroup[],
    tags: string[],
    createdAt: Date,
}
