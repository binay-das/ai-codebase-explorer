import "server-only";

// import { getFileContent } from "@/lib/github/getFileContent";
import {
    getFileFromStorage,
    // storeFileToStorage,
} from "@/lib/storage/fileStorage";

const cache = new Map<string, string>();
const pending = new Map<string, Promise<string>>();

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

        const existingRequest = pending.get(cacheKey);
        if (existingRequest) {
            return existingRequest;
        }

        const request = getFileFromStorage(owner, repo, path)
            .then(async (storedContent) => {
                if (storedContent !== null) {
                    return storedContent;
                }

                // const content = await getFileContent(owner, repo, path);
                // await storeFileToStorage(owner, repo, path, content);
                // return content;
                throw new Error(`File not found in storage: ${owner}/${repo}/${path}`);
            })
            .then((content) => {
                cache.set(cacheKey, content);
                return content;
            })
            .finally(() => {
                pending.delete(cacheKey);
            });

        pending.set(cacheKey, request);
        return request;
    },

    clear: (): void => {
        cache.clear();
        pending.clear();
    },
};
