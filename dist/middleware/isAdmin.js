"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const utils_1 = require("../utils");
const isAdmin = (req, res, next) => {
    try {
        const token = req.headers.token;
        if (!token) {
            (0, utils_1.sendError)(res, { message: "Token is required", name: "client", });
            return;
        }
        const decoded = utils_1.jwt.verify(token);
        if (!decoded || typeof decoded !== "object" || decoded.email !== process.env.ADMIN_EMAIL) {
            (0, utils_1.sendError)(res, { message: "Invalid token", name: "client", });
            return;
        }
        next();
    }
    catch (e) {
        console.error(e);
        (0, utils_1.sendError)(res, { message: "Internal server error" });
    }
};
exports.isAdmin = isAdmin;
