"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserDetails = exports.fetchUserFromDatabase = exports.fetchUser = exports.ShrinkUser = void 0;
const config_1 = require("../config");
const model_1 = require("../model");
const validators_1 = require("../validators");
const ShrinkUser = (user) => {
    return {
        id: user._id,
        name: user.name,
        displayName: user.displayName,
        gender: user.gender,
        description: user.description,
        userImage: user.userImage,
        links: user.links,
        followers: user.followers.size,
        following: user.following.size,
        likedPosts: user.likedPosts.size,
        language: user.language,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};
exports.ShrinkUser = ShrinkUser;
const fetchUser = async (id) => {
    try {
        let userFromCache = await config_1.redis.get(`get-user:${id}`);
        if (typeof userFromCache === "string") {
            userFromCache = JSON.parse(userFromCache);
            return [null, userFromCache];
        }
        userFromCache = await model_1.UserModel.findById(id);
        if (!userFromCache) {
            return ["User not found", null];
        }
        await config_1.redis.set(`get-user:${userFromCache._id}`, JSON.stringify((0, exports.ShrinkUser)(userFromCache)), "EX", 60 * 30); // 30 minutes
        return [null, userFromCache];
    }
    catch (e) {
        console.error(e);
        return ["Internal Server Error", null];
    }
};
exports.fetchUser = fetchUser;
const fetchUserFromDatabase = async (user) => {
    try {
        if (!user || !user.id) {
            return ["User not found", null];
        }
        const userData = await model_1.UserModel.findById(user.id);
        if (!userData)
            return ["User not found", null];
        return [null, userData];
    }
    catch (e) {
        console.error(e);
        return ["Internal Server Error", null];
    }
};
exports.fetchUserFromDatabase = fetchUserFromDatabase;
const updateUserDetails = async ({ env, body, id }) => {
    try {
        const user = await model_1.UserModel.findById(id);
        if (!user) {
            return ["User not found", null];
        }
        switch (env) {
            case "password": {
                const { oldPassword, newPassword } = body;
                if (!oldPassword || !newPassword) {
                    return ["Invalid request", null];
                }
                const idValidOldPassword = (0, validators_1.comparePassword)(oldPassword, user.password);
                if (!idValidOldPassword) {
                    return ["Invalid password", null];
                }
                const isValidNewPassword = (0, validators_1.isValidPassword)(newPassword);
                if (!isValidNewPassword) {
                    return ["Invalid new password", null];
                }
                user.password = newPassword;
                break;
            }
            case "displayName": {
                const { displayName } = body;
                if (!displayName) {
                    return ["Display name is required", null];
                }
                if (displayName.length < 3 || displayName.charAt(0) !== "@") {
                    return ["Display name must be at least 3 characters and start with @", null];
                }
                user.displayName = displayName;
                break;
            }
            case "gender": {
                const { gender } = body;
                if (!["he/him", "she/her"].includes(gender)) {
                    return ["Display name must be at least 3 characters and start with @", null];
                }
                user.gender = gender;
                break;
            }
            case "description": {
                const { description } = body;
                if (!description) {
                    return ["Description is required", null];
                }
                user.description = description;
                break;
            }
            case "links": {
                const { title, url } = body;
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
                user.links.push({ title, url });
                break;
            }
            default: {
                return ["Invalid request", null];
            }
        }
        await config_1.redis.set(`get-user:${id}`, JSON.stringify((0, exports.ShrinkUser)(user)), "EX", 60 * 30); // 30 minutes
        await user.save();
        return [null, "User updated successfully"];
    }
    catch (e) {
        console.error(e);
        return ["Internal Server Error", null];
    }
};
exports.updateUserDetails = updateUserDetails;
