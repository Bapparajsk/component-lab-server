"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFriend = void 0;
const utils_1 = require("../../utils");
const user_1 = require("../../helper/user");
const getFriend = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            (0, utils_1.sendError)(res, { message: "missing id" });
            return;
        }
        const [error, friend] = await (0, user_1.fetchUser)(id);
        if (error || !friend) {
            (0, utils_1.sendError)(res, { message: "user not found", errors: [error] });
            return;
        }
        (0, utils_1.sendSuccess)(res, { message: "user found", data: { user: friend } });
    }
    catch (e) {
        console.error(e);
        (0, utils_1.sendError)(res, { message: "internal server error" });
    }
};
exports.getFriend = getFriend;
