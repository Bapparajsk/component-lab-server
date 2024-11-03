"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMailQueue = exports.sendOtpQueue = void 0;
const config_1 = require("../config");
const sendOtpQueue = async ({ email, otp }) => {
    try {
        console.log(email, otp, "OtpSend");
        await config_1.bullMq.OtpSendQueue.add("OtpSend", { email, otp }, {
            removeOnComplete: true,
            removeOnFail: true,
        });
        return true;
    }
    catch (e) {
        console.error("sendOtpQueue Field", e);
        return false;
    }
};
exports.sendOtpQueue = sendOtpQueue;
const sendMailQueue = async ({ email, data }) => {
    try {
        console.log(email, data, "sendMailQueue");
        return true;
    }
    catch (e) {
        console.error("sendOtpQueueToPhone Field", e);
        return false;
    }
};
exports.sendMailQueue = sendMailQueue;
