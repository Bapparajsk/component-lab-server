import { Document, Schema } from "mongoose";

interface Links {
    title: string;
    url: string;
}


interface Friends{
    id: Schema.Types.ObjectId,
    displayName: string,
    userImage: string,
}

interface PostUploadList {
    id: string | null,
    title: string,
    url: string,
    description?: string,
    displayName: string,
    uploadDate: Date,
    verifyDate: Date | null,
    progress: "pending" | "approved" | "creating-files" | "completed" | "rejected";
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
    posts: Map<string | unknown, string>;
    followers: Friends[];
    following: Friends[];
    likedPosts: PostType[];
    postUploadList: Map<string, PostUploadList>;
    postCompletedList: Map<string, PostUploadList>;
    postRejectList: Map<string, PostUploadList>;
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
    UserToken,
    PostUploadList
};
