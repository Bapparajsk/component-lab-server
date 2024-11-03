"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostSchema = exports.PostUploadUser = exports.UserSchemas = void 0;
const user_1 = __importDefault(require("./user"));
exports.UserSchemas = user_1.default;
const post_upload_user_1 = __importDefault(require("./post-upload-user"));
exports.PostUploadUser = post_upload_user_1.default;
const post_1 = __importDefault(require("./post"));
exports.PostSchema = post_1.default;
