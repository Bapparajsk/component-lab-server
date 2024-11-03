"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.login = void 0;
const utils_1 = require("../../utils"); // Assuming jwt.create, sendError, and sendSuccess are properly typed utility functions.
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) {
            (0, utils_1.sendError)(res, { errors: ["Admin credentials not set"] });
            return;
        }
        if (adminEmail !== email || adminPassword !== password) {
            (0, utils_1.sendError)(res, { errors: ["Invalid email or password"] });
            return;
        }
        const token = utils_1.jwt.create({ email }); // Assuming jwt.create returns a string token.
        (0, utils_1.sendSuccess)(res, { message: "Login successful", data: { token } });
    }
    catch (error) {
        console.error(error);
        (0, utils_1.sendError)(res, { errors: ["Unknown error"] });
    }
};
exports.login = login;
const validate = (req, res, next) => {
    const token = req.headers.token;
    if (!token) {
        throw new Error("Token is required");
    }
    const decoded = utils_1.jwt.verify(token);
    if (!decoded) {
        throw new Error("Invalid token");
    }
    next();
};
exports.validate = validate;
