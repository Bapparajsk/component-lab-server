"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPassword = exports.comparePassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const comparePassword = (password, hashedPassword) => {
    if (!password || !hashedPassword) {
        return false;
    }
    return bcrypt_1.default.compareSync(password, hashedPassword);
};
exports.comparePassword = comparePassword;
const isValidPassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber;
};
exports.isValidPassword = isValidPassword;
