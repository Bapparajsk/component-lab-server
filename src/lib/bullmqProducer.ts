import {bullMq} from "../config";
import {ProducerForOtpQueue} from "../types/bullMq";

export const sendOtpQueue = async ({ email, otp }: ProducerForOtpQueue): Promise<boolean> => {
    try {
        await bullMq.OtpSendQueue.add("OtpSendToEmail", {email, otp});
        return true;
    } catch (e) {
        console.error("sendOtpQueue Field", e);
        return false;
    }
};

export const sendMailQueue = async ({email, data}: { email: string, data: any }): Promise<boolean> => {
    try {
        await bullMq.MailSendQueue.add("MailSendToEmail", {email, data});
        return true;
    } catch (e) {
        console.error("sendOtpQueueToPhone Field", e);
        return false;
    }
};
