"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const LinksSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
});
const PostTypeSchema = new mongoose_1.Schema({
    id: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
});
const FriendsSchema = new mongoose_1.Schema({
    id: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    displayName: { type: String, required: true },
    userImage: { type: String, required: true },
});
const PostUploadListSchema = new mongoose_1.Schema({
    id: { type: String, required: false },
    title: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String, required: false },
    displayName: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    verifyDate: { type: Date, default: null },
    progress: { type: String, required: true },
});
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    userImage: { type: String, required: false },
    gender: { type: String, required: false },
    description: { type: String, required: false },
    links: { type: [LinksSchema], default: [] },
    posts: { type: Map, of: String, default: new Map() },
    postUploadList: { type: Map, of: PostUploadListSchema, default: new Map() },
    postCompletedList: { type: Map, of: PostUploadListSchema, default: new Map() },
    postRejectList: { type: Map, of: PostUploadListSchema, default: new Map() },
    followers: { type: Map, of: FriendsSchema, default: new Map() },
    following: { type: Map, of: FriendsSchema, default: new Map() },
    likedPosts: { type: Map, of: String, default: new Map() },
    language: { type: [LinksSchema], default: [] },
    liked: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
UserSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    if (this.isModified("password")) {
        bcrypt_1.default.hash(this.password, 10, (err, hash) => {
            if (err)
                return next(err);
            this.password = hash;
            next();
        });
    }
    else {
        next();
    }
});
const userModel = (0, mongoose_1.model)("User", UserSchema);
exports.default = userModel;
