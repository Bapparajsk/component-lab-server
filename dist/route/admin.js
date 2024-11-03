"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_1 = require("../controller/admin");
const isAdmin_1 = require("../middleware/isAdmin");
const post_1 = require("../controller/admin/post");
const admin = (0, express_1.Router)();
// * Assuming login is a properly typed controller function.
admin.post("/login", admin_1.login);
// * Assuming validate and getUserList are properly typed controller functions.
admin.get("/users", isAdmin_1.isAdmin, admin_1.getUserList);
// * Assuming addPost is a properly typed controller function.
admin.post("/posts", isAdmin_1.isAdmin, post_1.addPost);
admin.patch("/posts/reject", isAdmin_1.isAdmin, post_1.rejectPost);
admin.patch("/posts/prospering", isAdmin_1.isAdmin, post_1.postProspering);
exports.default = admin;
