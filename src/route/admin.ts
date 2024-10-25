import {Router} from "express";
import { login, validate, getUserList } from "../controller/admin";

const admin = Router();

admin.post("/login", login); // Assuming login is a properly typed controller function.
admin.get("/users", validate, getUserList); // Assuming validate and getUserList are properly typed controller functions.

export default admin;
