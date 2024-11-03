"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.OTP = exports.sendSuccess = exports.sendError = exports.jwt = void 0;
const token_1 = __importDefault(require("./token"));
exports.jwt = token_1.default;
const response_1 = require("./response");
Object.defineProperty(exports, "sendError", { enumerable: true, get: function () { return response_1.sendError; } });
Object.defineProperty(exports, "sendSuccess", { enumerable: true, get: function () { return response_1.sendSuccess; } });
const otp_1 = __importDefault(require("./otp"));
exports.OTP = otp_1.default;
const sendEmail_1 = require("./sendEmail");
Object.defineProperty(exports, "sendEmail", { enumerable: true, get: function () { return sendEmail_1.sendEmail; } });
