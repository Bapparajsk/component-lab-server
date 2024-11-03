"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = exports.PostUploadUserModel = exports.UserModel = void 0;
const user_model_1 = __importDefault(require("./user.model"));
exports.UserModel = user_model_1.default;
const post_upload_model_1 = __importDefault(require("./post-upload.model"));
exports.PostUploadUserModel = post_upload_model_1.default;
const post_model_1 = __importDefault(require("./post.model"));
exports.PostModel = post_model_1.default;
