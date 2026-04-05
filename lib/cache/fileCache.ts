import { getFileContent } from "@/lib/github/getFileContent";

const cache = new Map<string, string>();

export const fileCache = {
    get: (path: string): string | undefined => {
        return cache.get(path);
    },

    set: (path: string, content: string): void => {
        cache.set(path, content);
    },

    has: (path: string): boolean => {
        return cache.has(path);
    },

    fetchOrGet: async (
        owner: string,
        repo: string,
        path: string
    ): Promise<string> => {
        const cached = cache.get(path);
        if (cached !== undefined) {
            return cached;
        }

        const content = await getFileContent(owner, repo, path);
        cache.set(path, content);
        return content;
    },

    clear: (): void => {
        cache.clear();
    },
};
