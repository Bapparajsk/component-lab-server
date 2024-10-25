import {getTransporter} from '../config';


export const sendEmail = async (email: string, data: any) => {
    try {
        const transporter = getTransporter();
        const mailOptions = {
            from:`"Component-lab" <codeking@code.com>`,
            to: email,
            subject: data.subject,
            text: data
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
};
