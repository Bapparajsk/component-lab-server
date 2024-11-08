import {model, Schema} from "mongoose";
import bcrypt from "bcrypt";
import {UserSchemas} from "../types";


const LinksSchema = new Schema<UserSchemas.Links>({
    title: {type: String, required: true},
    url: {type: String, required: true},
});

const FriendsSchema = new Schema<UserSchemas.Friends>({
    id: {type: Schema.Types.ObjectId, required: true},
    displayName: {type: String, required: true},
    userImage: {type: String, required: true},
});

const PostUploadListSchema = new Schema<UserSchemas.PostUploadList>({
    id: {type: String, required: false},
    title: {type: String, required: true},
    url: {type: String, required: true},
    description: {type: String, required: false},
    displayName: {type: String, required: true},
    uploadDate: {type: Date, default: Date.now},
    verifyDate: {type: Date, default: null},
    progress: {type: String, required: true},
    timeLine: {
        upload: {type: String, default: "-"},
        approved: {type: String, default: "-"},
        "creating-files": {type: String, default: "-"},
        completed: {type: String, default: "-"},
    },
});

const UserSchema = new Schema<UserSchemas.IUser>({
    name: {type: String, required: true},
    displayName: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    userImage: {type: String, required: false},
    gender: {type: String, required: false},
    description: {type: String, required: false},
    links: {type: [LinksSchema], default: []},
    posts: {type: Map, of: String, default: new Map()},
    postUploadList: {type: Map, of: PostUploadListSchema, default: new Map()},
    postCompletedList: {type: Map, of: PostUploadListSchema, default: new Map()},
    postRejectList: {type: Map, of: PostUploadListSchema, default: new Map()},
    followers: {type: Map, of: FriendsSchema, default: new Map()},
    following: {type: Map, of: FriendsSchema, default: new Map()},
    likedPosts: {type: Map, of: String, default: new Map()},
    language: {type: [LinksSchema], default: []},
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
