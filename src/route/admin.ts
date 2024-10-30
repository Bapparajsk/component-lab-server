import {Router} from "express";
import {getUserList, login} from "../controller/admin";
import {isAdmin} from "../middleware/isAdmin";
import {addPost, rejectPost, postProspering} from "../controller/admin/post";

const admin = Router();

// * Assuming login is a properly typed controller function.
admin.post("/login", login);

// * Assuming validate and getUserList are properly typed controller functions.
admin.get("/users", isAdmin, getUserList);

// * Assuming addPost is a properly typed controller function.
admin.post("/posts", isAdmin, addPost);

admin.patch("/posts/reject", isAdmin, rejectPost);

admin.patch("/posts/prospering", isAdmin, postProspering);

export default admin;
