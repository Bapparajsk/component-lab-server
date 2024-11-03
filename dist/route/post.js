"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middleware");
const post_1 = require("../controller/post");
const post = (0, express_1.Router)();
post.post("/upload", middleware_1.userAuth, post_1.addNewPost); // *Add new post
post.get("/list", middleware_1.userAuth, post_1.getPostsList); // *Get posts list by user
post.patch("/update", middleware_1.userAuth, post_1.updatePost); // *Update post by user (description, title)
post.patch("/update-url", middleware_1.userAuth, post_1.updateUrl); // *Update post url by user
exports.default = post;
