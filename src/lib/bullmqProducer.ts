import { bullMq } from "../config";
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
