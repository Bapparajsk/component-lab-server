import { Router } from "express";
import {userAuth} from "../middleware";
import {addNewPost, getPostsList, updatePost, updateUrl} from "../controller/post";

const post = Router();

post.post("/upload", userAuth, addNewPost);  // *Add new post

post.get("/list",userAuth, getPostsList);  // *Get posts list by user

post.patch("/update", userAuth, updatePost);  // *Update post by user (description, title)

post.patch("/update-url", userAuth, updateUrl);  // *Update post url by user

export default post;
