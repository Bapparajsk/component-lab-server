import { Router } from "express";
import {userAuth} from "../middleware";
import {addNewPost, getPostsList, updatePost} from "../controller/post";

const post = Router();

post.post("/upload", userAuth, addNewPost);  // *Add new post

post.get("/list",userAuth, getPostsList);  // *Get posts list by user

post.patch("/update", userAuth, updatePost);  // *Update post by user (description, title)

export default post;
