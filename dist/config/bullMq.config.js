"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const queueConfig = {
    connection: {
        port: Number.parseInt(process.env.REDIS_PORT || "6379"), // Redis port
        host: process.env.REDIS_HOST || "127.0.0.1", // Redis host
    }
};
const OtpSendQueue = new bullmq_1.Queue("OtpSend", queueConfig);
const MailSendQueue = new bullmq_1.Queue("SendMail", queueConfig);
exports.default = {
    OtpSendQueue,
    MailSendQueue
};
