"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const FileGroupSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    files: [{
            name: { type: String, required: true },
            type: { type: String, required: true },
            content: { type: String, required: true },
        }],
});
const PostSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "user" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    likes: { type: Map, of: String, default: new Map() },
    codePreview: { type: Map, of: String, default: new Map() },
    fileGroup: [FileGroupSchema],
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
});
const PostModel = (0, mongoose_1.model)("Post", PostSchema);
exports.default = PostModel;
