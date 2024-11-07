import { Worker, WorkerOptions } from 'bullmq';
import { sendEmail } from "../utils";

const connection = {
    port: Number.parseInt(process.env.REDIS_PORT || "6379"), // Redis port
    host: process.env.REDIS_HOST || "127.0.0.1", // Redis host
};

console.warn("Worker is running");

const workerOptions: WorkerOptions = {
    connection,
};

const worker = new Worker('OtpSend', async (job) => {
    console.log(job.data);
    
    const { email, otp } = job.data;
    await sendEmail(email, {
        subject: "OTP",
        text: `Your OTP is ${otp}`,
    });
}, workerOptions);


worker.on('failed', (job, err) => {
    console.log(`Job with ID ${job?.id} has failed: ${err.message}`);
});

