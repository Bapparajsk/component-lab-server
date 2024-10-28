import { Router } from "express";
import {userAuth} from "../middleware";
import {addNewPost} from "../controller/post";

const post = Router();

post.post("/upload", userAuth, addNewPost);  // *Add new post

export default post;
