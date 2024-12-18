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
    timeLine?: {
        "upload": string,
        "approved": string,
        "creating-files": string,
        "completed": string,
    }
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
    followers: Map<string | unknown, Friends>;
    following: Map<string | unknown, Friends>;
    likedPosts: Map<string | unknown, string>;
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
