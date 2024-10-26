import { Router } from "express";
import { userAuth } from "../middleware";
import { getUser } from "../controller/user";

const user = Router();

user.get("/",userAuth, getUser);

export default user;
