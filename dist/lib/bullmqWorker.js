"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const utils_1 = require("../utils");
const connection = {
    port: Number.parseInt(process.env.REDIS_PORT || "6379"), // Redis port
    host: process.env.REDIS_HOST || "127.0.0.1", // Redis host
};
const workerOptions = {
    connection,
};
const worker = new bullmq_1.Worker('OtpSend', async (job) => {
    console.log(job.data);
    const { email, otp } = job.data;
    await (0, utils_1.sendEmail)(email, {
        subject: "OTP",
        text: `Your OTP is ${otp}`,
    });
}, workerOptions);
worker.on('failed', (job, err) => {
    console.log(`Job with ID ${job?.id} has failed: ${err.message}`);
});
