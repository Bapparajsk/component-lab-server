import { IUser } from '../types/user';
import {redis} from '../config';
import {UserModel} from "../model";
import {updateEnv} from "../types/userUpdate";
import {comparePassword, isValidPassword} from "../validators";

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

        await redis.set(`get-user:${userFromCache._id}`, JSON.stringify(ShrinkUser(userFromCache)), "EX", 60 * 30); // 30 minutes
        return [null, userFromCache];
    } catch (e) {
        console.error(e);
        return ["Internal Server Error", null];
    }
};

export const updateUserDetails = async ({env, body, id}: updateEnv): Promise<[string| null, string | null]> => {
    try {
        const user= await UserModel.findById(id);
        if (!user) {
            return ["User not found", null];
        }

        switch (env) {
            case "password": {
                const {oldPassword, newPassword} = body;

                if (!oldPassword || !newPassword) {
                    return ["Invalid request", null];
                }

                const idValidOldPassword = comparePassword(oldPassword, user.password);
                if (!idValidOldPassword) {
                    return ["Invalid password", null];
                }

                const isValidNewPassword = isValidPassword(newPassword);
                if (!isValidNewPassword) {
                    return ["Invalid new password", null];
                }

                user.password = newPassword;
                break;
            }
            case "displayName":{
                const {displayName} = body;
                if (!displayName) {
                    return ["Display name is required", null];
                }

                if (displayName.length < 3 || displayName.charAt(0) !== "@") {
                    return ["Display name must be at least 3 characters and start with @", null];
                }

                user.displayName = displayName;
                break;
            }
            case "gender":{
                const {gender} = body;

                if (!["he/him", "she/her"].includes(gender)) {
                    return ["Display name must be at least 3 characters and start with @", null];
                }

                user.gender = gender;
                break;
            }
            case "description":{
                const {description} = body;

                if (!description) {
                    return ["Description is required", null];
                }

                user.description = description;
                break;
            }
            case "links":{
                const { title, url } = body as {title: string, url: string};

                if (!title || !url) {
                    return ["Title and url are required", null];
                }

                if (user.links.length >= 5) {
                    return ["You can only add 5 links", null];
                }

                for (const li of user.links) {
                    if (li.title === title || li.url === url) {
                        return ["Title already exists", null];
                    }
                }

                user.links.push({title, url});
                break;
            }
            default: {
                return ["Invalid request", null];
            }
        }

        await redis.set(`get-user:${id}`, JSON.stringify(ShrinkUser(user)), "EX", 60 * 30); // 30 minutes
        await user.save();
        return [null, "User updated successfully"];
    } catch (e) {
        console.error(e);
        return ["Internal Server Error", null];
    }
};
