import { IUser } from '../types/user';
import {redis} from '../config';
import {UserModel} from "../model";

export const ShrinkUser = (user: IUser) => {
    return {
        id: user._id,
        name: user.name,
        displayName: user.displayName,
        gender: user.gender,
        description: user.description,
        userImage: user.userImage,
        links: user.links,
        posts: user.posts,
        followers: user.followers.length,
        following: user.following.length,
        likedPosts: user.likedPosts.length,
        language: user.language,
    };
};

export const fetchUser = async (id: string): Promise<[string | null, IUser | null]> => {
    try {
        let userFromCache = await redis.get(`get-user:${id}`) as string | IUser | null;
        if (typeof userFromCache === "string") {
            userFromCache = JSON.parse(userFromCache) as IUser;
            return [null, userFromCache];
        }

        userFromCache = await UserModel.findById(id) as IUser;
        if (!userFromCache) {
            return ["User not found", null];
        }

        await redis.set(`get-user:${id}`, JSON.stringify(ShrinkUser(userFromCache)), "EX", 60 * 30); // 30 minutes
        return [null, userFromCache];
    } catch (e) {
        console.error(e);
        return ["Internal Server Error", null];
    }
};
