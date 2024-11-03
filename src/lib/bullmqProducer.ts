import {bullMq} from "../config";
import {ProducerForOtpQueue} from "../types/bullMq";

export const sendOtpQueue = async ({ email, otp }: ProducerForOtpQueue): Promise<boolean> => {
    try {
        console.log(email, otp, "OtpSend");
        await bullMq.OtpSendQueue.add("OtpSend", {email, otp}, {
            removeOnComplete: true,
            removeOnFail: true,
        });
        return true;
    } catch (e) {
        console.error("sendOtpQueue Field", e);
        return false;
    }
};

export const sendMailQueue = async ({email, data}: { email: string, data: any }): Promise<boolean> => {
    try {
        console.log(email, data, "sendMailQueue");
        
        return true;
    } catch (e) {
        console.error("sendOtpQueueToPhone Field", e);
        return false;
    }
};
