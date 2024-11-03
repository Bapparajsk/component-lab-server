"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidRepoUrl = void 0;
const axios_1 = __importDefault(require("axios"));
const isValidRepoUrl = async (url) => {
    try {
        // Extract owner and repo from the URL
        const match = url.match(/github\.com\/([\w-]+)\/([\w-]+)(?:\.git)?$/);
        if (!match) {
            return false;
        }
        const [, owner, repo] = match;
        // GitHub API endpoint to check repo existence
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
        // Make a GET request to the GitHub API
        const response = await axios_1.default.get(apiUrl);
        // If status is 200, the repository exists
        return response.status === 200;
    }
    catch (error) {
        // If the error response status is 404, the repository doesn't exist
        if (axios_1.default.isAxiosError(error) && error.response?.status === 404) {
            return false;
        }
        // Re-throw any unexpected errors
        throw error;
    }
};
exports.isValidRepoUrl = isValidRepoUrl;
