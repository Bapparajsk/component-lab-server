"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const create = (payload, options) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not set in .env file");
    }
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
const verify = (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not set in .env file");
    }
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.default = {
    create,
    verify
};
