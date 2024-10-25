import jwt, { SignOptions } from "jsonwebtoken";

const create = (payload: any, options?: SignOptions) => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not set in .env file");
    }

    return jwt.sign(payload, secret, { expiresIn: "1h",...options });
};

const verify = (token: string) => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not set in .env file");
    }

    return jwt.verify(token, secret);
};

export default {
    create,
    verify
};
