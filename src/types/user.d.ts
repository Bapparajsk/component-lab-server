import { Document, Schema } from "mongoose";

interface Links extends Document {
    title: string;
    url: string;
}

interface PostType extends Document {
    id: Schema.Types.ObjectId,
    title: string,
    tags?: [{title: string}],
}

interface Friends extends Document {
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
    links: Linkes[];
    posts: PostType[];
    followers: Friends[];
    following: Friends[];
    likedPosts: PostType[];
    liked: number;
    language: Links[];
    createdAt: Date;
    updatedAt: Date;
}

export  {
    Friends,
    IUser,
    Links,
    PostType
};
