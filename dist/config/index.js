"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bullMq = exports.redis = exports.getTransporter = void 0;
const nodemailer_1 = require("./nodemailer");
Object.defineProperty(exports, "getTransporter", { enumerable: true, get: function () { return nodemailer_1.getTransporter; } });
const redis_config_1 = __importDefault(require("./redis.config"));
exports.redis = redis_config_1.default;
const bullMq_config_1 = __importDefault(require("./bullMq.config"));
exports.bullMq = bullMq_config_1.default;
