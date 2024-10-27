import {Router} from "express";
import {userAuth} from "../middleware";
import {getUser, getUserPost, getFans} from "../controller/user";

const user = Router();

// *Get user profile
user.get("/", userAuth, getUser);

// *Get user post
user.get("/post", userAuth, getUserPost);

// *Get user fans
user.get("/fans", userAuth, getFans);

export default user;
