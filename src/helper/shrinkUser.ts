import { IUser } from '../types/user';

export const shrinkUser = (user: IUser) => {
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
