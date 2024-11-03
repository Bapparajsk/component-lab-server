"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransporter = void 0;
const nodemailer_1 = require("nodemailer");
const getTransporter = () => {
    const TransporterUser = process.env.TRANSPORTER_USER;
    const TransporterPass = process.env.TRANSPORTER_PASS;
    if (!TransporterUser || !TransporterPass) {
        console.error("Transporter user or password not found");
        process.exit(1);
    }
    return (0, nodemailer_1.createTransport)({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: TransporterUser, pass: TransporterPass },
    });
};
exports.getTransporter = getTransporter;
