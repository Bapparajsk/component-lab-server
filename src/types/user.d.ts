import { Document, Schema } from "mongoose";

interface Links {
    title: string;
    url: string;
}

interface PostType {
    id: Schema.Types.ObjectId,
    title: string,
}

interface Friends{
    id: Schema.Types.ObjectId,
    displayName: string,
    userImage: string,
}

interface IUser extends Document {
    name: string;
    displayName: string;
    email: string;
    password: string;
    userImage: string;
    gender: "he/him" | "she/her";
    description: string;
    links: Links[];
    posts: PostType[];
    followers: Friends[];
    following: Friends[];
    likedPosts: PostType[];
    liked: number;
    language: Links[];
    createdAt: Date;
    updatedAt: Date;
}

interface UserToken {
    id: string;
    name: string;
}

export  {
    Friends,
    IUser,
    Links,
    PostType,
    UserToken
};
