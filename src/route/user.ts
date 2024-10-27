import {Router} from "express";
import {userAuth} from "../middleware";
import {getUser, getUserPost, getFans} from "../controller/user";
import { userUpdate } from "../controller/update";

const user = Router();

// *Get user profile
user.get("/", userAuth, getUser);

// *Get user post
user.get("/post", userAuth, getUserPost);

// *Get user fans
user.get("/fans", userAuth, getFans);

user.patch("/update", userAuth, userUpdate);

export default user;
