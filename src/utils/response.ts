import { Response } from 'express';

type Data = {
    message: string;
    data?: any;
};

export const sendSuccess = (res:Response, data: Data ) => {
    return res.status(200).json(data);
};

type ErrorTypes = {
    name?: "server" | "client" | "unauthorized" | "notFound" | "forbidden";
    message?: string | null;
    errors?: any[];
}

export const sendError = (response: Response,{
    name = "server",
    message = "Internal Server Error",
    errors
}:ErrorTypes ) => {
    switch (name) {
        case "client":
            return response.status(400).json({ message, error: errors });
        case "unauthorized":
            return response.status(401).json({ message, error: errors });
        case "notFound":
            return response.status(404).json({ message, error: errors });
        case "forbidden":
            return response.status(403).json({ message, error: errors });
        default:
            return response.status(500).json({ message });
    }
};
