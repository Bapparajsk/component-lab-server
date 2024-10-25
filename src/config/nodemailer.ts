import { createTransport } from 'nodemailer';

export const getTransporter = () => {

    const TransporterUser = process.env.TRANSPORTER_USER;
    const TransporterPass = process.env.TRANSPORTER_PASS;

    if (!TransporterUser || !TransporterPass) {
        console.error("Transporter user or password not found");
        process.exit(1);
    }

    return createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: TransporterUser, pass: TransporterPass },
    });
};
