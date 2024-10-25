import { Response } from 'express';

type Data = {
    message: string;
    data?: any;
};

const sendSuccess = (res:Response, data: Data ) => {
    return res.status(200).json(data);
};

export default sendSuccess;
