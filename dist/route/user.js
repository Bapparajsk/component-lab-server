"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middleware");
const user_1 = require("../controller/user");
const update_1 = require("../controller/update");
const user = (0, express_1.Router)();
// *Get user profile
user.get("/", middleware_1.userAuth, user_1.getUser);
// *Get user post
user.get("/post", middleware_1.userAuth, user_1.getUserPost);
// *Get user fans
user.get("/fans", middleware_1.userAuth, user_1.getFans);
user.patch("/update", middleware_1.userAuth, update_1.userUpdate);
user.patch("/update/email", middleware_1.userAuth, update_1.updateEmail);
user.post("/update/resend-otp", middleware_1.userAuth, update_1.resendOtp);
user.post("/update/verify-email", middleware_1.userAuth, update_1.verifyEmail);
exports.default = user;
