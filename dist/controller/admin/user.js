"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserList = void 0;
const utils_1 = require("../../utils");
const model_1 = require("../../model");
const getUserList = async (req, res) => {
    try {
        const users = await model_1.PostUploadUserModel.find();
        (0, utils_1.sendSuccess)(res, { message: 'User list', data: { users } });
    }
    catch (e) {
        console.error(e);
        (0, utils_1.sendError)(res, { errors: ['Unknown error'] });
    }
};
exports.getUserList = getUserList;
