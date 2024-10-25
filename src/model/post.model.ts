import {Schema, model} from "mongoose";
import { Post, FileGroup } from "../types/post";

const FileGroupSchema = new Schema<FileGroup>({
    title: {type: String, required: true},
    files: [{
        name: {type: String, required: true},
        type: {type: String, required: true},
        content: {type: String, required: true},
    }],
});

const PostSchema = new Schema<Post>({
    userId: {type: Schema.Types.ObjectId, required: true},
    title: {type: String, required: true},
    description: { type: String, required: true},
    content: {
        type: String,
        required: true,
    },
    likes: {
        type: Number,
        default: 0,
    },
    fileGroup: [FileGroupSchema],
});

const PostModel = model<Post>("Post", PostSchema);

export default PostModel;
