"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.post = exports.user = exports.auth = exports.admin = void 0;
const admin_1 = __importDefault(require("./admin"));
exports.admin = admin_1.default;
const authentication_1 = __importDefault(require("./authentication"));
exports.auth = authentication_1.default;
const user_1 = __importDefault(require("./user"));
exports.user = user_1.default;
const post_1 = __importDefault(require("./post"));
exports.post = post_1.default;
