import {model, Schema} from "mongoose";
import bcrypt from "bcrypt";
import {UserSchemas} from "../types";



const LinksSchema = new Schema<UserSchemas.Links>({
    title: {type: String, required: true},
    url: {type: String, required: true},
});

const PostTypeSchema = new Schema<UserSchemas.PostType>({
    id: {type: Schema.Types.ObjectId, required: true},
    title: {type: String, required: true},
    tags: [{title: {type: String}}],
});

const FriendsSchema = new Schema<UserSchemas.Friends>({
    id: {type: Schema.Types.ObjectId, required: true},
    displayName: {type: String, required: true},
    userImage: {type: String, required: true},
});

const UserSchema = new Schema<UserSchemas.IUser>({
    name: {type: String, required: true},
    displayName: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    userImage: {type: String, required: true},
    gender: {type: String, required: true},
    description: {type: String, required: true},
    links: {type: [LinksSchema], default: []},
    posts: {type: [PostTypeSchema], default: []},
    followers: {type: [FriendsSchema], default: []},
    following: {type: [FriendsSchema], default: []},
    likedPosts: {type: [PostTypeSchema], default: []},
    liked: {type: Number, default: 0},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});

UserSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    if (this.isModified("password")) {
        bcrypt.hash(this.password, 10, (err, hash) => {
            if (err) return next(err);
            this.password = hash;
            next();
        });
    } else {
        next();
    }
});

const userModel = model<UserSchemas.IUser>("User", UserSchema);

export default userModel;
