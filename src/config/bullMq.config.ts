import { Queue, QueueOptions } from "bullmq";

const queueConfig: QueueOptions = {
    connection: {
        port: Number.parseInt(process.env.REDIS_PORT || "6379"), // Redis port
        host: process.env.REDIS_HOST || "127.0.0.1", // Redis host
    }
};

const OtpSendQueue = new Queue("OtpSend", queueConfig);
const MailSendQueue = new Queue("SendMail", queueConfig);

export default {
    OtpSendQueue,
    MailSendQueue
};
