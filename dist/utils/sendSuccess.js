"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendSuccess = (res, data) => {
    return res.status(200).json(data);
};
exports.default = sendSuccess;
