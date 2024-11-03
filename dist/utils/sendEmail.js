"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const config_1 = require("../config");
const sendEmail = async (email, data) => {
    try {
        const transporter = (0, config_1.getTransporter)();
        const mailOptions = {
            from: `"Component-lab" <codeking@code.com>`,
            to: email,
            ...data,
        };
        console.log("Sending email");
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
};
exports.sendEmail = sendEmail;
