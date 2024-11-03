import {getTransporter} from '../config';


export const sendEmail = async (email: string, data: any) => {
    try {
        const transporter = getTransporter();
        const mailOptions = {
            from:`"Component-lab" <codeking@code.com>`,
            to: email,
            ...data,
        };

        console.log("Sending email");
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
        
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
};
