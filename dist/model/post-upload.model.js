"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PostUploadUserSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "user" },
    title: { type: String, required: true },
    description: { type: String, required: false },
    displayName: { type: String, required: true },
    url: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
});
const postUploadUserModel = (0, mongoose_1.model)("PostUploadUser", PostUploadUserSchema);
exports.default = postUploadUserModel;
