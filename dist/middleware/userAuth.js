"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuth = void 0;
const utils_1 = require("../utils");
const userAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            throw new Error("Unauthorized");
        }
        // Verify token
        const decoded = utils_1.jwt.verify(token);
        if (!decoded) {
            throw new Error("Unauthorized");
        }
        // Attach user to request object
        req.User = decoded;
        next();
    }
    catch (e) {
        console.error(e);
        (0, utils_1.sendError)(res, { name: "unauthorized", message: "Invalid token" });
    }
};
exports.userAuth = userAuth;
