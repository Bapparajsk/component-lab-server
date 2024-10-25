import { NextFunction, Request, Response } from "express";
import { jwt, sendError, sendSuccess } from "../../utils"; // Assuming jwt.create, sendError, and sendSuccess are properly typed utility functions.

const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            throw new Error("Admin credentials are not set");
        }

        if (adminEmail !== email || adminPassword !== password) {
            throw new Error("Invalid email or password");
        }

        const token = jwt.create({ email }); // Assuming jwt.create returns a string token.
        sendSuccess(res, { message: "Login successful", data: { token } });
    } catch (error) {
        console.error(error);
        sendError(res, { errors: [error || "Unknown error"] });
    }
};

const validate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.token as string;
    if (!token) {
        throw new Error("Token is required");
    }
    
    const decoded = jwt.verify(token);
    if (!decoded) {
        throw new Error("Invalid token");
    }
    next();
};

export {
    login,
    validate
};