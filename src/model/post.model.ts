import {model, Schema} from "mongoose";
import {FileGroup, Post} from "../types/post";

const FileGroupSchema = new Schema<FileGroup>({
    title: {type: String, required: true},
    files: [{
        name: {type: String, required: true},
        type: {type: String, required: true},
        content: {type: String, required: true},
    }],
});

const PostSchema = new Schema<Post>({
    userId: {type: Schema.Types.ObjectId, required: true, ref: "user"},
    title: {type: String, required: true},
    description: {type: String, required: true},
    likes: {type: Map, of: String, default: new Map()},
    codePreview: {type: Map, of: String, default: new Map()},
    fileGroup: [FileGroupSchema],
    tags: [{type: String}],
    createdAt: {type: Date, default: Date.now},
});

const PostModel = model<Post>("Post", PostSchema);

export default PostModel;
