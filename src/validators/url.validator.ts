import axios from "axios";

export const isValidRepoUrl = async (url: string): Promise<boolean> => {
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
        const response = await axios.get(apiUrl);

        // If status is 200, the repository exists
        return response.status === 200;
    } catch (error) {
        // If the error response status is 404, the repository doesn't exist
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return false;
        }
        // Re-throw any unexpected errors
        throw error;
    }
};
