import { getFileContent } from "@/lib/github/getFileContent";

const cache = new Map<string, string>();

function toCacheKey(owner: string, repo: string, path: string): string {
    return `${owner}/${repo}:${path}`;
}

export const fileCache = {
    get: (owner: string, repo: string, path: string): string | undefined => {
        return cache.get(toCacheKey(owner, repo, path));
    },

    set: (owner: string, repo: string, path: string, content: string): void => {
        cache.set(toCacheKey(owner, repo, path), content);
    },

    has: (owner: string, repo: string, path: string): boolean => {
        return cache.has(toCacheKey(owner, repo, path));
    },

    fetchOrGet: async (
        owner: string,
        repo: string,
        path: string
    ): Promise<string> => {
        const cacheKey = toCacheKey(owner, repo, path);
        const cached = cache.get(cacheKey);
        if (cached !== undefined) {
            return cached;
        }

        const content = await getFileContent(owner, repo, path);
        cache.set(cacheKey, content);
        return content;
    },

    clear: (): void => {
        cache.clear();
    },
};
