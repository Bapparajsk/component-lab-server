"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validData = void 0;
const email_1 = require("./email");
const password_1 = require("./password");
const validData = ({ name, displayName, email, password }) => {
    if (!name || !displayName || !email || !password) {
        return ["Name, displayName, email and password are required", false];
    }
    if (name.length < 3) {
        return ["Name must be at least 3 characters", false];
    }
    if (displayName.length < 3 || displayName.charAt(0) !== "@") {
        return ["Display name must be at least 3 characters and start with @", false];
    }
    if (!(0, email_1.isEmail)(email)) {
        return ["Email is invalid", false];
    }
    if (!(0, password_1.isValidPassword)(password)) {
        return ["Password is invalid", false];
    }
    return [null, true];
};
exports.validData = validData;
